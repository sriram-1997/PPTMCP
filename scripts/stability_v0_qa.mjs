import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { resolveConcreteTheme } from "../build/theme/tokenResolver.js";
import { compileTemplateSpec } from "../build/templates/compiler.js";
import { validateSpec } from "../build/render/validate.js";
import { prepareSlides } from "../build/render/slide.js";
import { resolveGeometryV1 } from "../build/render/geometry.js";
import { EPSILON_INCHES, SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES } from "../build/render/utils/units.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIN_BODY_FONT_PT = 14;
const MIN_TITLE_FONT_PT = 24;
const LIST_ALIGN_EPS = 0.01;
const FONT_VARIANCE_WARN = 5;

const MIN_UTIL_CHART = 0.25;
const MIN_UTIL_DIAGRAM = 0.25;
const MIN_UTIL_TABLE = 0.25;
const WARN_UTIL_CARD_LIST = 0.35;
const WARN_UTIL_CHEVRON = 0.35;
const DIAGRAM_CENTER_EPS_PT = 2;
const THEME_MIN_BODY = 4.5;
const THEME_MIN_UI = 3.0;
const FLOW_SIZE_EPS = 0.01;
const FLOW_CENTER_EPS = 0.02;
const FLOW_GAP_WARN_RATIO = 0.12;
const CHEVRON_INTERLOCK_MIN_RATIO = 0.02;

function writeJson(outPath, data) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function unionBoxes(current, next) {
  if (!current) return { ...next };
  const x0 = Math.min(current.x, next.x);
  const y0 = Math.min(current.y, next.y);
  const x1 = Math.max(current.x + current.width, next.x + next.width);
  const y1 = Math.max(current.y + current.height, next.y + next.height);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

function computeDiagramBBox(slide) {
  let bbox = null;
  slide.elements.forEach((el) => {
    if (el.kind === "node") {
      bbox = unionBoxes(bbox, el.bbox);
    } else if (el.kind === "edge" && el.lineRect) {
      bbox = unionBoxes(bbox, el.lineRect);
    } else if (el.kind === "connector" && el.lineRect) {
      bbox = unionBoxes(bbox, el.lineRect);
    } else if (el.kind === "callout") {
      bbox = unionBoxes(bbox, el.box);
      if (el.leaderRect) {
        bbox = unionBoxes(bbox, el.leaderRect);
      }
    }
  });
  return bbox;
}

function scanBackslashN(pptxPath) {
  const script = path.join(__dirname, "stability_v0_text_scan.py");
  try {
    const output = execFileSync("python", [script, pptxPath], { encoding: "utf-8" });
    return JSON.parse(output);
  } catch (err) {
    return { error: String(err), matches: [] };
  }
}

function normalizeHex(value) {
  if (!value) return "";
  return String(value).replace("#", "").toUpperCase();
}

function hexToRgb(hex) {
  const cleaned = normalizeHex(hex);
  if (cleaned.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(foreground, background) {
  const lum1 = luminance(foreground);
  const lum2 = luminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function distanceToBoxPerimeter(point, box) {
  const x0 = box.x;
  const x1 = box.x + box.width;
  const y0 = box.y;
  const y1 = box.y + box.height;
  const clampedX = Math.min(Math.max(point.x, x0), x1);
  const clampedY = Math.min(Math.max(point.y, y0), y1);
  const insideX = point.x >= x0 && point.x <= x1;
  const insideY = point.y >= y0 && point.y <= y1;
  if (insideX && insideY) {
    const distLeft = Math.abs(point.x - x0);
    const distRight = Math.abs(x1 - point.x);
    const distTop = Math.abs(point.y - y0);
    const distBottom = Math.abs(y1 - point.y);
    return Math.min(distLeft, distRight, distTop, distBottom);
  }
  const dx = point.x - clampedX;
  const dy = point.y - clampedY;
  return Math.hypot(dx, dy);
}

function isPointNearBoxPerimeter(point, box, eps) {
  return distanceToBoxPerimeter(point, box) <= eps;
}

function computeUtilization(preparedSlides) {
  const report = { slides: [], errors: [], warnings: [] };

  preparedSlides.forEach((slide, idx) => {
    const slideEntry = { slide: idx + 1, elements: [], errors: [], warnings: [] };

    slide.elements.forEach((el) => {
      let util = null;
      let severity = null;
      let category = null;

      if (el.kind === "chart") {
        category = "chart";
        util = 1;
        if (util < MIN_UTIL_CHART) {
          severity = "error";
        }
      } else if (el.kind === "table") {
        category = "table";
        const usedHeight = (el.style?.rowHeightsInches || []).reduce((sum, v) => sum + v, 0);
        util = el.bbox.height > 0 ? usedHeight / el.bbox.height : 0;
        if (util < MIN_UTIL_TABLE) {
          severity = "error";
        }
      } else if (el.kind === "list") {
        category = "list";
        const usedHeight = el.totalHeightPt / 72;
        util = el.bbox.height > 0 ? usedHeight / el.bbox.height : 0;
        if (util < WARN_UTIL_CARD_LIST) {
          severity = "warn";
        }
      } else if (el.kind === "card") {
        category = "card";
        const inner = el.metrics?.innerHeightPt ?? 0;
        const used = el.metrics?.contentHeightPt ?? 0;
        util = inner > 0 ? used / inner : 0;
        if (util < WARN_UTIL_CARD_LIST) {
          severity = "warn";
        }
      } else if (el.kind === "chevron_flow") {
        category = "chevron";
        const group = el.metrics?.groupBBox;
        if (group) {
          const area = group.width * group.height;
          const regionArea = el.bbox.width * el.bbox.height;
          util = regionArea > 0 ? area / regionArea : 0;
        } else {
          util = 0;
        }
        if (util < WARN_UTIL_CHEVRON) {
          severity = "warn";
        }
      }

      if (category && util !== null) {
        const entry = {
          type: category,
          region: el.region,
          utilization: Number(util.toFixed(4)),
          severity: severity || "ok",
        };
        slideEntry.elements.push(entry);
        if (severity === "error") {
          const msg = `Slide ${idx + 1} ${category} utilization ${entry.utilization}`;
          slideEntry.errors.push(msg);
          report.errors.push(msg);
        } else if (severity === "warn") {
          const msg = `Slide ${idx + 1} ${category} utilization ${entry.utilization}`;
          slideEntry.warnings.push(msg);
          report.warnings.push(msg);
        }
      }
    });

    const diagramBBox = computeDiagramBBox(slide);
    const hasDiagram = slide.elements.some((el) => el.kind === "node" || el.kind === "edge");
    if (diagramBBox && slide.diagramRegionBBox && hasDiagram) {
      const region = slide.diagramRegionBBox;
      const regionArea = region.width * region.height;
      const diagramArea = diagramBBox.width * diagramBBox.height;
      const util = regionArea > 0 ? diagramArea / regionArea : 0;
      const entry = {
        type: "diagram",
        region: slide.diagramRegionId || "diagram",
        utilization: Number(util.toFixed(4)),
        severity: util < MIN_UTIL_DIAGRAM ? "error" : "ok",
      };
      slideEntry.elements.push(entry);
      if (util < MIN_UTIL_DIAGRAM) {
        const msg = `Slide ${idx + 1} diagram utilization ${entry.utilization}`;
        slideEntry.errors.push(msg);
        report.errors.push(msg);
      }
    }

    report.slides.push(slideEntry);
  });

  return report;
}

function stepIndexFromRegion(region) {
  const match = String(region).match(/^step_(\d+)$/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function computeFlowReport(preparedSlides) {
  const report = { flows: [] };

  preparedSlides.forEach((slide, idx) => {
    slide.elements.forEach((el) => {
      if (el.kind !== "chevron_flow") return;
      const steps = (el.steps || []).map((step, index) => ({
        index,
        bbox: step.bbox,
      }));
      const sorted = steps.slice().sort((a, b) => a.bbox.x - b.bbox.x);
      const gaps = [];
      for (let i = 0; i < sorted.length - 1; i += 1) {
        const prev = sorted[i].bbox;
        const next = sorted[i + 1].bbox;
        gaps.push(next.x - (prev.x + prev.width));
      }
      const gapX = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      report.flows.push({
        slide: idx + 1,
        kind: "chevron_flow",
        region: el.region,
        regionBBox: el.bbox,
        layoutProfile: el.layoutProfile || null,
        stepCount: steps.length,
        stepW: steps[0]?.bbox.width ?? 0,
        stepH: steps[0]?.bbox.height ?? 0,
        gapX,
        steps,
      });
    });

    const cardSteps = slide.elements
      .filter((el) => el.kind === "card")
      .map((el) => ({ el, index: stepIndexFromRegion(el.region) }))
      .filter((entry) => entry.index !== null);

    if (cardSteps.length >= 2) {
      cardSteps.sort((a, b) => a.index - b.index);
      const steps = cardSteps.map((entry) => ({
        index: entry.index,
        region: entry.el.region,
        bbox: entry.el.bbox,
        layoutProfile: entry.el.layoutProfile || null,
        metrics: entry.el.metrics || null,
      }));
      const sorted = steps.slice().sort((a, b) => a.bbox.x - b.bbox.x);
      const gaps = [];
      for (let i = 0; i < sorted.length - 1; i += 1) {
        const prev = sorted[i].bbox;
        const next = sorted[i + 1].bbox;
        gaps.push(next.x - (prev.x + prev.width));
      }
      const gapX = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const connectors = slide.elements
        .filter((el) => el.kind === "connector")
        .map((el) => {
          const start = el.start;
          const end = el.end;
          const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
          return {
            id: el.id,
            start,
            end,
            widthPt: el.style?.widthPt ?? 0,
            lengthIn,
          };
        });
      const explicitProfile = steps.some((step) => Boolean(step.layoutProfile));
      report.flows.push({
        slide: idx + 1,
        kind: "card_flow",
        region: slide.diagramRegionId || "canvas",
        regionBBox: slide.diagramRegionBBox || null,
        layoutProfile: explicitProfile ? "flow.card" : null,
        profileExplicit: explicitProfile,
        stepCount: steps.length,
        stepW: steps[0]?.bbox.width ?? 0,
        stepH: steps[0]?.bbox.height ?? 0,
        gapX,
        steps,
        connectors,
      });
    }
  });

  return report;
}

function isBodyRegion(region) {
  const lower = region.toLowerCase();
  if (lower.includes("title") || lower.includes("header")) return false;
  if (lower.includes("subtitle") || lower.includes("caption") || lower.includes("footer") || lower.includes("note")) return false;
  return true;
}

function buildQaReport(preparedSlides, utilizationReport, theme, backslashReport, flowReport) {
  const qa = { errors: [], warnings: [], checks: {} };

  const surfaceChecks = [
    { slot: "background", color: theme.surfaces.background.fill },
    { slot: "surface", color: theme.surfaces.surface.fill },
    { slot: "elevated", color: theme.surfaces.elevated.fill },
    { slot: "accent", color: theme.surfaces.accent.fill },
  ];
  surfaceChecks.forEach((surface) => {
    const ratio = contrastRatio(theme.text.colorPrimary, surface.color);
    if (ratio < THEME_MIN_BODY) {
      qa.errors.push(`theme_contrast_violation (text.body vs surface.${surface.slot})`);
    }
  });
  const iconRatio = contrastRatio(theme.text.colorSecondary, theme.slide.background);
  if (iconRatio < THEME_MIN_UI) {
    qa.warnings.push("icon_visibility_risk");
  }
  const accentLayerRatio = contrastRatio(theme.surfaces.accent.fill, theme.surfaces.elevated.fill);
  if (accentLayerRatio < THEME_MIN_UI) {
    qa.warnings.push("accent_layering_visibility");
  }
  const connectorRatio = contrastRatio(theme.connector.stroke, theme.slide.background);
  if (connectorRatio < THEME_MIN_UI) {
    qa.warnings.push("connector_visibility");
  }

  // Utilization errors
  if (utilizationReport.errors.length > 0) {
    utilizationReport.errors.forEach((e) => qa.errors.push(`utilization_error: ${e}`));
  }
  utilizationReport.warnings.forEach((w) => qa.warnings.push(`utilization_warn: ${w}`));

  if (backslashReport) {
    if (backslashReport.error) {
      qa.errors.push(`literal_backslash_n_detected scan_failed: ${backslashReport.error}`);
    }
    (backslashReport.matches || []).forEach((match) => {
      const snippet = match.snippet || match.text || "";
      qa.errors.push(`literal_backslash_n_detected slide_${match.slide}: ${snippet}`);
    });
  }

  // Numbered list inline + list alignment
  preparedSlides.forEach((slide, idx) => {
    const listMetrics = [];
    slide.elements.forEach((el) => {
      if (el.kind === "list") {
        const style = el.bulletStyle?.style;
        const metrics = el.metrics || {};
        if (style === "number" && metrics.numberedInline !== true) {
          qa.errors.push(`slide_${idx + 1}: numbered_list_not_inline`);
        }
        if (typeof metrics.textStartX === "number") {
          listMetrics.push({ style, textStartX: metrics.textStartX });
        }
        if (el.textStyle?.fontSize < MIN_BODY_FONT_PT) {
          qa.errors.push(`slide_${idx + 1}: list_font_below_min ${el.textStyle.fontSize}`);
        }
      }
      if (el.kind === "text") {
        if (isBodyRegion(el.region) && el.fontSize < MIN_BODY_FONT_PT) {
          qa.errors.push(`slide_${idx + 1}: body_font_below_min ${el.fontSize}`);
        }
        const lower = el.region.toLowerCase();
        if ((lower.includes("title") || lower.includes("header")) && el.fontSize < MIN_TITLE_FONT_PT) {
          qa.errors.push(`slide_${idx + 1}: title_font_below_min ${el.fontSize}`);
        }
      }
      if (el.kind === "card") {
        (el.body || []).forEach((listLayout) => {
          if (listLayout.textStyle?.fontSize < MIN_BODY_FONT_PT) {
            qa.errors.push(`slide_${idx + 1}: card_body_font_below_min ${listLayout.textStyle.fontSize}`);
          }
        });
        const inner = el.metrics?.innerHeightPt ?? 0;
        const used = el.metrics?.contentHeightPt ?? 0;
        const density = inner > 0 ? used / inner : 0;
        const verticalFill = density;
        if (density < WARN_UTIL_CARD_LIST || verticalFill < WARN_UTIL_CARD_LIST) {
          qa.warnings.push(`slide_${idx + 1}: card_density_warn ${el.region} density=${density.toFixed(4)} vertical_fill=${verticalFill.toFixed(4)}`);
        }
      }
      if (el.kind === "chevron_flow") {
        const stepCount = el.metrics?.stepCount ?? el.steps?.length ?? 0;
        if (!el.steps || el.steps.length !== stepCount) {
          qa.errors.push(`slide_${idx + 1}: chevron_shape_count_mismatch`);
        }
        if (Array.isArray(el.steps)) {
          el.steps.forEach((step) => {
            if (!step.points || step.points.length < 4) {
              qa.errors.push(`slide_${idx + 1}: chevron_shape_count_mismatch`);
            }
            if (step.textOverflow) {
              qa.errors.push(`slide_${idx + 1}: chevron_text_overflow`);
            }
            if (step.icon) {
              const iconPt = Math.min(step.icon.bbox.width, step.icon.bbox.height) * 72;
              if (iconPt < theme.chevron.step.iconMinSizePt - 0.01) {
                qa.errors.push(`slide_${idx + 1}: chevron_icon_too_small ${iconPt.toFixed(2)}pt`);
              }
            }
          });
        }
        const group = el.metrics?.groupBBox;
        if (group) {
          const regionArea = el.bbox.width * el.bbox.height;
          const groupArea = group.width * group.height;
          const util = regionArea > 0 ? groupArea / regionArea : 0;
          if (util < WARN_UTIL_CHEVRON) {
            qa.warnings.push(`slide_${idx + 1}: chevron_underutilized ${util.toFixed(4)}`);
          }
        }
        if (Array.isArray(el.steps) && el.steps.length > 0) {
          const stepWidth = el.steps[0].bbox.width;
          if (stepWidth > 0 && el.metrics?.tipIn && el.metrics?.notchIn) {
            const tipRatio = el.metrics.tipIn / stepWidth;
            const notchRatio = el.metrics.notchIn / stepWidth;
            if (tipRatio < 0.12 || notchRatio < 0.10) {
              qa.warnings.push(`slide_${idx + 1}: chevron_geometry_too_shallow`);
            }
          }
        }
      }
      if (el.kind === "node" && el.icon) {
        const iconPt = Math.min(el.icon.bbox.width, el.icon.bbox.height) * 72;
        if (iconPt < theme.diagram.node.iconMinSizePt - 0.01) {
          qa.errors.push(`slide_${idx + 1}: diagram_icon_too_small ${el.id} ${iconPt.toFixed(2)}pt`);
        }
      }
    });

    if (listMetrics.length >= 2) {
      const styles = new Set(listMetrics.map((m) => m.style));
      if (styles.size >= 2) {
        const xs = listMetrics.map((m) => m.textStartX);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        if (Math.abs(maxX - minX) > LIST_ALIGN_EPS) {
          qa.errors.push(`slide_${idx + 1}: list_textStartX_misaligned (${minX.toFixed(3)} vs ${maxX.toFixed(3)})`);
        }
      }
    }

    // Font variance warning
    const fontSizes = new Set();
    slide.elements.forEach((el) => {
      if (el.kind === "text") fontSizes.add(el.fontSize);
      if (el.kind === "list") fontSizes.add(el.textStyle?.fontSize);
      if (el.kind === "card") {
        if (el.header?.titleFont?.size) fontSizes.add(el.header.titleFont.size);
        if (el.header?.subtitleFont?.size) fontSizes.add(el.header.subtitleFont.size);
        if (el.footer?.labelFont?.size) fontSizes.add(el.footer.labelFont.size);
        if (el.footer?.textFont?.size) fontSizes.add(el.footer.textFont.size);
        (el.body || []).forEach((listLayout) => fontSizes.add(listLayout.textStyle?.fontSize));
      }
      if (el.kind === "table") {
        el.rows?.forEach((row) => row.forEach((cell) => cell.options?.fontSize && fontSizes.add(cell.options.fontSize)));
      }
    });
    if (fontSizes.size > FONT_VARIANCE_WARN) {
      qa.warnings.push(`slide_${idx + 1}: font_variance ${fontSizes.size}`);
    }
  });

  // Flow checks
  if (flowReport) {
    flowReport.flows.forEach((flow) => {
      const stepWidths = flow.steps.map((s) => s.bbox.width);
      const stepHeights = flow.steps.map((s) => s.bbox.height);
      if (stepWidths.length > 0) {
        const minW = Math.min(...stepWidths);
        const maxW = Math.max(...stepWidths);
        const minH = Math.min(...stepHeights);
        const maxH = Math.max(...stepHeights);
        if (Math.abs(maxW - minW) > FLOW_SIZE_EPS || Math.abs(maxH - minH) > FLOW_SIZE_EPS) {
          qa.errors.push(`slide_${flow.slide}: flow_uniform_step_size_violation`);
        }
        if (flow.kind === "card_flow") {
          if (minW + FLOW_SIZE_EPS < theme.flowProfiles.flowCard.minStepWIn) {
            qa.errors.push(`slide_${flow.slide}: flow_step_too_narrow ${minW.toFixed(3)}`);
          }
          if (minH + FLOW_SIZE_EPS < theme.flowProfiles.flowCard.minStepHIn) {
            qa.errors.push(`slide_${flow.slide}: flow_step_too_short ${minH.toFixed(3)}`);
          }
          const regionWidth =
            flow.regionBBox?.width ?? (maxW * flow.stepCount + flow.gapX * (flow.stepCount - 1));
          const maxGap = 0.12 * (regionWidth / Math.max(1, flow.stepCount));
          if (flow.gapX > maxGap + FLOW_SIZE_EPS || flow.gapX > FLOW_GAP_WARN_RATIO * maxW) {
            qa.warnings.push(`slide_${flow.slide}: flow_gap_excessive ${flow.gapX.toFixed(3)}`);
          }
        } else if (flow.kind === "chevron_flow") {
          if (!flow.layoutProfile) {
            qa.warnings.push(`slide_${flow.slide}: flow_profile_missing`);
          }
          const gap = flow.gapX;
          if (gap > FLOW_SIZE_EPS) {
            qa.warnings.push(`slide_${flow.slide}: chevron_interlock_missing`);
          } else {
            const overlapRatio = maxW > 0 ? Math.max(0, -gap) / maxW : 0;
            if (overlapRatio <= CHEVRON_INTERLOCK_MIN_RATIO) {
              qa.warnings.push(`slide_${flow.slide}: chevron_interlock_missing`);
            }
          }
        }
      }

      if (flow.kind === "card_flow" && Array.isArray(flow.connectors)) {
        if (!flow.profileExplicit) {
          qa.warnings.push(`slide_${flow.slide}: flow_profile_missing`);
        }
        flow.connectors.forEach((connector) => {
          const start = connector.start;
          const end = connector.end;
          const startStep = flow.steps.reduce(
            (best, step) => {
              const targetX = step.bbox.x + step.bbox.width;
              const dist = Math.abs(start.x - targetX);
              return dist < best.dist ? { step, dist } : best;
            },
            { step: null, dist: Number.POSITIVE_INFINITY }
          );
          const endStep = flow.steps.reduce(
            (best, step) => {
              const targetX = step.bbox.x;
              const dist = Math.abs(end.x - targetX);
              return dist < best.dist ? { step, dist } : best;
            },
            { step: null, dist: Number.POSITIVE_INFINITY }
          );
          if (startStep.step) {
            const midY = startStep.step.bbox.y + startStep.step.bbox.height / 2;
            if (Math.abs(start.y - midY) > FLOW_CENTER_EPS) {
              qa.errors.push(`slide_${flow.slide}: flow_connector_not_centered ${connector.id}`);
            }
          }
          if (endStep.step) {
            const midY = endStep.step.bbox.y + endStep.step.bbox.height / 2;
            if (Math.abs(end.y - midY) > FLOW_CENTER_EPS) {
              qa.errors.push(`slide_${flow.slide}: flow_connector_not_centered ${connector.id}`);
            }
          }
          if (connector.widthPt + 0.01 < theme.flowProfiles.flowCard.connectorStrokePt) {
            qa.errors.push(`slide_${flow.slide}: flow_connector_too_thin ${connector.id}`);
          }
          if (connector.lengthIn + EPSILON_INCHES < theme.flow.connector.minLengthIn) {
            qa.errors.push(`slide_${flow.slide}: flow_connector_too_short ${connector.id}`);
          }
        });

        flow.steps.forEach((step) => {
          const metrics = step.metrics;
          if (!metrics) return;
          const inner = metrics.innerHeightPt ?? 0;
          const used = metrics.contentHeightPt ?? 0;
          const density = inner > 0 ? used / inner : 0;
          if (density < WARN_UTIL_CARD_LIST) {
            qa.warnings.push(
              `slide_${flow.slide}: flow_density_warn ${step.region} density=${density.toFixed(4)}`
            );
          }
        });
      }
    });
  }

  // Diagram checks
  const centerEpsIn = DIAGRAM_CENTER_EPS_PT / 72;
  preparedSlides.forEach((slide, idx) => {
    const diagramBBox = computeDiagramBBox(slide);
    const hasDiagram = slide.elements.some((el) => el.kind === "node" || el.kind === "edge");
    if (!diagramBBox || !slide.diagramRegionBBox || !hasDiagram) {
      return;
    }
    const region = slide.diagramRegionBBox;
    const regionCenter = { x: region.x + region.width / 2, y: region.y + region.height / 2 };
    const diagramCenter = { x: diagramBBox.x + diagramBBox.width / 2, y: diagramBBox.y + diagramBBox.height / 2 };
    const dx = regionCenter.x - diagramCenter.x;
    const dy = regionCenter.y - diagramCenter.y;
    if (Math.abs(dx) > centerEpsIn || Math.abs(dy) > centerEpsIn) {
      qa.warnings.push(`slide_${idx + 1}: diagram_center_delta (${dx.toFixed(4)}, ${dy.toFixed(4)})`);
    }
    if (
      diagramBBox.width <= 0 ||
      diagramBBox.height <= 0 ||
      diagramBBox.x < -EPSILON_INCHES ||
      diagramBBox.y < -EPSILON_INCHES ||
      diagramBBox.x + diagramBBox.width > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
      diagramBBox.y + diagramBBox.height > SLIDE_HEIGHT_INCHES + EPSILON_INCHES
    ) {
      qa.errors.push(`slide_${idx + 1}: diagram_negative_or_offslide`);
    }
    const nodes = slide.elements.filter((el) => el.kind === "node").map((node) => ({ id: node.id, bbox: node.bbox }));
    const diagramRegionId = slide.diagramRegionId || "";
    const hasNodes = nodes.length > 0;
    slide.elements.forEach((el) => {
      if (el.kind === "edge") {
        if (!el.metrics || el.metrics.renderMode !== "unified") {
          qa.errors.push(`slide_${idx + 1}: diagram_edge_split_artifact`);
        }
        const src = nodes.reduce((best, node) => {
          const dist = distanceToBoxPerimeter(el.start, node.bbox);
          if (dist < best.dist) {
            return { id: node.id, dist };
          }
          return best;
        }, { id: null, dist: Number.POSITIVE_INFINITY });
        const dst = nodes.reduce((best, node) => {
          const dist = distanceToBoxPerimeter(el.end, node.bbox);
          if (dist < best.dist) {
            return { id: node.id, dist };
          }
          return best;
        }, { id: null, dist: Number.POSITIVE_INFINITY });
        const snappedStart = src.dist <= EPSILON_INCHES;
        const snappedEnd = dst.dist <= EPSILON_INCHES;
        if (!snappedStart || !snappedEnd) {
          qa.errors.push(`slide_${idx + 1}: diagram_orphan_edge ${el.id}`);
        }
        const start = el.lineStart ?? el.start;
        const end = el.lineEnd ?? el.end;
        const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
        if (lengthIn + EPSILON_INCHES < theme.diagram.edge.minLengthIn) {
          qa.errors.push(`slide_${idx + 1}: diagram_edge_stub ${el.id} ${lengthIn.toFixed(4)}`);
        }
      }
      if (el.kind === "connector" && diagramRegionId && el.region === diagramRegionId) {
        if (hasNodes) {
          const startOk = nodes.some((node) => isPointNearBoxPerimeter(el.start, node.bbox, EPSILON_INCHES));
          const endOk = nodes.some((node) => isPointNearBoxPerimeter(el.end, node.bbox, EPSILON_INCHES));
          if (!startOk || !endOk) {
            qa.errors.push(`slide_${idx + 1}: diagram_orphan_connector ${el.id}`);
          }
        }
        const start = el.lineStart ?? el.start;
        const end = el.lineEnd ?? el.end;
        const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
        if (lengthIn + EPSILON_INCHES < theme.diagram.edge.minLengthIn) {
          qa.errors.push(`slide_${idx + 1}: diagram_edge_stub ${el.id} ${lengthIn.toFixed(4)}`);
        }
      }
    });
  });

  qa.checks = {
    min_body_font_pt: MIN_BODY_FONT_PT,
    min_title_font_pt: MIN_TITLE_FONT_PT,
    list_align_epsilon_in: LIST_ALIGN_EPS,
    font_variance_warn_threshold: FONT_VARIANCE_WARN,
    diagram_center_epsilon_in: centerEpsIn,
    diagram_icon_min_pt: theme.diagram.node.iconMinSizePt,
    diagram_edge_min_length_in: theme.diagram.edge.minLengthIn,
    theme_min_body_contrast: THEME_MIN_BODY,
    theme_min_ui_contrast: THEME_MIN_UI,
    chevron_util_warn_threshold: WARN_UTIL_CHEVRON,
    chevron_icon_min_pt: theme.chevron.step.iconMinSizePt,
    card_density_warn_threshold: WARN_UTIL_CARD_LIST,
    flow_min_step_w_in: theme.flowProfiles.flowCard.minStepWIn,
    flow_min_step_h_in: theme.flowProfiles.flowCard.minStepHIn,
    flow_connector_min_length_in: theme.flow.connector.minLengthIn,
    flow_connector_min_stroke_pt: theme.flowProfiles.flowCard.connectorStrokePt,
  };

  qa.ok = qa.errors.length === 0;
  return qa;
}

function main() {
  const [specPath, pptxPath, utilOut, qaOut, diagramOut, flowOut] = process.argv.slice(2);
  if (!specPath || !pptxPath || !utilOut || !qaOut) {
    console.error(
      "Usage: node scripts/stability_v0_qa.mjs <specPath> <pptxPath> <utilOut> <qaOut> [diagramOut] [flowOut]"
    );
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

  const backslashReport = scanBackslashN(pptxPath);

  const utilReport = computeUtilization(preparedSlides);
  utilReport.spec_path = specPath;
  utilReport.pptx_path = pptxPath;
  writeJson(utilOut, utilReport);

  const flowReport = computeFlowReport(preparedSlides);
  const qaReport = buildQaReport(preparedSlides, utilReport, theme, backslashReport, flowReport);
  qaReport.spec_path = specPath;
  qaReport.pptx_path = pptxPath;
  writeJson(qaOut, qaReport);

  if (diagramOut) {
    const diagramReport = { slides: [] };
    preparedSlides.forEach((slide, idx) => {
      const diagramBBox = computeDiagramBBox(slide);
      if (!diagramBBox || !slide.diagramRegionBBox) return;
      const region = slide.diagramRegionBBox;
      const regionCenter = { x: region.x + region.width / 2, y: region.y + region.height / 2 };
      const diagramCenter = { x: diagramBBox.x + diagramBBox.width / 2, y: diagramBBox.y + diagramBBox.height / 2 };
      const nodes = slide.elements.filter((el) => el.kind === "node").map((node) => ({ id: node.id, bbox: node.bbox }));
      const findNearestNode = (point) => {
        let best = { id: null, dist: Number.POSITIVE_INFINITY };
        nodes.forEach((node) => {
          const dist = distanceToBoxPerimeter(point, node.bbox);
          if (dist < best.dist) {
            best = { id: node.id, dist };
          }
        });
        return best;
      };
      const edges = slide.elements
        .filter((el) => el.kind === "edge")
        .map((edge) => {
          const src = findNearestNode(edge.start);
          const dst = findNearestNode(edge.end);
          const start = edge.lineStart ?? edge.start;
          const end = edge.lineEnd ?? edge.end;
          const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
          return {
            id: edge.id,
            renderMode: edge.metrics?.renderMode ?? "unknown",
            srcId: src.id,
            dstId: dst.id,
            lengthIn: Number(lengthIn.toFixed(4)),
            snapped: src.dist <= EPSILON_INCHES && dst.dist <= EPSILON_INCHES,
            deltaEndInches: Number((dst.dist ?? 0).toFixed(4)),
          };
        });
      diagramReport.slides.push({
        slide: idx + 1,
        region_center: regionCenter,
        diagram_bbox: diagramBBox,
        diagram_center: diagramCenter,
        delta: { x: regionCenter.x - diagramCenter.x, y: regionCenter.y - diagramCenter.y },
        edges,
      });
    });
    writeJson(diagramOut, diagramReport);
  }

  if (flowOut) {
    writeJson(flowOut, flowReport);
  }

  if (!qaReport.ok) {
    console.error("QA failed");
    process.exit(1);
  }
}

main();
