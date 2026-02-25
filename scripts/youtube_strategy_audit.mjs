import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveConcreteTheme } from "../build/theme/tokenResolver.js";
import { compileTemplateSpec } from "../build/templates/compiler.js";
import { validateSpec } from "../build/render/validate.js";
import { prepareSlides, computeRegionBBox } from "../build/render/slide.js";
import { resolveGeometryV1 } from "../build/render/geometry.js";
import { EPSILON_INCHES, SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES } from "../build/render/utils/units.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALIGN_EPS = 0.1;
const MARGIN_EPS = 0.05;

function writeJson(outPath, data) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function computeDiagramBBox(slide) {
  let bbox = null;
  slide.elements.forEach((el) => {
    if (el.kind === "node" && el.bbox) {
      bbox = unionBoxes(bbox, el.bbox);
    } else if ((el.kind === "edge" || el.kind === "connector") && el.lineRect) {
      bbox = unionBoxes(bbox, el.lineRect);
    }
  });
  return bbox;
}

function unionBoxes(current, next) {
  if (!current) return { ...next };
  const x0 = Math.min(current.x, next.x);
  const y0 = Math.min(current.y, next.y);
  const x1 = Math.max(current.x + current.width, next.x + next.width);
  const y1 = Math.max(current.y + current.height, next.y + next.height);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

function parseSlideFromError(msg) {
  const match = String(msg).match(/Slide\s+(\d+)/i);
  if (!match) return null;
  const idx = Number.parseInt(match[1], 10);
  return Number.isFinite(idx) ? idx : null;
}

function main() {
  const [specPath, auditOut] = process.argv.slice(2);
  if (!specPath || !auditOut) {
    console.error("Usage: node scripts/youtube_strategy_audit.mjs <specPath> <outPath>");
    process.exit(1);
  }

  const rawSpec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  const theme = resolveConcreteTheme({ themeInput: rawSpec.theme, styleTokensInput: rawSpec.styleTokens });

  const compiled = compileTemplateSpec({ spec: rawSpec, theme, strict: true });
  if (compiled.errors?.length || !compiled.spec) {
    console.error("Spec validation failed:");
    (compiled.errors || []).forEach((e) => console.error(e));
    process.exit(1);
  }

  const validation = validateSpec(compiled.spec, true);
  if (!validation.valid) {
    console.error("Validation failed:");
    validation.errors.forEach((e) => console.error(e));
    process.exit(1);
  }

  const warnings = [];
  const hardErrors = [];
  const validationReport = [];
  const preparedSlides = prepareSlides({
    spec: compiled.spec,
    theme,
    baseDir: path.dirname(specPath),
    allowOverflow: false,
    allowDenseCharts: false,
    validationReport,
    warnings,
    hardErrors,
  });

  if (hardErrors.length > 0) {
    console.error("Hard errors during prepareSlides:");
    hardErrors.forEach((e) => console.error(e));
    process.exit(1);
  }

  resolveGeometryV1({ slides: preparedSlides, warnings, hardErrors });
  if (hardErrors.length > 0) {
    console.error("Hard errors during resolveGeometryV1:");
    hardErrors.forEach((e) => console.error(e));
    process.exit(1);
  }

  const audit = {
    spec_path: specPath,
    overflow: { slides: [], hard_errors: [], ok: true },
    alignment: { slides: [], ok: true },
    layout: { shrink: 0, truncate: 0, entries: [] },
    ok: true,
  };

  const overflowBySlide = new Map();
  validationReport.forEach((entry) => {
    if (entry.action_taken && entry.action_taken !== "none") {
      audit.layout.entries.push({
        slide: entry.slide_index,
        element_index: entry.element_index,
        element_type: entry.element_type,
        region: entry.region,
        action: entry.action_taken,
        details: entry.details,
      });
      if (entry.action_taken === "shrink") {
        audit.layout.shrink += 1;
      }
      if (entry.action_taken === "truncate") {
        audit.layout.truncate += 1;
      }
    }
    if (entry.overflow?.width || entry.overflow?.height) {
      const idx = entry.slide_index;
      if (!overflowBySlide.has(idx)) overflowBySlide.set(idx, []);
      overflowBySlide.get(idx).push(entry);
    }
  });

  hardErrors.forEach((msg) => {
    if (!String(msg).toLowerCase().includes("overflow")) return;
    const slideIdx = parseSlideFromError(msg);
    audit.overflow.hard_errors.push({ slide: slideIdx, message: msg });
  });

  preparedSlides.forEach((slide, index) => {
    const slideIndex = index + 1;
    const specSlide = compiled.spec.slides[index];
    const overflowEntries = overflowBySlide.get(slideIndex) || [];
    const boundsViolations = [];

    slide.elements.forEach((el) => {
      if (!el.bbox) return;
      const x0 = el.bbox.x;
      const y0 = el.bbox.y;
      const x1 = el.bbox.x + el.bbox.width;
      const y1 = el.bbox.y + el.bbox.height;
      if (
        x0 < -EPSILON_INCHES ||
        y0 < -EPSILON_INCHES ||
        x1 > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
        y1 > SLIDE_HEIGHT_INCHES + EPSILON_INCHES
      ) {
        boundsViolations.push({
          element: el.kind,
          region: el.region,
          bbox: el.bbox,
        });
      }
    });

    if (overflowEntries.length || boundsViolations.length) {
      audit.overflow.ok = false;
    }
    audit.overflow.slides.push({
      slide: slideIndex,
      overflow_entries: overflowEntries,
      bounds_violations: boundsViolations,
    });

    const regionEntries = Object.entries(specSlide?.regions || {});
    const regionBBoxes = regionEntries.map(([name, region]) => ({
      name,
      bbox: computeRegionBBox(region, specSlide.grid),
    }));
    const leftMargin = regionBBoxes.reduce((min, entry) => Math.min(min, entry.bbox.x), Number.POSITIVE_INFINITY);
    const rightMargin = regionBBoxes.reduce(
      (min, entry) => Math.min(min, SLIDE_WIDTH_INCHES - (entry.bbox.x + entry.bbox.width)),
      Number.POSITIVE_INFINITY
    );
    const headerRegions = regionBBoxes.filter((entry) => {
      const lower = entry.name.toLowerCase();
      return lower.includes("title") || lower.includes("header");
    });
    const headerLeft =
      headerRegions.length > 0 ? Math.min(...headerRegions.map((entry) => entry.bbox.x)) : leftMargin;

    const alignmentIssues = [];
    if (Number.isFinite(leftMargin) && Number.isFinite(rightMargin)) {
      const marginDelta = Math.abs(leftMargin - rightMargin);
      if (marginDelta > MARGIN_EPS) {
        alignmentIssues.push(`margin_delta_in_${marginDelta.toFixed(3)}`);
      }
    }

    slide.elements.forEach((el) => {
      if (el.kind === "text") {
        if (el.textStyle?.align && el.textStyle.align !== "left") {
          alignmentIssues.push(`text_align_not_left region=${el.region}`);
        }
      }
      if (el.kind === "table" && el.bbox) {
        const centerX = el.bbox.x + el.bbox.width / 2;
        const slideCenter = SLIDE_WIDTH_INCHES / 2;
        const centered = Math.abs(centerX - slideCenter) <= ALIGN_EPS;
        const leftAligned = Math.abs(el.bbox.x - headerLeft) <= ALIGN_EPS;
        if (!centered && !leftAligned) {
          alignmentIssues.push(`table_alignment_off region=${el.region}`);
        }
      }
    });

    const diagramBBox = computeDiagramBBox(slide);
    if (diagramBBox) {
      const centerX = diagramBBox.x + diagramBBox.width / 2;
      const slideCenter = SLIDE_WIDTH_INCHES / 2;
      const centered = Math.abs(centerX - slideCenter) <= ALIGN_EPS;
      const leftAligned = Math.abs(diagramBBox.x - headerLeft) <= ALIGN_EPS;
      if (!centered && !leftAligned) {
        alignmentIssues.push("diagram_alignment_off");
      }
    }

    if (alignmentIssues.length > 0) {
      audit.alignment.ok = false;
    }
    audit.alignment.slides.push({
      slide: slideIndex,
      left_margin_in: Number.isFinite(leftMargin) ? Number(leftMargin.toFixed(3)) : null,
      right_margin_in: Number.isFinite(rightMargin) ? Number(rightMargin.toFixed(3)) : null,
      header_left_in: Number.isFinite(headerLeft) ? Number(headerLeft.toFixed(3)) : null,
      issues: alignmentIssues,
    });
  });

  if (!audit.overflow.ok || !audit.alignment.ok) {
    audit.ok = false;
  }

  writeJson(auditOut, audit);

  if (!audit.ok) {
    console.error("Audit failed");
    process.exit(1);
  }
}

main();
