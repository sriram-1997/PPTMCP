function resolveVariant(variant) {
    if (variant === "surface" || variant === "elevated" || variant === "accent") {
        return variant;
    }
    return null;
}
export function resolveElementStyleDefaults(element, theme) {
    const variant = resolveVariant(element.variant);
    const surface = variant ? theme.surfaces[variant] : null;
    const baseBox = surface
        ? {
            fill: surface.fill,
            border: surface.border,
            borderWidth: theme.shape.borderWidth,
            textColor: surface.textColor,
        }
        : undefined;
    switch (element.type) {
        case "text":
            return {
                textStyle: {
                    fontFace: theme.text.fontFamily,
                    color: surface ? surface.textColor : theme.text.colorPrimary,
                },
            };
        case "table":
            return {
                boxStyle: baseBox,
                textStyle: {
                    fontFace: theme.text.fontFamily,
                    color: surface ? surface.textColor : theme.text.colorPrimary,
                },
            };
        case "chart":
            return {
                boxStyle: baseBox,
                textStyle: {
                    fontFace: theme.text.fontFamily,
                    color: theme.chart.textColor,
                },
            };
        case "callout":
            return {
                boxStyle: baseBox,
                strokeStyle: {
                    color: surface ? surface.border : theme.callout.leader,
                    widthPt: theme.shape.borderWidth,
                    startArrow: "none",
                    endArrow: "none",
                },
                textStyle: {
                    fontFace: theme.text.fontFamily,
                    color: surface ? surface.textColor : theme.callout.textColor,
                },
            };
        case "connector":
            return {
                strokeStyle: {
                    color: surface ? surface.border : theme.connector.stroke,
                    widthPt: theme.shape.borderWidth,
                    startArrow: "none",
                    endArrow: "none",
                },
            };
        case "image":
            return {
                imageStyle: {
                    fit: element.fit === "cover" ? "cover" : "contain",
                    box: baseBox,
                },
            };
        default:
            return {};
    }
}
//# sourceMappingURL=styleDefaults.js.map