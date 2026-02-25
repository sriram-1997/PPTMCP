import type { SlideProgramSpec } from "../render/types.js";
export type SlideIR = SlideProgramSpec & {
    __themeSpaceScale?: number[];
};
export declare function layerBucketForElementType(type: string): number;
export declare function canonicalizeIR(ir: SlideIR): SlideIR;
//# sourceMappingURL=canonicalize.d.ts.map