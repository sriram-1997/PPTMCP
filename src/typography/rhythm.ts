export type RhythmSlot = "title" | "body" | "lists";

export interface RhythmRule {
  lineHeight: number;
  paraSpacingBeforePt: number;
  paraSpacingAfterPt: number;
  lineHeightBand: number;
}

const RHYTHM_RULES: Record<RhythmSlot, RhythmRule> = {
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

export function resolveRhythmSlotForRegion(regionName: string): RhythmSlot {
  const lower = regionName.toLowerCase();
  if (lower.includes("title") || lower.includes("header")) {
    return "title";
  }
  return "body";
}

function enforceLineHeightBand(args: {
  slot: RhythmSlot;
  overrideLineHeight: number | undefined;
  contextLabel: string;
}): number {
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

export function resolveTextRhythm(args: {
  regionName: string;
  overrideLineHeight?: number;
  contextLabel: string;
}): RhythmRule {
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

export function resolveListRhythm(args: {
  overrideLineHeight?: number;
  contextLabel: string;
}): RhythmRule {
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
