import type { AnchorPoint, BBox, GridConfig, IntegrityDebugReport, PreparedSlide, RegionConfig, Regions, SlideProgramSpec, ValidationReportEntry } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function computeRegionBBox(region: RegionConfig, grid: GridConfig): BBox;
export declare function resolveRegionAnchor(args: {
    anchor: {
        type: string;
        targetRegion: string;
        point: AnchorPoint;
        dxPt?: number;
        dyPt?: number;
    };
    regions: Regions;
    grid: GridConfig;
}): {
    x: number;
    y: number;
};
export declare function isPointInside(bbox: BBox, point: {
    x: number;
    y: number;
}): boolean;
export declare function isBoxInside(container: BBox, box: BBox): boolean;
export declare function nearestPointOnBoxPerimeter(box: BBox, point: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
export declare function prepareSlides(args: {
    spec: SlideProgramSpec;
    theme: ConcreteTheme;
    baseDir: string;
    allowOverflow: boolean;
    allowDenseCharts: boolean;
    validationReport: ValidationReportEntry[];
    warnings: string[];
    hardErrors: string[];
}): PreparedSlide[];
export declare function buildIntegrityDebug(args: {
    spec: SlideProgramSpec;
    preparedSlides: PreparedSlide[];
}): IntegrityDebugReport;
//# sourceMappingURL=slide.d.ts.map