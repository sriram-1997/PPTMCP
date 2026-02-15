import type { BBox, EdgeElement, PreparedEdgeElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareEdgeElement(args: {
    slide: Slide;
    slideIndex: number;
    element: EdgeElement;
    elementIndex: number;
    z: number;
    order: number;
    id: string;
    bbox: BBox;
    theme: ConcreteTheme;
    nodeBBoxes: Map<string, BBox>;
    hardErrors: string[];
}): PreparedEdgeElement;
export declare function renderEdgeElement(slide: any, shapeType: any, element: PreparedEdgeElement): void;
//# sourceMappingURL=edge.d.ts.map