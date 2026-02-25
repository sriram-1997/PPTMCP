import type { ListBulletStyle } from "../render/types.js";
export interface CanonicalListMetrics {
    leftIndentPt: number;
    hangingPt: number;
    bulletGapPt: number;
    iconBoxWidthPt: number;
    iconBaselineNudgePt: number;
    numberPrefixWidthPt: number;
    textStartOffsetPt: number;
}
export declare function resolveCanonicalListMetrics(_style: ListBulletStyle): CanonicalListMetrics;
export declare function hasValidCanonicalIndent(metrics: CanonicalListMetrics): boolean;
//# sourceMappingURL=listMetrics.d.ts.map