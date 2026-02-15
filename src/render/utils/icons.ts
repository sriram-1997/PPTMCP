import fs from "fs";
import path from "path";

const ICON_REGISTRY_PATH = path.resolve(process.cwd(), "src", "assets", "iconRegistry.json");
const ICONS_DIR = path.resolve(process.cwd(), "src", "assets", "icons");

type IconRegistryEntry = { viewBox: string; source: string };

let registryCache: Record<string, IconRegistryEntry> | null = null;

function loadRegistry(): Record<string, IconRegistryEntry> {
  if (registryCache) {
    return registryCache;
  }
  if (!fs.existsSync(ICON_REGISTRY_PATH)) {
    throw new Error("icon_registry_missing");
  }
  const raw = JSON.parse(fs.readFileSync(ICON_REGISTRY_PATH, "utf-8")) as Record<string, unknown>;
  const entries =
    raw && typeof raw === "object" && "icons" in raw && raw.icons && typeof raw.icons === "object"
      ? (raw.icons as Record<string, IconRegistryEntry>)
      : (raw as Record<string, IconRegistryEntry>);
  registryCache = entries;
  return entries;
}

function injectColor(svg: string, color: string): string {
  const match = svg.match(/<svg\b[^>]*>/i);
  if (!match) {
    throw new Error("icon_invalid");
  }
  const tag = match[0];
  let updated = tag;
  if (/\sstyle=/.test(tag)) {
    updated = tag.replace(/\sstyle="([^"]*)"/i, (_m, styles) => ` style="${styles};color:#${color}"`);
  } else if (/\scolor=/.test(tag)) {
    updated = tag.replace(/\scolor="[^"]*"/i, ` color="#${color}"`);
  } else {
    updated = tag.replace("<svg", `<svg style="color:#${color}"`);
  }
  return svg.replace(tag, updated);
}

export function resolveIconData(args: {
  name: string;
  color: string;
}): { data: string | null; error?: string } {
  let registry: Record<string, IconRegistryEntry> | null = null;
  try {
    registry = loadRegistry();
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "icon_registry_missing" };
  }

  if (!registry || !registry[args.name]) {
    return { data: null, error: "icon_not_found" };
  }

  const iconPath = path.join(ICONS_DIR, `${args.name}.svg`);
  if (!fs.existsSync(iconPath)) {
    return { data: null, error: "icon_not_found" };
  }

  try {
    const rawSvg = fs.readFileSync(iconPath, "utf-8");
    const tinted = injectColor(rawSvg, args.color);
    return { data: `image/svg+xml;base64,${Buffer.from(tinted, "utf-8").toString("base64")}` };
  } catch (error) {
    return { data: null, error: "icon_invalid" };
  }
}
