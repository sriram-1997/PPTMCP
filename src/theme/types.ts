export type TokenMap = Record<string, unknown>;

export interface ConcreteTheme {
  slide: { background: string };
  surfaces: {
    surface: { fill: string; border: string; textColor: string };
    elevated: { fill: string; border: string; textColor: string };
    accent: { fill: string; border: string; textColor: string };
  };
  text: { fontFamily: string; colorPrimary: string; colorSecondary: string };
  table: { headerFill: string; headerTextColor: string; bodyFill: string; bodyTextColor: string; border: string };
  chart: { palette: string[]; textColor: string; axisColor: string; gridlineColor: string; chartAreaFill: string };
  callout: { fill: string; border: string; leader: string; textColor: string };
  connector: { stroke: string };
  shape: { borderWidth: number };
  type: {
    fontFamilyPrimary: string;
    fontFamilySecondary: string;
    bodySize: number;
    smallSize: number;
    weightMedium: number;
    weightBold: number;
  };
}
