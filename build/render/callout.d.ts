import type { BBox, CalloutElement, PreparedCalloutElement, Slide, ValidationReportEntry } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareCalloutElement(args: {
    slide: Slide;
    slideIndex: number;
    element: CalloutElement;
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
}): PreparedCalloutElement;
export declare function renderCalloutElement(slide: any, shapeType: any, element: PreparedCalloutElement, theme: ConcreteTheme): void;
//# sourceMappingURL=callout.d.ts.map