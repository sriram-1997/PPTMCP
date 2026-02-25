import { EPSILON_INCHES, ptToIn } from "./utils/units.js";
const ARROW_MIN_LEN_PT = 6;
const ARROW_MAX_LEN_PT = 14;
const ARROW_MIN_WIDTH_PT = 4;
const ARROW_MAX_WIDTH_PT = 12;
const ARROW_SCALE_THRESHOLD = 0.8;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function round4(value) {
    return Math.round(value * 10000) / 10000;
}
export function computeArrowhead(args) {
    const baseLengthPt = Number.isFinite(args.preferredHeadLengthPt) && args.preferredHeadLengthPt > 0
        ? args.preferredHeadLengthPt
        : clamp(Math.round(4 * args.strokeWidthPt), ARROW_MIN_LEN_PT, ARROW_MAX_LEN_PT);
    const baseWidthPtRaw = clamp(Math.round(2.5 * args.strokeWidthPt), ARROW_MIN_WIDTH_PT, ARROW_MAX_WIDTH_PT);
    const widthRatio = baseWidthPtRaw / Math.max(baseLengthPt, 0.0001);
    const baseWidthPt = baseLengthPt * widthRatio;
    const requiredHeadLengthIn = ptToIn(baseLengthPt);
    const availableLengthIn = Math.max(args.segmentLengthIn - EPSILON_INCHES, 0);
    const scaleRaw = requiredHeadLengthIn > 0 ? availableLengthIn / requiredHeadLengthIn : 0;
    const scale = clamp(scaleRaw, 0, 1);
    const valid = Number.isFinite(scale) && scale >= ARROW_SCALE_THRESHOLD;
    const result = {
        scale: round4(scale),
        headLengthPt: round4(baseLengthPt * scale),
        headWidthPt: round4(baseWidthPt * scale),
        valid,
    };
    if (!valid) {
        result.diagnostics = {
            segmentLengthIn: round4(args.segmentLengthIn),
            requiredHeadLengthIn: round4(requiredHeadLengthIn),
            computedScale: round4(scaleRaw),
            thresholdUsed: ARROW_SCALE_THRESHOLD,
        };
    }
    return result;
}
export function formatLineTooShortFromArrowhead(diagnostics) {
    if (!diagnostics) {
        return "line_too_short";
    }
    return `line_too_short (segmentLengthIn=${diagnostics.segmentLengthIn} requiredHeadLengthIn=${diagnostics.requiredHeadLengthIn} computedScale=${diagnostics.computedScale} thresholdUsed=${diagnostics.thresholdUsed})`;
}
//# sourceMappingURL=arrowhead.js.map