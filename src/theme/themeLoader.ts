import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { TokenMap } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new Error(
      `theme_invalid_json (${filePath}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function loadThemeTokens(themeName: string): TokenMap {
  const fileName = `${themeName}.json`;
  const candidates = [
    path.join(__dirname, "config", fileName),
    path.join(process.cwd(), "src", "theme", "config", fileName),
  ];

  let themePath: string | null = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      themePath = candidate;
      break;
    }
  }

  if (!themePath) {
    throw new Error(`theme_not_found (${themeName})`);
  }

  const raw = loadJsonFile(themePath) as Record<string, unknown>;
  const tokens = raw && typeof raw === "object" && "tokens" in raw ? (raw.tokens as TokenMap) : null;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error(`theme_invalid_definition (${themeName})`);
  }

  return tokens;
}
