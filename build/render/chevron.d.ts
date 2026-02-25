import type { BBox, ChevronFlowElement, PreparedChevronFlowElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareChevronFlowElement(args: {
    slideIndex: number;
    elementIndex: number;
    element: ChevronFlowElement;
    bbox: BBox;
    z: number;
    order: number;
    id: string;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedChevronFlowElement;
export declare function renderChevronFlowElement(slide: any, shapeType: any, element: PreparedChevronFlowElement, theme: ConcreteTheme): void;
//# sourceMappingURL=chevron.d.ts.map