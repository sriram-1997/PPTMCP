export const SLIDE_WIDTH_INCHES = 13.333;
export const SLIDE_HEIGHT_INCHES = 7.5;
export const EPSILON_INCHES = 0.01;

export function roundInches(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function ptToIn(valuePt: number): number {
  return valuePt / 72;
}

export function inToPt(valueIn: number): number {
  return valueIn * 72;
}
