import type { Slide, ValidationReportEntry, ValidationAction } from "./types.js";
export declare function validateSpec(spec: unknown, strict: boolean): {
    valid: boolean;
    errors: string[];
};
export declare function addValidationEntry(args: {
    report: ValidationReportEntry[];
    slideIndex: number;
    slide: Slide;
    elementIndex: number;
    elementType: "text" | "table";
    region: string;
    estimate: {
        overflowWidth: boolean;
        overflowHeight: boolean;
        requiredWidthPt: number;
        requiredHeightPt: number;
        availableWidthPt: number;
        availableHeightPt: number;
    };
    minFont: number;
    appliedFont: number;
    action: ValidationAction;
    details: string;
}): ValidationReportEntry;
export declare function buildOverflowMessage(entry: ValidationReportEntry): string;
//# sourceMappingURL=validate.d.ts.map