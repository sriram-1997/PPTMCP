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
function normalizeNonNegativeNumber(value, key) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
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
        else if (key.startsWith("font_scale.")) {
            if (key.endsWith(".family")) {
                normalized[key] = normalizeString(value, key);
            }
            else {
                normalized[key] = normalizeNumber(value, key);
            }
        }
        else if (key.startsWith("space_scale.")) {
            normalized[key] = normalizeNonNegativeNumber(value, key);
        }
        else if (key.startsWith("stroke_scale.")) {
            normalized[key] = normalizeNumber(value, key);
        }
        else if (key.startsWith("type.")) {
            if (key.includes("font_family")) {
                normalized[key] = normalizeString(value, key);
            }
            else {
                normalized[key] = normalizeNumber(value, key);
            }
        }
        else if (key.startsWith("contrast.")) {
            normalized[key] = normalizeNumber(value, key);
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
function hexToRgb(hex) {
    if (hex.length !== 6) {
        throw new Error("theme_contrast_invalid (invalid color length)");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
}
function linearizeChannel(value) {
    const channel = value / 255;
    if (channel <= 0.03928) {
        return channel / 12.92;
    }
    return Math.pow((channel + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rl = linearizeChannel(r);
    const gl = linearizeChannel(g);
    const bl = linearizeChannel(b);
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}
function contrastRatio(foreground, background) {
    const lum1 = luminance(foreground);
    const lum2 = luminance(background);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}
function validateContrast(theme, merged) {
    const minBody = merged["contrast.min_ratio_body"];
    const minTitle = merged["contrast.min_ratio_title"];
    const minUi = merged["contrast.min_ratio_ui"];
    const maxRatio = merged["contrast.max_ratio"];
    if (minBody < 4.5 || minTitle < 3.0 || minUi < 3.0) {
        throw new Error("theme_contrast_bounds_invalid");
    }
    if (!Number.isFinite(maxRatio) || maxRatio <= 0 || maxRatio > 10) {
        throw new Error("theme_contrast_bounds_invalid");
    }
    if (minBody > maxRatio || minTitle > maxRatio || minUi > maxRatio) {
        throw new Error("theme_contrast_bounds_invalid");
    }
    const textSlots = [
        { slot: "body", minRatio: minBody },
        { slot: "title", minRatio: minTitle },
        { slot: "subtitle", minRatio: minTitle },
        { slot: "caption", minRatio: minBody },
    ];
    const surfaceSlots = [
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
            background: {
                fill: merged["color.background"],
                border: merged["color.border_default"],
                textColor: merged["color.text_primary"],
            },
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
            fontFamily: merged["font_scale.body.family"],
            colorPrimary: merged["color.text_primary"],
            colorSecondary: merged["color.text_secondary"],
        },
        colors: {
            primary: merged["color.primary"],
            accent: merged["color.accent"],
        },
        fontScale: {
            title: {
                family: merged["font_scale.title.family"],
                size: merged["font_scale.title.size"],
                weight: merged["font_scale.title.weight"],
            },
            subtitle: {
                family: merged["font_scale.subtitle.family"],
                size: merged["font_scale.subtitle.size"],
                weight: merged["font_scale.subtitle.weight"],
            },
            body: {
                family: merged["font_scale.body.family"],
                size: merged["font_scale.body.size"],
                weight: merged["font_scale.body.weight"],
            },
            caption: {
                family: merged["font_scale.caption.family"],
                size: merged["font_scale.caption.size"],
                weight: merged["font_scale.caption.weight"],
            },
        },
        spaceScale: [
            merged["space_scale.0"],
            merged["space_scale.1"],
            merged["space_scale.2"],
            merged["space_scale.3"],
            merged["space_scale.4"],
            merged["space_scale.5"],
        ],
        strokeScale: {
            thin: merged["stroke_scale.thin"],
            normal: merged["stroke_scale.normal"],
            heavy: merged["stroke_scale.heavy"],
        },
        table: {
            headerFill: merged["color.table_header_fill"],
            headerTextColor: merged["color.table_header_text"],
            bodyFill: merged["color.table_body_fill"],
            bodyTextColor: merged["color.table_body_text"],
            border: merged["color.table_border"],
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
    validateContrast(theme, merged);
    return theme;
}
//# sourceMappingURL=tokenResolver.js.map