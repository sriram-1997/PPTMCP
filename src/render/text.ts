import type {
  BBox,
  FitMode,
  PreparedTextElement,
  Slide,
  TextElement,
  TextStyle,
  ValidationAction,
  ValidationReportEntry,
} from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { addValidationEntry, buildOverflowMessage } from "./validate.js";

const DEFAULT_MIN_FONT = 10;
const DEFAULT_TEXT_PADDING_PT = 2;

function alignToPptx(value: TextStyle["align"] | undefined): "left" | "center" | "right" | "justify" {
  switch (value) {
    case "center":
      return "center";
    case "right":
      return "right";
    case "justify":
      return "justify";
    default:
      return "left";
  }
}

function valignToPptx(value: TextStyle["verticalAlign"] | undefined): "top" | "middle" | "bottom" {
  switch (value) {
    case "middle":
      return "middle";
    case "bottom":
      return "bottom";
    default:
      return "top";
  }
}

function resolveFontScale(regionName: string, theme: ConcreteTheme): { family: string; size: number; weight: number } {
  const lower = regionName.toLowerCase();
  if (lower.includes("title") || lower.includes("header")) {
    return theme.fontScale.title;
  }
  if (lower.includes("subtitle")) {
    return theme.fontScale.subtitle;
  }
  if (lower.includes("caption") || lower.includes("footer") || lower.includes("note")) {
    return theme.fontScale.caption;
  }
  return theme.fontScale.body;
}

function resolveTextStyle(
  regionName: string,
  style: TextStyle | undefined,
  theme: ConcreteTheme,
  defaultColor: string
): {
  fontFace: string;
  fontSize: number;
  minFont: number;
  fit: FitMode;
  lineHeight: number;
  paddingPt: number;
  bold: boolean;
  italic: boolean;
  color: string;
  align: "left" | "center" | "right" | "justify";
  valign: "top" | "middle" | "bottom";
} {
  const scale = resolveFontScale(regionName, theme);
  const baseSize = style?.fontSize ?? scale.size;
  const defaultPadding = theme.spaceScale[1] ?? DEFAULT_TEXT_PADDING_PT;
  const defaultBold = scale.weight >= theme.type.weightBold;
  return {
    fontFace: scale.family,
    fontSize: baseSize,
    minFont: style?.minFont ?? DEFAULT_MIN_FONT,
    fit: style?.fit ?? "shrink",
    lineHeight: style?.lineHeight ?? 1.2,
    paddingPt: style?.paddingPt ?? defaultPadding,
    bold: style?.bold ?? defaultBold,
    italic: style?.italic ?? false,
    color: normalizeColor(style?.color, defaultColor),
    align: alignToPptx(style?.align),
    valign: valignToPptx(style?.verticalAlign),
  };
}

function glyphUnits(char: string): number {
  if (char === "\t") {
    return 4;
  }
  if (char === " ") {
    return 0.55;
  }
  const code = char.charCodeAt(0);
  if (code <= 0x007f) {
    return 1;
  }
  if (code <= 0x07ff) {
    return 1.35;
  }
  return 1.65;
}

export function textUnits(text: string): number {
  let units = 0;
  for (const char of text) {
    units += glyphUnits(char);
  }
  return units;
}

function wrapLongToken(token: string, maxUnitsPerLine: number): string[] {
  const chunks: string[] = [];
  let current = "";
  let currentUnits = 0;
  for (const char of token) {
    const charUnits = glyphUnits(char);
    if (current && currentUnits + charUnits > maxUnitsPerLine) {
      chunks.push(current);
      current = char;
      currentUnits = charUnits;
    } else {
      current += char;
      currentUnits += charUnits;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.length > 0 ? chunks : [token];
}

function wrapParagraph(paragraph: string, maxUnitsPerLine: number): string[] {
  if (!paragraph.trim()) {
    return [""];
  }
  const body = paragraph.trim();
  const words = body.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let currentText = "";
  let currentUnits = 0;

  const pushCurrent = () => {
    lines.push(currentText.trimEnd());
    currentText = "";
    currentUnits = 0;
  };

  for (const word of words) {
    const spaceUnits = currentText.length > 0 ? glyphUnits(" ") : 0;
    const candidateUnits = currentUnits + spaceUnits + textUnits(word);
    if (candidateUnits <= maxUnitsPerLine) {
      if (currentText.length > 0) {
        currentText += " ";
      }
      currentText += word;
      currentUnits = candidateUnits;
      continue;
    }

    if (currentText.length > 0) {
      pushCurrent();
    }

    const maxForWord = Math.max(1, maxUnitsPerLine);
    if (textUnits(word) <= maxForWord) {
      currentText = word;
      currentUnits = textUnits(word);
      continue;
    }

    const chunks = wrapLongToken(word, maxForWord);
    for (let idx = 0; idx < chunks.length; idx += 1) {
      const chunk = chunks[idx];
      if (idx === chunks.length - 1) {
        currentText = chunk;
        currentUnits = textUnits(chunk);
      } else {
        lines.push(chunk);
      }
    }
  }

  if (currentText.length > 0 || lines.length === 0) {
    lines.push(currentText.trimEnd());
  }
  return lines;
}

interface TextEstimate {
  requiredWidthPt: number;
  requiredHeightPt: number;
  availableWidthPt: number;
  availableHeightPt: number;
  overflowWidth: boolean;
  overflowHeight: boolean;
  wrappedLines: string[];
  maxUnitsPerLine: number;
}

export function estimateTextLayout(args: {
  text: string;
  fontSize: number;
  bold: boolean;
  bbox: BBox;
  paddingPt: number;
  lineHeight: number;
}): TextEstimate {
  const availableWidthPt = Math.max(1, args.bbox.width * 72 - args.paddingPt * 2);
  const avgCharWidthPt = args.fontSize * (args.bold ? 0.56 : 0.53);
  const maxUnitsPerLine = Math.max(1, Math.floor(availableWidthPt / avgCharWidthPt));
  const paragraphs = args.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const wrappedLines: string[] = [];
  for (const paragraph of paragraphs) {
    wrappedLines.push(...wrapParagraph(paragraph, maxUnitsPerLine));
  }
  const maxLineUnits = wrappedLines.reduce((max, line) => Math.max(max, textUnits(line)), 0);
  const requiredWidthPt = maxLineUnits * avgCharWidthPt + args.paddingPt * 2;
  const requiredHeightPt = wrappedLines.length * args.fontSize * args.lineHeight + args.paddingPt * 2;
  return {
    requiredWidthPt,
    requiredHeightPt,
    availableWidthPt: args.bbox.width * 72,
    availableHeightPt: args.bbox.height * 72,
    overflowWidth: requiredWidthPt > args.bbox.width * 72 + 0.2,
    overflowHeight: requiredHeightPt > args.bbox.height * 72 + 0.2,
    wrappedLines,
    maxUnitsPerLine,
  };
}

function ellipsizeLines(lines: string[], maxLines: number, maxUnitsPerLine: number): string[] {
  const trimmed = lines.slice(0, Math.max(1, maxLines));
  if (lines.length <= maxLines) {
    return trimmed;
  }
  const ellipsis = "...";
  const budget = Math.max(1, maxUnitsPerLine - textUnits(ellipsis));
  let last = trimmed[trimmed.length - 1].trimEnd();
  while (last.length > 0 && textUnits(last) > budget) {
    last = last.slice(0, -1);
  }
  trimmed[trimmed.length - 1] = `${last}${ellipsis}`;
  return trimmed;
}

export function truncateTextToFit(args: {
  text: string;
  fontSize: number;
  bold: boolean;
  bbox: BBox;
  paddingPt: number;
  lineHeight: number;
}): { text: string; estimate: TextEstimate } {
  const estimate = estimateTextLayout(args);
  if (!estimate.overflowHeight && !estimate.overflowWidth) {
    return { text: args.text, estimate };
  }
  const maxLines = Math.max(
    1,
    Math.floor((args.bbox.height * 72 - args.paddingPt * 2) / (args.fontSize * args.lineHeight))
  );
  const truncatedText = ellipsizeLines(estimate.wrappedLines, maxLines, estimate.maxUnitsPerLine).join("\n");
  return { text: truncatedText, estimate: estimateTextLayout({ ...args, text: truncatedText }) };
}

export function prepareTextElement(args: {
  slide: Slide;
  slideIndex: number;
  element: TextElement;
  elementIndex: number;
  z: number;
  order: number;
  id: string;
  bbox: BBox;
  theme: ConcreteTheme;
  allowOverflow: boolean;
  validationReport: ValidationReportEntry[];
  warnings: string[];
  hardErrors: string[];
}): PreparedTextElement {
  const defaults = resolveElementStyleDefaults(args.element, args.theme);
  const defaultColor = defaults.textStyle?.color ?? args.theme.text.colorPrimary;
  const style = resolveTextStyle(args.element.region, args.element.style, args.theme, defaultColor);
  if (style.fontSize < style.minFont) {
    throw new Error(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: fontSize ${style.fontSize} is below minFont ${style.minFont}`
    );
  }

  let content = args.element.content;
  let fontSize = style.fontSize;
  let estimate = estimateTextLayout({
    text: content,
    fontSize,
    bold: style.bold,
    bbox: args.bbox,
    paddingPt: style.paddingPt,
    lineHeight: style.lineHeight,
  });
  let action: ValidationAction = "none";

  if ((estimate.overflowHeight || estimate.overflowWidth) && style.fit === "shrink") {
    for (let font = style.fontSize - 1; font >= style.minFont; font -= 1) {
      const nextEstimate = estimateTextLayout({
        text: content,
        fontSize: font,
        bold: style.bold,
        bbox: args.bbox,
        paddingPt: style.paddingPt,
        lineHeight: style.lineHeight,
      });
      if (!nextEstimate.overflowHeight && !nextEstimate.overflowWidth) {
        fontSize = font;
        estimate = nextEstimate;
        action = "shrink";
        break;
      }
    }
    if (estimate.overflowHeight || estimate.overflowWidth) {
      fontSize = style.minFont;
      estimate = estimateTextLayout({
        text: content,
        fontSize,
        bold: style.bold,
        bbox: args.bbox,
        paddingPt: style.paddingPt,
        lineHeight: style.lineHeight,
      });
    }
  }

  if (estimate.overflowHeight || estimate.overflowWidth) {
    if (args.allowOverflow) {
      const truncated = truncateTextToFit({
        text: content,
        fontSize,
        bold: style.bold,
        bbox: args.bbox,
        paddingPt: style.paddingPt,
        lineHeight: style.lineHeight,
      });
      content = truncated.text;
      estimate = truncated.estimate;
      action = "truncate";
      args.warnings.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: text truncated with ellipsis at font ${fontSize}.`
      );
    } else {
      action = "error";
    }
  }

  const entry = addValidationEntry({
    report: args.validationReport,
    slideIndex: args.slideIndex,
    slide: args.slide,
    elementIndex: args.elementIndex,
    elementType: "text",
    region: args.element.region,
    estimate,
    minFont: style.minFont,
    appliedFont: fontSize,
    action,
    details:
      action === "none"
        ? "text fits region"
        : action === "shrink"
          ? `text shrunk to font ${fontSize}`
          : action === "truncate"
            ? `text truncated at font ${fontSize}`
            : `overflow unresolved at minFont ${style.minFont}`,
  });

  if (action === "error") {
    args.hardErrors.push(buildOverflowMessage(entry));
  }

  const boxStyle = defaults.boxStyle
    ? {
        fill: defaults.boxStyle.fill,
        border: defaults.boxStyle.border,
        borderWidth: defaults.boxStyle.borderWidth,
      }
    : undefined;

  return {
    kind: "text",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant: args.element.variant,
    bbox: args.bbox,
    content,
    fontFace: style.fontFace,
    fontSize,
    boxStyle,
    style: {
      bold: style.bold,
      italic: style.italic,
      color: style.color,
      align: style.align,
      valign: style.valign,
      paddingPt: style.paddingPt,
      lineHeight: style.lineHeight,
    },
  };
}

export function renderTextElement(slide: any, shapeType: any, element: PreparedTextElement): void {
  if (element.boxStyle) {
    slide.addShape(shapeType.rect, {
      x: element.bbox.x,
      y: element.bbox.y,
      w: element.bbox.width,
      h: element.bbox.height,
      fill: { color: element.boxStyle.fill },
      line: { color: element.boxStyle.border, width: element.boxStyle.borderWidth },
    });
  }
  slide.addText(element.content, {
    x: element.bbox.x,
    y: element.bbox.y,
    w: element.bbox.width,
    h: element.bbox.height,
    fontFace: element.fontFace,
    fontSize: element.fontSize,
    bold: element.style.bold,
    italic: element.style.italic,
    color: element.style.color,
    align: element.style.align,
    valign: element.style.valign,
    fit: "none",
    margin: element.style.paddingPt,
    breakLine: true,
  });
}

