import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { resolveConcreteTheme } from "../build/theme/tokenResolver.js";
import { compileTemplateSpec } from "../build/templates/compiler.js";
import { computeRegionBBox } from "../build/render/slide.js";

const LIGHT_SPEC = path.join(process.cwd(), "examples", "themes", "themes_stress.json");
const DARK_SPEC = path.join(process.cwd(), "examples", "themes", "themes_stress_dark.json");
const OUT_LIGHT = path.join(process.cwd(), "out", "themes-stress-light.pptx");
const OUT_DARK = path.join(process.cwd(), "out", "themes-stress-dark.pptx");

function loadSpec(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function compileSpec(raw) {
  const theme = resolveConcreteTheme({
    themeInput: raw.theme,
    styleTokensInput: raw.styleTokens,
  });
  const compiled = compileTemplateSpec({ spec: raw, theme, strict: true });
  if (!compiled.spec || compiled.errors.length > 0) {
    throw new Error(`Spec validation failed:\n${compiled.errors.join("\n")}`);
  }
  return compiled.spec;
}

function assertNoShrink(spec) {
  spec.slides.forEach((slide, slideIdx) => {
    slide.elements.forEach((element, elemIdx) => {
      if (element.type === "text" && element.style?.fit === "shrink") {
        throw new Error(
          `Shrink-to-fit disabled for themes-stress (slide ${slideIdx + 1}, element ${elemIdx + 1})`
        );
      }
    });
  });
}

function collectRects(spec) {
  const slides = new Map();
  spec.slides.forEach((slide) => {
    const regions = new Map();
    Object.entries(slide.regions).forEach(([regionId, region]) => {
      const bbox = computeRegionBBox(region, slide.grid);
      regions.set(regionId, bbox);
    });
    slides.set(slide.id, regions);
  });
  return slides;
}

function compareRects(light, dark) {
  const epsilon = 1e-6;
  if (light.size !== dark.size) {
    throw new Error("Theme stress mismatch: slide count differs");
  }
  for (const [slideId, lightRegions] of light.entries()) {
    const darkRegions = dark.get(slideId);
    if (!darkRegions) {
      throw new Error(`Theme stress mismatch: missing slide '${slideId}' in dark theme`);
    }
    if (lightRegions.size !== darkRegions.size) {
      throw new Error(`Theme stress mismatch: region count differs on slide '${slideId}'`);
    }
    for (const [regionId, lightRect] of lightRegions.entries()) {
      const darkRect = darkRegions.get(regionId);
      if (!darkRect) {
        throw new Error(`Theme stress mismatch: missing region '${regionId}' on slide '${slideId}'`);
      }
      const diffs = [
        Math.abs(lightRect.x - darkRect.x),
        Math.abs(lightRect.y - darkRect.y),
        Math.abs(lightRect.width - darkRect.width),
        Math.abs(lightRect.height - darkRect.height),
      ];
      if (diffs.some((diff) => diff > epsilon)) {
        throw new Error(`Theme stress mismatch: region '${regionId}' differs on slide '${slideId}'`);
      }
    }
  }
}

function runRender(specPath, outPath) {
  const cmd = `node scripts/render-cli.mjs ${specPath} ${outPath} --no-pdf`;
  execSync(cmd, { stdio: "inherit" });
}

try {
  runRender(LIGHT_SPEC, OUT_LIGHT);
  runRender(DARK_SPEC, OUT_DARK);

  const lightSpec = compileSpec(loadSpec(LIGHT_SPEC));
  const darkSpec = compileSpec(loadSpec(DARK_SPEC));
  assertNoShrink(lightSpec);
  assertNoShrink(darkSpec);
  compareRects(collectRects(lightSpec), collectRects(darkSpec));
  console.log("themes-stress: OK");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
