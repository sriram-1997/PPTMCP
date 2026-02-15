import fs from "node:fs";
import path from "node:path";

const registryPath = path.resolve(process.cwd(), "src", "assets", "iconRegistry.json");
const iconsDir = path.resolve(process.cwd(), "src", "assets", "icons");

const errors = [];

if (!fs.existsSync(registryPath)) {
  console.error("icon_registry_missing");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
const entries =
  raw && typeof raw === "object" && raw.icons && typeof raw.icons === "object" ? raw.icons : raw;

const iconNames = Object.keys(entries).filter((key) => key !== "_meta");
if (iconNames.length === 0) {
  errors.push("icon_registry_missing");
}

for (const name of iconNames) {
  const entry = entries[name];
  if (!entry || typeof entry.viewBox !== "string" || entry.viewBox !== "0 0 24 24") {
    errors.push(`icon_invalid (${name})`);
    continue;
  }
  const filePath = path.join(iconsDir, `${name}.svg`);
  if (!fs.existsSync(filePath)) {
    errors.push(`icon_not_found (${name})`);
    continue;
  }
  const svg = fs.readFileSync(filePath, "utf-8");
  const svgMatch = svg.match(/<svg\b[^>]*>/i);
  if (!svgMatch) {
    errors.push(`icon_invalid (${name})`);
    continue;
  }
  const svgTag = svgMatch[0];
  if (/(^|\s)(width|height)=/i.test(svgTag)) {
    errors.push(`icon_invalid (${name})`);
  }
  if (!/viewBox="0 0 24 24"/i.test(svgTag)) {
    errors.push(`icon_invalid (${name})`);
  }
  if (/<script/i.test(svg)) {
    errors.push(`icon_invalid (${name})`);
  }
  if (/<style/i.test(svg)) {
    errors.push(`icon_invalid (${name})`);
  }
  if (/\sstyle=/.test(svg)) {
    errors.push(`icon_invalid (${name})`);
  }

  const ids = [];
  const idMatches = svg.match(/id="([^"]+)"/gi) || [];
  for (const match of idMatches) {
    const value = match.split("=")[1]?.replace(/"/g, "");
    if (value) ids.push(value);
  }
  const idSet = new Set();
  for (const id of ids) {
    if (idSet.has(id)) {
      errors.push(`icon_invalid (${name})`);
      break;
    }
    idSet.add(id);
  }

  const attrMatches = svg.match(/\b(stroke|fill)=["'][^"']+["']/gi) || [];
  for (const match of attrMatches) {
    const value = match.split("=")[1]?.replace(/["']/g, "");
    if (value && value !== "currentColor" && value !== "none") {
      errors.push(`icon_invalid (${name})`);
      break;
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`icons:lint ok (${iconNames.length} icons)`);
