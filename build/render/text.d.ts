import type { BBox, PreparedTextElement, Slide, TextElement, ValidationReportEntry } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function textUnits(text: string): number;
interface TextEstimate {
    requiredWidthPt: number;
    requiredHeightPt: number;
    availableWidthPt: number;
    availableHeightPt: number;
    overflowWidth: boolean;
    overflowHeight: boolean;
    wrappedLines: string[];
    maxUnitsPerLine: number;
}
export declare function estimateTextLayout(args: {
    text: string;
    fontSize: number;
    bold: boolean;
    bbox: BBox;
    paddingPt: number;
    lineHeight: number;
}): TextEstimate;
export declare function truncateTextToFit(args: {
    text: string;
    fontSize: number;
    bold: boolean;
    bbox: BBox;
    paddingPt: number;
    lineHeight: number;
}): {
    text: string;
    estimate: TextEstimate;
};
export declare function prepareTextElement(args: {
    slide: Slide;
    slideIndex: number;
    element: TextElement;
    elementIndex: number;
    z: number;
    order: number;
    id: string;
    bbox: BBox;
    theme: ConcreteTheme;
    allowOverflow: boolean;
    validationReport: ValidationReportEntry[];
    warnings: string[];
    hardErrors: string[];
}): PreparedTextElement;
export declare function renderTextElement(slide: any, shapeType: any, element: PreparedTextElement): void;
export {};
//# sourceMappingURL=text.d.ts.map