import fs from "fs";
import path from "path";
import type { BBox, ImageElement, PreparedImageElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { normalizeColor } from "./utils/color.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { EPSILON_INCHES, SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES } from "./utils/units.js";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function resolveImagePath(src: string, baseDir: string): string {
  if (path.isAbsolute(src)) {
    return src;
  }
  return path.resolve(baseDir, src);
}

function roundNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function resolveSurfaceColor(slot: string | undefined, theme: ConcreteTheme): string | null {
  switch (slot) {
    case "surface.background":
      return theme.surfaces.background.fill;
    case "surface.surface":
      return theme.surfaces.surface.fill;
    case "surface.elevated":
      return theme.surfaces.elevated.fill;
    case "surface.accent":
      return theme.surfaces.accent.fill;
    default:
      return null;
  }
}

function isFullSlide(bbox: BBox): boolean {
  return (
    Math.abs(bbox.x) <= EPSILON_INCHES &&
    Math.abs(bbox.y) <= EPSILON_INCHES &&
    Math.abs(bbox.width - SLIDE_WIDTH_INCHES) <= EPSILON_INCHES &&
    Math.abs(bbox.height - SLIDE_HEIGHT_INCHES) <= EPSILON_INCHES
  );
}

function buildMaskedSvg(args: {
  imageData: string;
  mimeType: string;
  widthPt: number;
  heightPt: number;
  fit: "contain" | "cover";
  crop: { left: number; right: number; top: number; bottom: number };
  opacity: number;
  overlay?: { color: string; opacity: number };
  radiusPt: number;
}): string {
  const w = roundNumber(args.widthPt);
  const h = roundNumber(args.heightPt);
  const cropX = roundNumber(w * args.crop.left);
  const cropY = roundNumber(h * args.crop.top);
  const cropW = roundNumber(w * (1 - args.crop.left - args.crop.right));
  const cropH = roundNumber(h * (1 - args.crop.top - args.crop.bottom));
  const radius = Math.max(0, Math.min(args.radiusPt, cropW / 2, cropH / 2));
  const preserve = args.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
  const overlay =
    args.overlay &&
    `<rect x="${cropX}" y="${cropY}" width="${cropW}" height="${cropH}" rx="${roundNumber(radius)}" ry="${roundNumber(
      radius
    )}" fill="#${args.overlay.color}" opacity="${args.overlay.opacity}"/>`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `<defs>`,
    `<clipPath id="clip"><rect x="${cropX}" y="${cropY}" width="${cropW}" height="${cropH}" rx="${roundNumber(
      radius
    )}" ry="${roundNumber(radius)}"/></clipPath>`,
    `</defs>`,
    `<g clip-path="url(#clip)">`,
    `<image href="data:${args.mimeType};base64,${args.imageData}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="${preserve}" opacity="${args.opacity}"/>`,
    overlay || "",
    `</g>`,
    `</svg>`,
  ].join("");
}

export function prepareImageElement(args: {
  slide: Slide;
  slideIndex: number;
  element: ImageElement;
  elementIndex: number;
  z: number;
  order: number;
  id: string;
  bbox: BBox;
  theme: ConcreteTheme;
  baseDir: string;
  hardErrors: string[];
}): PreparedImageElement {
  const rawSrc = args.element.src;
  let resolvedPath = rawSrc || "";
  if (!rawSrc || rawSrc.trim().length === 0) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_not_found`
    );
  } else {
    resolvedPath = resolveImagePath(rawSrc, args.baseDir);
    const ext = path.extname(resolvedPath).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_type_not_supported`
      );
    }
    if (!fs.existsSync(resolvedPath)) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_not_found`
      );
    }
  }

  const defaults = resolveElementStyleDefaults(args.element, args.theme);
  const boxDefaults = defaults.imageStyle?.box;
  const borderWidthPt = args.element.style?.borderWidthPt ?? boxDefaults?.borderWidth ?? 0;
  const borderColor = normalizeColor(args.element.style?.borderColor, boxDefaults?.border ?? "000000");
  const fillColor = boxDefaults?.fill;

  const opacity = typeof args.element.opacity === "number" ? args.element.opacity : 1;
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_opacity_invalid`
    );
  }
  const cropInput = args.element.crop ?? {};
  const crop = {
    left: typeof cropInput.left === "number" ? cropInput.left : 0,
    right: typeof cropInput.right === "number" ? cropInput.right : 0,
    top: typeof cropInput.top === "number" ? cropInput.top : 0,
    bottom: typeof cropInput.bottom === "number" ? cropInput.bottom : 0,
  };
  if (
    [crop.left, crop.right, crop.top, crop.bottom].some((value) => value < 0 || value > 1 || !Number.isFinite(value)) ||
    crop.left + crop.right >= 1 ||
    crop.top + crop.bottom >= 1
  ) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_crop_invalid`
    );
  }
  const hasCrop = crop.left > 0 || crop.right > 0 || crop.top > 0 || crop.bottom > 0;

  const overlaySlot =
    typeof args.element.overlaySurfaceSlot === "string" ? args.element.overlaySurfaceSlot : undefined;
  const overlayOpacity = typeof args.element.overlayOpacity === "number" ? args.element.overlayOpacity : undefined;
  if (typeof overlayOpacity === "number" && (overlayOpacity < 0 || overlayOpacity > 1)) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_overlay_invalid`
    );
  }
  const overlayColor = overlaySlot ? resolveSurfaceColor(overlaySlot, args.theme) : null;
  if (overlaySlot && !overlayColor) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_overlay_invalid`
    );
  }
  if (overlaySlot && typeof overlayOpacity === "undefined") {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_overlay_invalid`
    );
  }
  if (typeof overlayOpacity !== "undefined" && !overlaySlot) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_overlay_invalid`
    );
  }
  if (overlaySlot && !isFullSlide(args.bbox)) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_overlay_invalid`
    );
  }

  const borderRadiusPt = typeof args.element.borderRadiusPt === "number" ? args.element.borderRadiusPt : 0;
  const maxRadius = (Math.min(args.bbox.width, args.bbox.height) * 72) / 2;
  if (borderRadiusPt < 0 || borderRadiusPt > maxRadius) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_border_radius_invalid`
    );
  }

  let svgData: string | undefined;
  if (opacity < 1 || hasCrop || borderRadiusPt > 0 || overlaySlot) {
    try {
      const buffer = fs.readFileSync(resolvedPath);
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      const imageData = buffer.toString("base64");
      const svg = buildMaskedSvg({
        imageData,
        mimeType,
        widthPt: args.bbox.width * 72,
        heightPt: args.bbox.height * 72,
        fit: args.element.fit === "cover" ? "cover" : "contain",
        crop,
        opacity,
        overlay: overlayColor && typeof overlayOpacity === "number" ? { color: overlayColor, opacity: overlayOpacity } : undefined,
        radiusPt: borderRadiusPt,
      });
      svgData = `image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`;
    } catch (error) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_mask_failed`
      );
    }
  }

  return {
    kind: "image",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant: args.element.variant,
    bbox: args.bbox,
    src: resolvedPath,
    fit: args.element.fit,
    opacity,
    crop,
    overlay: overlayColor && typeof overlayOpacity === "number" ? { color: overlayColor, opacity: overlayOpacity } : undefined,
    borderRadiusPt,
    data: svgData,
    style: {
      borderColor,
      borderWidthPt,
      fillColor,
    },
  };
}

export function renderImageElement(slide: any, shapeType: any, element: PreparedImageElement): void {
  if (element.style.fillColor || element.style.borderWidthPt > 0) {
    const shapeOpts: any = {
      x: element.bbox.x,
      y: element.bbox.y,
      w: element.bbox.width,
      h: element.bbox.height,
    };
    if (element.style.fillColor) {
      shapeOpts.fill = { color: element.style.fillColor };
    } else {
      shapeOpts.fill = { type: "none" };
    }
    if (element.style.borderWidthPt > 0) {
      shapeOpts.line = { color: element.style.borderColor, width: element.style.borderWidthPt };
    }
    slide.addShape(shapeType.rect, {
      ...shapeOpts,
    });
  }
  if (element.data) {
    slide.addImage({
      data: element.data,
      x: element.bbox.x,
      y: element.bbox.y,
      w: element.bbox.width,
      h: element.bbox.height,
    });
    return;
  }
  slide.addImage({
    path: element.src,
    x: element.bbox.x,
    y: element.bbox.y,
    w: element.bbox.width,
    h: element.bbox.height,
    sizing: {
      type: element.fit,
      w: element.bbox.width,
      h: element.bbox.height,
    },
  });
}
