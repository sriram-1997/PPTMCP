import type { BBox, NodeElement, PreparedNodeElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareNodeElement(args: {
    slideIndex: number;
    elementIndex: number;
    element: NodeElement;
    bbox: BBox;
    z: number;
    order: number;
    id: string;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedNodeElement;
export declare function renderNodeElement(slide: any, shapeType: any, element: PreparedNodeElement): void;
//# sourceMappingURL=node.d.ts.map