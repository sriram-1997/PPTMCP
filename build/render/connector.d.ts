import type { ArrowHead, BBox, ConnectorElement, PreparedConnectorElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export declare function lineRectFromPoints(start: {
    x: number;
    y: number;
}, end: {
    x: number;
    y: number;
}): {
    rect: BBox;
    dx: number;
    dy: number;
    flipV: boolean;
    flipH: boolean;
};
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
export declare function computeLineWithArrowheads(args: {
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    widthPt: number;
    color: string;
    startArrow: "none" | "triangle";
    endArrow: "none" | "triangle";
    warnings?: string[];
    warnPrefix?: string;
}): {
    lineStart: {
        x: number;
        y: number;
    };
    lineEnd: {
        x: number;
        y: number;
    };
    arrowHeads: ArrowHead[];
};
export declare function renderArrowHeads(slide: any, shapeType: any, arrowHeads: ArrowHead[]): void;
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