import fs from "fs";
import path from "path";

const EMU_PER_INCH = 914400;
const EMU_STEP = 10;
const SLIDE_WIDTH_INCHES = 13.333333333333334;
const SLIDE_HEIGHT_INCHES = 7.5;

const CONFIG_DIR = path.join(process.cwd(), "src", "templates", "config");

function findQuantizedGutter(grid, original) {
  const stepW = (EMU_STEP * grid.cols) / EMU_PER_INCH;
  const stepH = (EMU_STEP * grid.rows) / EMU_PER_INCH;
  const targetM = Math.round((SLIDE_WIDTH_INCHES + original) / stepW);
  const search = 5000;
  let best = null;

  for (let m = Math.max(0, targetM - search); m <= targetM + search; m += 1) {
    const g = m * stepW - SLIDE_WIDTH_INCHES;
    if (g < 0) {
      continue;
    }
    const n = (SLIDE_HEIGHT_INCHES + g) / stepH;
    const nRounded = Math.round(n);
    if (Math.abs(n - nRounded) > 1e-9) {
      continue;
    }
    const diff = Math.abs(g - original);
    if (!best || diff < best.diff) {
      best = { g, diff };
    }
  }

  if (!best) {
    return original;
  }
  return best.g;
}

function formatTemplate(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  let changed = false;

  if (data.grid) {
    const gutter = typeof data.grid.gutter === "number" ? data.grid.gutter : 0;
    const quantized = findQuantizedGutter(data.grid, gutter);
    const rounded = Number(quantized.toFixed(12));
    if (Math.abs(rounded - gutter) > 1e-12) {
      data.grid.gutter = rounded;
      changed = true;
    }
  }

  const formatted = JSON.stringify(data, null, 2) + "\n";
  if (formatted !== raw) {
    fs.writeFileSync(filePath, formatted, "utf-8");
    changed = true;
  }
  return changed;
}

if (!fs.existsSync(CONFIG_DIR)) {
  console.error("Template config directory not found:", CONFIG_DIR);
  process.exit(1);
}

const files = fs.readdirSync(CONFIG_DIR).filter((file) => file.endsWith(".json"));
let updated = 0;

for (const file of files) {
  const filePath = path.join(CONFIG_DIR, file);
  if (formatTemplate(filePath)) {
    updated += 1;
  }
}

if (updated > 0) {
  console.log(`Formatted ${updated} template file(s).`);
} else {
  console.log("Templates already quantized.");
}
