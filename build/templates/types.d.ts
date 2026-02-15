import type { AnchorPoint } from "../render/types.js";
export type TemplateVariant = "surface" | "elevated" | "accent";
export type TemplateKind = "text" | "list" | "table" | "chart" | "card" | "callout" | "connector" | "image" | "icon";
export type TextStyleSlot = "text.title" | "text.subtitle" | "text.body" | "text.caption";
export type StrokeSlot = "stroke.thin" | "stroke.normal" | "stroke.heavy";
export interface TemplateGrid {
    cols: number;
    rows: number;
    gutter: number;
}
export interface TemplateRegion {
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
}
export interface TemplateAnchor {
    target: string;
    point?: AnchorPoint;
    anchor?: "top" | "bottom" | "left" | "right" | "center";
    dxPt?: number;
    dyPt?: number;
}
export interface TemplateStyleSlots {
    text?: TextStyleSlot;
    padding?: number;
    stroke?: StrokeSlot;
}
export interface TemplatePlaceholderPolicies {
    required?: boolean;
}
export interface TemplatePlaceholder {
    id: string;
    kind: TemplateKind;
    region: TemplateRegion;
    layer?: string;
    z?: number;
    variant?: TemplateVariant;
    styleSlots?: TemplateStyleSlots;
    policies?: TemplatePlaceholderPolicies;
    allowedKinds?: TemplateKind[];
    minItems?: number;
    maxItems?: number;
    layoutMode?: "single" | "vstack" | "hstack" | "grid";
    gapToken?: number;
    gridRows?: number;
    gridCols?: number;
    anchor?: TemplateAnchor;
    box?: {
        wIn: number;
        hIn: number;
        placement: "auto" | "ne" | "nw" | "se" | "sw" | "n" | "s" | "e" | "w";
        paddingSlot?: number;
    };
    start?: TemplateAnchor;
    end?: TemplateAnchor;
    leader?: {
        startArrow?: "none" | "triangle";
        endArrow?: "none" | "triangle";
    };
    connectorStyle?: {
        startArrow?: "none" | "triangle";
        endArrow?: "none" | "triangle";
    };
}
export interface TemplateLayer {
    id: string;
    z: number;
}
export interface TemplateDefaults {
    text?: TextStyleSlot;
    padding?: number;
    stroke?: StrokeSlot;
}
export interface TemplatePolicies {
    requireAllPlaceholders?: boolean;
}
export interface TemplateDefinition {
    id: string;
    title?: string;
    extends?: string;
    grid?: TemplateGrid;
    placeholders: TemplatePlaceholder[];
    layers?: TemplateLayer[];
    defaultSlots?: TemplateDefaults;
    policies?: TemplatePolicies;
    variants?: Record<string, {
        placeholders?: Array<{
            id: string;
            paddingToken?: number;
            gapToken?: number;
            styleSlots?: TemplateStyleSlots;
            region?: TemplateRegion;
        }>;
    }>;
}
//# sourceMappingURL=types.d.ts.map