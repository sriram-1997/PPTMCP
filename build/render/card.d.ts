import type { BBox, CardElement, PreparedCardElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function prepareCardElement(args: {
    slideIndex: number;
    elementIndex: number;
    element: CardElement;
    bbox: BBox;
    z: number;
    order: number;
    id: string;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedCardElement;
export declare function renderCardElement(slide: any, shapeType: any, element: PreparedCardElement): void;
//# sourceMappingURL=card.d.ts.map