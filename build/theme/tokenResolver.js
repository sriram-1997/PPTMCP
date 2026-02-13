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
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizeHexColor(value, key) {
    if (typeof value !== "string") {
        throw new Error(`style_token_invalid (${key})`);
    }
    const match = value.match(/^#([0-9a-fA-F]{6})$/);
    if (!match) {
        throw new Error(`style_token_invalid (${key})`);
    }
    return match[1].toUpperCase();
}
function normalizeNumber(value, key) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new Error(`style_token_invalid (${key})`);
    }
    return value;
}
function normalizeString(value, key) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`style_token_invalid (${key})`);
    }
    return value;
}
function normalizePalette(value, key) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`style_token_invalid (${key})`);
    }
    return value.map((entry) => normalizeHexColor(entry, key));
}
function normalizeTokenMap(tokens, requireAll) {
    const normalized = {};
    const keys = Object.keys(tokens);
    for (const key of keys) {
        if (!TOKEN_SET.has(key)) {
            throw new Error(`unknown_style_token (${key})`);
        }
        const value = tokens[key];
        if (key.startsWith("color.")) {
            normalized[key] = normalizeHexColor(value, key);
        }
        else if (key === "chart.palette") {
            normalized[key] = normalizePalette(value, key);
        }
        else if (key.startsWith("type.")) {
            if (key.includes("font_family")) {
                normalized[key] = normalizeString(value, key);
            }
            else {
                normalized[key] = normalizeNumber(value, key);
            }
        }
        else if (key.startsWith("shape.")) {
            normalized[key] = normalizeNumber(value, key);
        }
        else {
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
function normalizeThemeInput(themeInput, styleTokensInput) {
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
export function resolveConcreteTheme(args) {
    const normalizedInput = normalizeThemeInput(args.themeInput, args.styleTokensInput);
    const baseTokens = loadThemeTokens(normalizedInput.name);
    const normalizedBase = normalizeTokenMap(baseTokens, true);
    const normalizedOverrides = normalizeTokenMap(normalizedInput.overrides, false);
    const merged = { ...normalizedBase, ...normalizedOverrides };
    const theme = {
        slide: { background: merged["color.background"] },
        surfaces: {
            surface: {
                fill: merged["color.surface"],
                border: merged["color.border_default"],
                textColor: merged["color.text_primary"],
            },
            elevated: {
                fill: merged["color.surface_elevated"],
                border: merged["color.border_default"],
                textColor: merged["color.text_primary"],
            },
            accent: {
                fill: merged["color.surface_accent"],
                border: merged["color.border_default"],
                textColor: merged["color.text_primary"],
            },
        },
        text: {
            fontFamily: merged["type.font_family_primary"],
            colorPrimary: merged["color.text_primary"],
            colorSecondary: merged["color.text_secondary"],
        },
        table: {
            headerFill: merged["color.surface"],
            headerTextColor: merged["color.text_primary"],
            bodyFill: merged["color.surface"],
            bodyTextColor: merged["color.text_primary"],
            border: merged["color.border_default"],
        },
        chart: {
            palette: merged["chart.palette"],
            textColor: merged["color.text_primary"],
            axisColor: merged["color.border_default"],
            gridlineColor: merged["color.border_default"],
            chartAreaFill: merged["color.background"],
        },
        callout: {
            fill: merged["color.background"],
            border: merged["color.primary"],
            leader: merged["color.primary"],
            textColor: merged["color.text_primary"],
        },
        connector: { stroke: merged["color.primary"] },
        shape: { borderWidth: merged["shape.border_width_default"] },
        type: {
            fontFamilyPrimary: merged["type.font_family_primary"],
            fontFamilySecondary: merged["type.font_family_secondary"],
            bodySize: merged["type.body_size"],
            smallSize: merged["type.small_size"],
            weightMedium: merged["type.weight_medium"],
            weightBold: merged["type.weight_bold"],
        },
    };
    return theme;
}
//# sourceMappingURL=tokenResolver.js.map