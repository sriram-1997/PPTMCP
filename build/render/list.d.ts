import type { BBox, ListElement, ListSpec, PreparedListElement, PreparedListLayout } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function layoutList(args: {
    list: ListSpec;
    bbox: BBox;
    theme: ConcreteTheme;
    hardErrors?: string[];
    prefix?: string;
    enforceFit?: boolean;
}): PreparedListLayout;
export declare function prepareListElement(args: {
    slideIndex: number;
    elementIndex: number;
    element: ListElement;
    bbox: BBox;
    z: number;
    order: number;
    id: string;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedListElement;
export declare function renderListLayout(slide: any, shapeType: any, layout: PreparedListLayout, overrides?: {
    fontFace?: string;
    fontSize?: number;
    color?: string;
}): void;
export declare function renderListElement(slide: any, shapeType: any, element: PreparedListElement): void;
//# sourceMappingURL=list.d.ts.map