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
    } else if (key.startsWith("type.")) {
      if (key.includes("font_family")) {
        normalized[key] = normalizeString(value, key);
      } else {
        normalized[key] = normalizeNumber(value, key);
      }
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
      fontFamily: merged["type.font_family_primary"] as string,
      colorPrimary: merged["color.text_primary"] as string,
      colorSecondary: merged["color.text_secondary"] as string,
    },
    table: {
      headerFill: merged["color.surface"] as string,
      headerTextColor: merged["color.text_primary"] as string,
      bodyFill: merged["color.surface"] as string,
      bodyTextColor: merged["color.text_primary"] as string,
      border: merged["color.border_default"] as string,
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

  return theme;
}
