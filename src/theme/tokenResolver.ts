import type { ConcreteTheme, TokenMap } from "./types.js";
import { loadThemeTokens } from "./themeLoader.js";

const DEFAULT_THEME_NAME = "consulting_light_v1";

const TOKEN_KEYS = [
  "color.background",
  "color.surface",
  "color.surface_elevated",
  "color.surface_accent",
  "color.text_primary",
  "color.text_secondary",
  "color.border_default",
  "color.table_header_fill",
  "color.table_body_fill",
  "color.table_header_text",
  "color.table_body_text",
  "color.table_border",
  "color.primary",
  "color.accent",
  "chart.palette",
  "type.font_family_primary",
  "type.font_family_secondary",
  "type.body_size",
  "type.small_size",
  "type.weight_medium",
  "type.weight_bold",
  "shape.border_width_default",
  "contrast.min_ratio_body",
  "contrast.min_ratio_title",
  "contrast.min_ratio_ui",
  "contrast.max_ratio",
  "font_scale.title.family",
  "font_scale.title.size",
  "font_scale.title.weight",
  "font_scale.subtitle.family",
  "font_scale.subtitle.size",
  "font_scale.subtitle.weight",
  "font_scale.body.family",
  "font_scale.body.size",
  "font_scale.body.weight",
  "font_scale.caption.family",
  "font_scale.caption.size",
  "font_scale.caption.weight",
  "space_scale.0",
  "space_scale.1",
  "space_scale.2",
  "space_scale.3",
  "space_scale.4",
  "space_scale.5",
  "stroke_scale.thin",
  "stroke_scale.normal",
  "stroke_scale.heavy",
];

const TOKEN_SET = new Set(TOKEN_KEYS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeHexColor(value: unknown, key: string): string {
  if (typeof value !== "string") {
    throw new Error(`style_token_invalid (${key})`);
  }
  const match = value.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) {
    throw new Error(`style_token_invalid (${key})`);
  }
  return match[1].toUpperCase();
}

function normalizeNumber(value: unknown, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`style_token_invalid (${key})`);
  }
  return value;
}

function normalizeNonNegativeNumber(value: unknown, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`style_token_invalid (${key})`);
  }
  return value;
}

function normalizeString(value: unknown, key: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`style_token_invalid (${key})`);
  }
  return value;
}

function normalizePalette(value: unknown, key: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`style_token_invalid (${key})`);
  }
  return value.map((entry) => normalizeHexColor(entry, key));
}

function normalizeTokenMap(tokens: TokenMap, requireAll: boolean): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  const keys = Object.keys(tokens);
  for (const key of keys) {
    if (!TOKEN_SET.has(key)) {
      throw new Error(`unknown_style_token (${key})`);
    }
    const value = tokens[key];
    if (key.startsWith("color.")) {
      normalized[key] = normalizeHexColor(value, key);
    } else if (key === "chart.palette") {
      normalized[key] = normalizePalette(value, key);
    } else if (key.startsWith("font_scale.")) {
      if (key.endsWith(".family")) {
        normalized[key] = normalizeString(value, key);
      } else {
        normalized[key] = normalizeNumber(value, key);
      }
    } else if (key.startsWith("space_scale.")) {
      normalized[key] = normalizeNonNegativeNumber(value, key);
    } else if (key.startsWith("stroke_scale.")) {
      normalized[key] = normalizeNumber(value, key);
    } else if (key.startsWith("type.")) {
      if (key.includes("font_family")) {
        normalized[key] = normalizeString(value, key);
      } else {
        normalized[key] = normalizeNumber(value, key);
      }
    } else if (key.startsWith("contrast.")) {
      normalized[key] = normalizeNumber(value, key);
    } else if (key.startsWith("shape.")) {
      normalized[key] = normalizeNumber(value, key);
    } else {
      throw new Error(`unknown_style_token (${key})`);
    }
  }

  if (requireAll) {
    for (const required of TOKEN_KEYS) {
      if (!(required in normalized)) {
        throw new Error(`theme_invalid_definition (missing ${required})`);
      }
    }
  }

  return normalized;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (hex.length !== 6) {
    throw new Error("theme_contrast_invalid (invalid color length)");
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function linearizeChannel(value: number): number {
  const channel = value / 255;
  if (channel <= 0.03928) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rl = linearizeChannel(r);
  const gl = linearizeChannel(g);
  const bl = linearizeChannel(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(foreground: string, background: string): number {
  const lum1 = luminance(foreground);
  const lum2 = luminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function validateContrast(theme: ConcreteTheme, merged: Record<string, unknown>): void {
  const minBody = merged["contrast.min_ratio_body"] as number;
  const minTitle = merged["contrast.min_ratio_title"] as number;
  const minUi = merged["contrast.min_ratio_ui"] as number;
  const maxRatio = merged["contrast.max_ratio"] as number;

  if (minBody < 4.5 || minTitle < 3.0 || minUi < 3.0) {
    throw new Error("theme_contrast_bounds_invalid");
  }
  if (!Number.isFinite(maxRatio) || maxRatio <= 0 || maxRatio > 10) {
    throw new Error("theme_contrast_bounds_invalid");
  }
  if (minBody > maxRatio || minTitle > maxRatio || minUi > maxRatio) {
    throw new Error("theme_contrast_bounds_invalid");
  }

  const textSlots: Array<{ slot: string; minRatio: number }> = [
    { slot: "body", minRatio: minBody },
    { slot: "title", minRatio: minTitle },
    { slot: "subtitle", minRatio: minTitle },
    { slot: "caption", minRatio: minBody },
  ];
  const surfaceSlots: Array<{ slot: string; color: string }> = [
    { slot: "background", color: theme.surfaces.background.fill },
    { slot: "surface", color: theme.surfaces.surface.fill },
    { slot: "elevated", color: theme.surfaces.elevated.fill },
    { slot: "accent", color: theme.surfaces.accent.fill },
  ];

  for (const text of textSlots) {
    for (const surface of surfaceSlots) {
      const ratio = contrastRatio(theme.text.colorPrimary, surface.color);
      if (ratio < text.minRatio) {
        throw new Error(`theme_contrast_invalid (text.${text.slot} vs surface.${surface.slot})`);
      }
    }
  }

  const tableRatio = contrastRatio(theme.table.headerTextColor, theme.table.headerFill);
  if (tableRatio < minUi) {
    throw new Error("theme_contrast_invalid (table.headerTextColor vs table.headerFill)");
  }
  const bodyRatio = contrastRatio(theme.table.bodyTextColor, theme.table.bodyFill);
  if (bodyRatio < minUi) {
    throw new Error("theme_contrast_invalid (table.bodyTextColor vs table.bodyFill)");
  }
}

function normalizeThemeInput(themeInput: unknown, styleTokensInput: unknown): { name: string; overrides: TokenMap } {
  if (typeof themeInput === "undefined") {
    if (typeof styleTokensInput === "undefined") {
      return { name: DEFAULT_THEME_NAME, overrides: {} };
    }
    if (!isPlainObject(styleTokensInput)) {
      throw new Error("style_tokens_invalid_type");
    }
    return { name: DEFAULT_THEME_NAME, overrides: styleTokensInput };
  }

  if (typeof themeInput === "string") {
    if (typeof styleTokensInput === "undefined") {
      return { name: themeInput, overrides: {} };
    }
    if (!isPlainObject(styleTokensInput)) {
      throw new Error("style_tokens_invalid_type");
    }
    return { name: themeInput, overrides: styleTokensInput };
  }

  if (!isPlainObject(themeInput)) {
    throw new Error("theme_invalid_type");
  }

  const name = themeInput.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("theme_name_invalid");
  }
  const overrides = themeInput.overrides;
  if (typeof overrides === "undefined") {
    return { name, overrides: {} };
  }
  if (!isPlainObject(overrides)) {
    throw new Error("theme_overrides_invalid_type");
  }
  return { name, overrides };
}

export function resolveConcreteTheme(args: { themeInput: unknown; styleTokensInput: unknown }): ConcreteTheme {
  const normalizedInput = normalizeThemeInput(args.themeInput, args.styleTokensInput);
  const baseTokens = loadThemeTokens(normalizedInput.name);
  const normalizedBase = normalizeTokenMap(baseTokens, true);
  const normalizedOverrides = normalizeTokenMap(normalizedInput.overrides, false);

  const merged: Record<string, unknown> = { ...normalizedBase, ...normalizedOverrides };

  const theme: ConcreteTheme = {
    slide: { background: merged["color.background"] as string },
    surfaces: {
      background: {
        fill: merged["color.background"] as string,
        border: merged["color.border_default"] as string,
        textColor: merged["color.text_primary"] as string,
      },
      surface: {
        fill: merged["color.surface"] as string,
        border: merged["color.border_default"] as string,
        textColor: merged["color.text_primary"] as string,
      },
      elevated: {
        fill: merged["color.surface_elevated"] as string,
        border: merged["color.border_default"] as string,
        textColor: merged["color.text_primary"] as string,
      },
      accent: {
        fill: merged["color.surface_accent"] as string,
        border: merged["color.border_default"] as string,
        textColor: merged["color.text_primary"] as string,
      },
    },
    text: {
      fontFamily: merged["font_scale.body.family"] as string,
      colorPrimary: merged["color.text_primary"] as string,
      colorSecondary: merged["color.text_secondary"] as string,
    },
    colors: {
      primary: merged["color.primary"] as string,
      accent: merged["color.accent"] as string,
    },
    fontScale: {
      title: {
        family: merged["font_scale.title.family"] as string,
        size: merged["font_scale.title.size"] as number,
        weight: merged["font_scale.title.weight"] as number,
      },
      subtitle: {
        family: merged["font_scale.subtitle.family"] as string,
        size: merged["font_scale.subtitle.size"] as number,
        weight: merged["font_scale.subtitle.weight"] as number,
      },
      body: {
        family: merged["font_scale.body.family"] as string,
        size: merged["font_scale.body.size"] as number,
        weight: merged["font_scale.body.weight"] as number,
      },
      caption: {
        family: merged["font_scale.caption.family"] as string,
        size: merged["font_scale.caption.size"] as number,
        weight: merged["font_scale.caption.weight"] as number,
      },
    },
    spaceScale: [
      merged["space_scale.0"] as number,
      merged["space_scale.1"] as number,
      merged["space_scale.2"] as number,
      merged["space_scale.3"] as number,
      merged["space_scale.4"] as number,
      merged["space_scale.5"] as number,
    ],
    strokeScale: {
      thin: merged["stroke_scale.thin"] as number,
      normal: merged["stroke_scale.normal"] as number,
      heavy: merged["stroke_scale.heavy"] as number,
    },
    table: {
      headerFill: merged["color.table_header_fill"] as string,
      headerTextColor: merged["color.table_header_text"] as string,
      bodyFill: merged["color.table_body_fill"] as string,
      bodyTextColor: merged["color.table_body_text"] as string,
      border: merged["color.table_border"] as string,
    },
    chart: {
      palette: merged["chart.palette"] as string[],
      textColor: merged["color.text_primary"] as string,
      axisColor: merged["color.border_default"] as string,
      gridlineColor: merged["color.border_default"] as string,
      chartAreaFill: merged["color.background"] as string,
    },
    callout: {
      fill: merged["color.background"] as string,
      border: merged["color.primary"] as string,
      leader: merged["color.primary"] as string,
      textColor: merged["color.text_primary"] as string,
    },
    connector: { stroke: merged["color.primary"] as string },
    shape: { borderWidth: merged["shape.border_width_default"] as number },
    type: {
      fontFamilyPrimary: merged["type.font_family_primary"] as string,
      fontFamilySecondary: merged["type.font_family_secondary"] as string,
      bodySize: merged["type.body_size"] as number,
      smallSize: merged["type.small_size"] as number,
      weightMedium: merged["type.weight_medium"] as number,
      weightBold: merged["type.weight_bold"] as number,
    },
  };

  validateContrast(theme, merged);

  return theme;
}
