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

const DOT_LEFT_INDENT_PT = 18;
const DOT_HANGING_PT = 12;
const DOT_BULLET_GAP_PT = 6;
const ICON_BOX_WIDTH_PT = 12;
const ICON_BASELINE_NUDGE_PT = -2.2;
const NUMBER_PREFIX_WIDTH_PT = 12;

const TEXT_START_OFFSET_PT = DOT_LEFT_INDENT_PT + DOT_HANGING_PT;

export function resolveCanonicalListMetrics(_style: ListBulletStyle): CanonicalListMetrics {
  return {
    leftIndentPt: DOT_LEFT_INDENT_PT,
    hangingPt: DOT_HANGING_PT,
    bulletGapPt: DOT_BULLET_GAP_PT,
    iconBoxWidthPt: ICON_BOX_WIDTH_PT,
    iconBaselineNudgePt: ICON_BASELINE_NUDGE_PT,
    numberPrefixWidthPt: NUMBER_PREFIX_WIDTH_PT,
    textStartOffsetPt: TEXT_START_OFFSET_PT,
  };
}

export function hasValidCanonicalIndent(metrics: CanonicalListMetrics): boolean {
  return metrics.hangingPt <= metrics.leftIndentPt;
}
