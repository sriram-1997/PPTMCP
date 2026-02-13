import type { BBox, ImageElement, PreparedImageElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareImageElement(args: {
    slide: Slide;
    slideIndex: number;
    element: ImageElement;
    elementIndex: number;
    z: number;
    order: number;
    id: string;
    bbox: BBox;
    theme: ConcreteTheme;
    baseDir: string;
    hardErrors: string[];
}): PreparedImageElement;
export declare function renderImageElement(slide: any, shapeType: any, element: PreparedImageElement): void;
//# sourceMappingURL=image.d.ts.map