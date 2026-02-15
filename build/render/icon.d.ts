import type { BBox, IconElement, PreparedIconElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareIconElement(args: {
    slide: Slide;
    slideIndex: number;
    element: IconElement;
    elementIndex: number;
    z: number;
    order: number;
    id: string;
    bbox: BBox;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedIconElement;
export declare function renderIconElement(slide: any, shapeType: any, element: PreparedIconElement): void;
//# sourceMappingURL=icon.d.ts.map