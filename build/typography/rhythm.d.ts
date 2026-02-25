export type RhythmSlot = "title" | "body" | "lists";
export interface RhythmRule {
    lineHeight: number;
    paraSpacingBeforePt: number;
    paraSpacingAfterPt: number;
    lineHeightBand: number;
}
export declare function resolveRhythmSlotForRegion(regionName: string): RhythmSlot;
export declare function resolveTextRhythm(args: {
    regionName: string;
    overrideLineHeight?: number;
    contextLabel: string;
}): RhythmRule;
export declare function resolveListRhythm(args: {
    overrideLineHeight?: number;
    contextLabel: string;
}): RhythmRule;
//# sourceMappingURL=rhythm.d.ts.map