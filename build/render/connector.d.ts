import type { BBox, ConnectorElement, PreparedConnectorElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function normalizeLineRect(start: {
    x: number;
    y: number;
}, end: {
    x: number;
    y: number;
}): {
    rect: BBox;
    error: string | null;
    dx: number;
    dy: number;
    flipV: boolean;
    flipH: boolean;
};
export declare function prepareConnectorElement(args: {
    slide: Slide;
    slideIndex: number;
    element: ConnectorElement;
    elementIndex: number;
    z: number;
    order: number;
    id: string;
    bbox: BBox;
    theme: ConcreteTheme;
    hardErrors: string[];
}): PreparedConnectorElement;
export declare function renderConnectorElement(slide: any, shapeType: any, element: PreparedConnectorElement): void;
//# sourceMappingURL=connector.d.ts.map