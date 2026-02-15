import type { BBox, NodeElement, PreparedNodeElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { resolveIconData } from "./utils/icons.js";
import { normalizeColor } from "./utils/color.js";
import { ptToIn } from "./utils/units.js";
import { estimateTextLayout } from "./text.js";

const DEFAULT_LINE_HEIGHT = 1.2;

function resolvePaddingPt(token: number | undefined, theme: ConcreteTheme): number {
  if (typeof token === "number" && Number.isInteger(token) && token >= 0 && token <= 5) {
    return theme.spaceScale[token] ?? theme.spaceScale[2] ?? 0;
  }
  return theme.spaceScale[2] ?? theme.spaceScale[1] ?? 0;
}

function resolveRadiusIn(theme: ConcreteTheme): number {
  const radiusPt = theme.spaceScale[2] ?? theme.spaceScale[1] ?? theme.strokeScale.normal;
  return ptToIn(radiusPt);
}

export function prepareNodeElement(args: {
  slideIndex: number;
  elementIndex: number;
  element: NodeElement;
  bbox: BBox;
  z: number;
  order: number;
  id: string;
  theme: ConcreteTheme;
  hardErrors: string[];
}): PreparedNodeElement {
  const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
  const variant = args.element.variant ?? "surface";
  const surface = args.theme.surfaces[variant];

  if (args.element.shape !== "rounded-rect") {
    args.hardErrors.push(`${prefix} node_shape_invalid`);
  }

  const paddingPt = resolvePaddingPt(args.element.paddingToken, args.theme);
  const radius = resolveRadiusIn(args.theme);

  const innerX = args.bbox.x + ptToIn(paddingPt);
  const innerY = args.bbox.y + ptToIn(paddingPt);
  const innerW = args.bbox.width - ptToIn(paddingPt * 2);
  const innerH = args.bbox.height - ptToIn(paddingPt * 2);

  if (innerW <= 0 || innerH <= 0) {
    args.hardErrors.push(`${prefix} node_overflow`);
  }

  const font = args.theme.fontScale.body;
  const bold = font.weight >= args.theme.type.weightBold;
  const labelText = args.element.label ?? "";
  const textEstimate = estimateTextLayout({
    text: labelText,
    fontSize: font.size,
    bold,
    bbox: { x: 0, y: 0, width: Math.max(0, innerW), height: Math.max(0, innerH) },
    paddingPt: 0,
    lineHeight: DEFAULT_LINE_HEIGHT,
  });
  const labelHeightPt = textEstimate.requiredHeightPt;

  let iconBox: PreparedNodeElement["icon"] | undefined;
  let iconSizePt = 0;
  let iconGapPt = 0;

  if (args.element.icon) {
    iconSizePt = args.theme.spaceScale[4] ?? args.theme.spaceScale[3] ?? font.size;
    iconGapPt = args.theme.spaceScale[1] ?? 0;
    const maxIconPt = Math.max(0, Math.min(innerW * 72, innerH * 72 - labelHeightPt - iconGapPt));
    if (maxIconPt <= 0) {
      args.hardErrors.push(`${prefix} node_overflow`);
      iconSizePt = 0;
      iconGapPt = 0;
    } else if (iconSizePt > maxIconPt) {
      iconSizePt = maxIconPt;
    }

    const iconResult = resolveIconData({
      name: args.element.icon,
      color: normalizeColor(surface.textColor, surface.textColor),
    });
    if (iconResult.error || !iconResult.data) {
      args.hardErrors.push(`${prefix} icon_not_found`);
    } else {
      const iconSizeIn = ptToIn(iconSizePt);
      const totalContentPt = iconSizePt + iconGapPt + labelHeightPt;
      const startY = innerY + ptToIn(Math.max(0, (innerH * 72 - totalContentPt) / 2));
      iconBox = {
        bbox: {
          x: innerX + Math.max(0, (innerW - iconSizeIn) / 2),
          y: startY,
          width: iconSizeIn,
          height: iconSizeIn,
        },
        data: iconResult.data,
      };
    }
  }

  const totalContentPt = iconSizePt + iconGapPt + labelHeightPt;
  if (totalContentPt > innerH * 72 + 0.1) {
    args.hardErrors.push(`${prefix} node_overflow`);
  }

  const labelY = innerY + ptToIn(Math.max(0, (innerH * 72 - totalContentPt) / 2 + iconSizePt + iconGapPt));
  const labelBox: BBox = {
    x: innerX,
    y: labelY,
    width: Math.max(0, innerW),
    height: Math.max(0, labelHeightPt / 72),
  };

  return {
    kind: "node",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant,
    bbox: args.bbox,
    shape: "rounded-rect",
    radius,
    style: {
      fill: surface.fill,
      border: surface.border,
      borderWidth: args.theme.strokeScale.thin,
    },
    icon: iconBox,
    label: {
      text: labelText,
      bbox: labelBox,
      fontFace: font.family,
      fontSize: font.size,
      bold,
      color: surface.textColor,
    },
  };
}

export function renderNodeElement(slide: any, shapeType: any, element: PreparedNodeElement): void {
  slide.addShape(shapeType.roundRect, {
    x: element.bbox.x,
    y: element.bbox.y,
    w: element.bbox.width,
    h: element.bbox.height,
    fill: { color: element.style.fill },
    line: { color: element.style.border, width: element.style.borderWidth },
    rectRadius: element.radius,
  });

  if (element.icon) {
    slide.addImage({
      data: element.icon.data,
      x: element.icon.bbox.x,
      y: element.icon.bbox.y,
      w: element.icon.bbox.width,
      h: element.icon.bbox.height,
    });
  }

  slide.addText(element.label.text, {
    x: element.label.bbox.x,
    y: element.label.bbox.y,
    w: element.label.bbox.width,
    h: element.label.bbox.height,
    fontFace: element.label.fontFace,
    fontSize: element.label.fontSize,
    bold: element.label.bold,
    color: element.label.color,
    align: "center",
    valign: "top",
    margin: 0,
    breakLine: true,
    lineSpacingMultiple: DEFAULT_LINE_HEIGHT,
  });
}
