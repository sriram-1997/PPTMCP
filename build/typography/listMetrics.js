const DOT_LEFT_INDENT_PT = 18;
const DOT_HANGING_PT = 12;
const DOT_BULLET_GAP_PT = 6;
const ICON_BOX_WIDTH_PT = 12;
const ICON_BASELINE_NUDGE_PT = -2.2;
const NUMBER_PREFIX_WIDTH_PT = 12;
const TEXT_START_OFFSET_PT = DOT_LEFT_INDENT_PT + DOT_HANGING_PT;
export function resolveCanonicalListMetrics(_style) {
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
export function hasValidCanonicalIndent(metrics) {
    return metrics.hangingPt <= metrics.leftIndentPt;
}
//# sourceMappingURL=listMetrics.js.map