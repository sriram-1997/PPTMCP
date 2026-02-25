import type { BBox } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
export type FlowKind = "chevron" | "card";
export interface FlowStep {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
}
export interface FlowLayout {
    steps: FlowStep[];
    gapX: number;
    stepW: number;
    stepH: number;
    contentBox: BBox;
}
export declare function computeFlowLayout(args: {
    region: BBox;
    count: number;
    orientation?: "horizontal";
    kind: FlowKind;
    layoutProfile?: "flow.chevron" | "flow.card";
    theme: ConcreteTheme;
}): FlowLayout;
//# sourceMappingURL=flow.d.ts.map