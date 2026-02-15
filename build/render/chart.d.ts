import type { BBox, ChartElement, PreparedChartElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareChartElement(args: {
    slideIndex: number;
    elementIndex: number;
    element: ChartElement;
    bbox: BBox;
    z: number;
    order: number;
    id: string;
    theme: ConcreteTheme;
    allowDenseCharts: boolean;
    warnings: string[];
    hardErrors: string[];
}): PreparedChartElement;
export declare function renderChartElement(slide: any, shapeType: any, element: PreparedChartElement, theme: ConcreteTheme): void;
//# sourceMappingURL=chart.d.ts.map