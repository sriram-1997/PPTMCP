import * as fs from "fs";
import * as path from "path";
import pptxgen from "pptxgenjs";
import { exportToPdf } from "../tools/export-pdf.js";
import { resolveConcreteTheme } from "../theme/tokenResolver.js";
import type { ConcreteTheme } from "../theme/types.js";
import type { IntegrityDebugReport, RenderResult, SlideProgramSpec, ValidationReportEntry } from "./types.js";
import { validateSpec } from "./validate.js";
import { buildIntegrityDebug, prepareSlides } from "./slide.js";
import { resolveGeometryV1 } from "./geometry.js";
import { compileTemplateSpec } from "../templates/compiler.js";
import { renderTextElement } from "./text.js";
import { renderTableElement } from "./table.js";
import { renderChartElement } from "./chart.js";
import { renderListElement } from "./list.js";
import { renderCardElement } from "./card.js";
import { renderCalloutElement } from "./callout.js";
import { renderConnectorElement } from "./connector.js";
import { renderEdgeElement } from "./edge.js";
import { renderImageElement } from "./image.js";
import { renderIconElement } from "./icon.js";
import { renderNodeElement } from "./node.js";

async function renderPptmcp(args: {
  spec_path: string;
  output_path: string;
  template?: string;
  strict?: boolean;
  allow_overflow?: boolean;
  allow_dense_charts?: boolean;
  export_pdf?: boolean;
  debug_integrity?: boolean;
}): Promise<RenderResult> {
  const strict = args.strict !== false;
  const allowOverflow = args.allow_overflow === true;
  const allowDenseCharts = args.allow_dense_charts === true;
  const exportPdf = args.export_pdf === true;
  const debugIntegrity = args.debug_integrity === true;

  const warnings: string[] = [];
  const validationReport: ValidationReportEntry[] = [];
  const hardErrors: string[] = [];

  let rawSpec: unknown;
  try {
    rawSpec = JSON.parse(fs.readFileSync(args.spec_path, "utf-8"));
  } catch (error) {
    throw new Error(
      `Failed to parse spec JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const rawSpecObj =
    rawSpec && typeof rawSpec === "object" && !Array.isArray(rawSpec)
      ? (rawSpec as SlideProgramSpec)
      : ({} as SlideProgramSpec);
  const theme: ConcreteTheme = resolveConcreteTheme({
    themeInput: rawSpecObj.theme,
    styleTokensInput: rawSpecObj.styleTokens,
  });

  const compiled = compileTemplateSpec({ spec: rawSpec, theme, strict });
  if (compiled.errors.length > 0 || !compiled.spec) {
    throw new Error(`Spec validation failed:\n${compiled.errors.join("\n")}`);
  }

  const spec: SlideProgramSpec = compiled.spec;

  const validation = validateSpec(spec, strict);
  if (!validation.valid) {
    throw new Error(`Spec validation failed:\n${validation.errors.join("\n")}`);
  }

  const preparedSlides = prepareSlides({
    spec,
    theme,
    baseDir: path.dirname(args.spec_path),
    allowOverflow,
    allowDenseCharts,
    validationReport,
    warnings,
    hardErrors,
  });

  resolveGeometryV1({ slides: preparedSlides, warnings, hardErrors });

  if (hardErrors.length > 0) {
    throw new Error(`Layout validation failed:
${hardErrors.join("\n")}`);
  }


  let integrityDebug: IntegrityDebugReport | undefined;
  if (debugIntegrity) {
    integrityDebug = buildIntegrityDebug({ spec, preparedSlides });
  }

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = spec.metadata?.author || "PPTMCP";
  pres.title = spec.title;
  pres.theme = { headFontFace: theme.fontScale.title.family, bodyFontFace: theme.fontScale.body.family };
  const shapeType = pres.ShapeType;

  const outputDir = path.dirname(args.output_path);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  preparedSlides.forEach((slidePlan) => {
    const slide = pres.addSlide();
    slide.background = { color: theme.slide.background };
    slidePlan.elements.forEach((element) => {
      if (element.kind === "text") {
        renderTextElement(slide, shapeType, element);
      } else if (element.kind === "list") {
        renderListElement(slide, shapeType, element);
      } else if (element.kind === "card") {
        renderCardElement(slide, shapeType, element);
      } else if (element.kind === "table") {
        renderTableElement(slide, element);
      } else if (element.kind === "chart") {
        renderChartElement(slide, shapeType, element, theme);
      } else if (element.kind === "node") {
        renderNodeElement(slide, shapeType, element);
      } else if (element.kind === "edge") {
        renderEdgeElement(slide, shapeType, element);
      } else if (element.kind === "connector") {
        renderConnectorElement(slide, shapeType, element);
      } else if (element.kind === "callout") {
        renderCalloutElement(slide, shapeType, element, theme);
      } else if (element.kind === "image") {
        renderImageElement(slide, shapeType, element);
      } else if (element.kind === "icon") {
        renderIconElement(slide, shapeType, element);
      }
    });
  });

  await pres.writeFile({ fileName: args.output_path });
  if (exportPdf) {
    const pdfResult = await exportToPdf(args.output_path);
    if (!pdfResult.success && pdfResult.warning) {
      warnings.push(`PDF export: ${pdfResult.warning}`);
    }
  }
  if (debugIntegrity && integrityDebug) {
    const debugPath = `${args.output_path}.integrity.json`;
    fs.writeFileSync(debugPath, JSON.stringify(integrityDebug, null, 2), "utf-8");
  }

  return {
    output_path: args.output_path,
    slides_rendered: spec.slides.length,
    warnings,
    success: true,
    validation_report: validationReport,
    integrity_debug: integrityDebug,
  };
}

export const pptRenderer = {
  name: "render_pptmcp",
  description:
    "Render a deterministic PPTX from a Slide Program JSON specification with grid discipline and layout validation",
  parameters: {
    type: "object",
    properties: {
      spec_path: {
        type: "string",
        description: "Path to the Slide Program JSON spec",
      },
      output_path: {
        type: "string",
        description: "Path where the PPTX file will be written",
      },
      template: {
        type: "string",
        description: "Template style (basic, professional, modern)",
        enum: ["basic", "professional", "modern"],
        default: "professional",
      },
      strict: {
        type: "boolean",
        description: "If true, unknown schema fields cause hard failure",
        default: true,
      },
      allow_overflow: {
        type: "boolean",
        description: "If true, unresolved overflow is truncated with warnings",
        default: false,
      },
      allow_dense_charts: {
        type: "boolean",
        description: "If true, allow charts with dense categories or long labels (warnings instead of errors)",
        default: false,
      },
      export_pdf: {
        type: "boolean",
        description: "If true, attempt to export a PDF next to the PPTX (best-effort)",
        default: false,
      },
      debug_integrity: {
        type: "boolean",
        description: "If true, emit integrity diagnostics and write an .integrity.json file",
        default: false,
      },
    },
    required: ["spec_path", "output_path"],
  },

  async run(args: {
    spec_path: string;
    output_path: string;
    template?: string;
    strict?: boolean;
    allow_overflow?: boolean;
    allow_dense_charts?: boolean;
    export_pdf?: boolean;
    debug_integrity?: boolean;
  }) {
    try {
      const result = await renderPptmcp(args);
      const shrinkCount = result.validation_report.filter((item) => item.action_taken === "shrink").length;
      const truncateCount = result.validation_report.filter((item) => item.action_taken === "truncate").length;
      const lines = [
        "Presentation rendered successfully",
        `Output: ${result.output_path}`,
        `Slides: ${result.slides_rendered}`,
        `Strict: ${args.strict !== false ? "true" : "false"}`,
        `Allow overflow: ${args.allow_overflow === true ? "true" : "false"}`,
        `Allow dense charts: ${args.allow_dense_charts === true ? "true" : "false"}`,
        `Export PDF: ${args.export_pdf === true ? "true" : "false"}`,
        `Debug integrity: ${args.debug_integrity === true ? "true" : "false"}`,
        `Layout actions: shrink=${shrinkCount}, truncate=${truncateCount}`,
      ];
      if (result.warnings.length > 0) {
        lines.push("Warnings:");
        result.warnings.forEach((warning) => lines.push(`- ${warning}`));
      }
      return {
        content: [
          {
            type: "text",
            text: lines.join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Rendering failed\n${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export { renderPptmcp };
