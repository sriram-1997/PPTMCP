import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch (error) {
        throw new Error(`theme_invalid_json (${filePath}): ${error instanceof Error ? error.message : String(error)}`);
    }
}
export function loadThemeTokens(themeName) {
    const fileName = `${themeName}.json`;
    const candidates = [
        path.join(__dirname, "config", fileName),
        path.join(process.cwd(), "src", "theme", "config", fileName),
    ];
    let themePath = null;
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            themePath = candidate;
            break;
        }
    }
    if (!themePath) {
        throw new Error(`theme_not_found (${themeName})`);
    }
    const raw = loadJsonFile(themePath);
    const tokens = raw && typeof raw === "object" && "tokens" in raw ? raw.tokens : null;
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
        throw new Error(`theme_invalid_definition (${themeName})`);
    }
    return tokens;
}
//# sourceMappingURL=themeLoader.js.map