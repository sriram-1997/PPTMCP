import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { TemplateDefinition } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new Error(
      `template_invalid_json (${filePath}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function loadTemplateDefinition(templateId: string): TemplateDefinition {
  const fileName = `${templateId}.json`;
  const candidates = [
    path.join(__dirname, "config", fileName),
    path.join(process.cwd(), "src", "templates", "config", fileName),
  ];

  let templatePath: string | null = null;
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

  return raw as TemplateDefinition;
}
