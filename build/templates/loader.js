import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch (error) {
        throw new Error(`template_invalid_json (${filePath}): ${error instanceof Error ? error.message : String(error)}`);
    }
}
export function loadTemplateDefinition(templateId) {
    const fileName = `${templateId}.json`;
    const candidates = [
        path.join(__dirname, "config", fileName),
        path.join(process.cwd(), "src", "templates", "config", fileName),
    ];
    let templatePath = null;
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            templatePath = candidate;
            break;
        }
    }
    if (!templatePath) {
        throw new Error(`template_not_found (${templateId})`);
    }
    const raw = loadJsonFile(templatePath);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error(`template_invalid_definition (${templateId})`);
    }
    return raw;
}
//# sourceMappingURL=loader.js.map