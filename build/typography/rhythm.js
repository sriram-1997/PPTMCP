const RHYTHM_RULES = {
    title: {
        lineHeight: 1.05,
        paraSpacingBeforePt: 0,
        paraSpacingAfterPt: 0,
        lineHeightBand: 0.05,
    },
    body: {
        lineHeight: 1.15,
        paraSpacingBeforePt: 0,
        paraSpacingAfterPt: 0,
        lineHeightBand: 0.05,
    },
    lists: {
        lineHeight: 1.15,
        paraSpacingBeforePt: 0,
        paraSpacingAfterPt: 0,
        lineHeightBand: 0.05,
    },
};
export function resolveRhythmSlotForRegion(regionName) {
    const lower = regionName.toLowerCase();
    if (lower.includes("title") || lower.includes("header")) {
        return "title";
    }
    return "body";
}
function enforceLineHeightBand(args) {
    const rule = RHYTHM_RULES[args.slot];
    if (typeof args.overrideLineHeight === "undefined") {
        return rule.lineHeight;
    }
    if (!Number.isFinite(args.overrideLineHeight) || args.overrideLineHeight <= 0) {
        throw new Error(`${args.contextLabel}: rhythm_override_out_of_band`);
    }
    const min = rule.lineHeight - rule.lineHeightBand;
    const max = rule.lineHeight + rule.lineHeightBand;
    if (args.overrideLineHeight < min || args.overrideLineHeight > max) {
        throw new Error(`${args.contextLabel}: rhythm_override_out_of_band`);
    }
    return args.overrideLineHeight;
}
export function resolveTextRhythm(args) {
    const slot = resolveRhythmSlotForRegion(args.regionName);
    const rule = RHYTHM_RULES[slot];
    return {
        ...rule,
        lineHeight: enforceLineHeightBand({
            slot,
            overrideLineHeight: args.overrideLineHeight,
            contextLabel: args.contextLabel,
        }),
    };
}
export function resolveListRhythm(args) {
    const rule = RHYTHM_RULES.lists;
    return {
        ...rule,
        lineHeight: enforceLineHeightBand({
            slot: "lists",
            overrideLineHeight: args.overrideLineHeight,
            contextLabel: args.contextLabel,
        }),
    };
}
//# sourceMappingURL=rhythm.js.map