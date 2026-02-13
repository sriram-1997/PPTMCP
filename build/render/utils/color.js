export function normalizeColor(value, fallback) {
    if (!value || typeof value !== "string") {
        return fallback;
    }
    return value.replace("#", "").toUpperCase();
}
//# sourceMappingURL=color.js.map