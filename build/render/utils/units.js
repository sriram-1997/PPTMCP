export const SLIDE_WIDTH_INCHES = 13.333333333333334;
export const SLIDE_HEIGHT_INCHES = 7.5;
export const EPSILON_INCHES = 0.01;
export const EMU_PER_INCH = 914400;
export const EMU_STEP = 10;
export function roundInches(value) {
    return Math.round(value * 1000) / 1000;
}
export function ptToIn(valuePt) {
    return valuePt / 72;
}
export function inToPt(valueIn) {
    return valueIn * 72;
}
export function inchesToEmu(valueIn) {
    return valueIn * EMU_PER_INCH;
}
export function emuToInches(valueEmu) {
    return valueEmu / EMU_PER_INCH;
}
export function quantizeInchesToEmuStep(valueIn) {
    if (!Number.isFinite(valueIn)) {
        return valueIn;
    }
    const emu = Math.round((valueIn * EMU_PER_INCH) / EMU_STEP) * EMU_STEP;
    return emu / EMU_PER_INCH;
}
export function quantizePtToEmuStep(valuePt) {
    if (!Number.isFinite(valuePt)) {
        return valuePt;
    }
    return inToPt(quantizeInchesToEmuStep(ptToIn(valuePt)));
}
//# sourceMappingURL=units.js.map