import type { ConcreteTheme } from "./types.js";
export type SurfaceVariant = "surface" | "elevated" | "accent";
export type ArrowType = "none" | "triangle";
export interface BoxStyle {
    fill: string;
    border: string;
    borderWidth: number;
    textColor: string;
}
export interface StrokeStyle {
    color: string;
    widthPt: number;
    dash?: "solid" | "dash" | "dot";
    startArrow?: ArrowType;
    endArrow?: ArrowType;
}
export interface TextStyle {
    fontFace: string;
    fontSize?: number;
    color: string;
}
export interface ImageStyle {
    fit: "contain" | "cover";
    box?: BoxStyle;
}
export interface StyleDefaults {
    boxStyle?: BoxStyle;
    strokeStyle?: StrokeStyle;
    textStyle?: TextStyle;
    imageStyle?: ImageStyle;
}
export declare function resolveElementStyleDefaults(element: {
    type: string;
    variant?: unknown;
    fit?: unknown;
}, theme: ConcreteTheme): StyleDefaults;
//# sourceMappingURL=styleDefaults.d.ts.map