import type { BBox, PreparedTableElement, Slide, TableElement, ValidationReportEntry } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareTableElement(args: {
    slide: Slide;
    slideIndex: number;
    element: TableElement;
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
}): PreparedTableElement;
export declare function renderTableElement(slide: any, element: PreparedTableElement): void;
//# sourceMappingURL=table.d.ts.map