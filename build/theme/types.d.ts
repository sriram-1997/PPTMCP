export type TokenMap = Record<string, unknown>;
export interface ConcreteTheme {
    slide: {
        background: string;
    };
    surfaces: {
        background: {
            fill: string;
            border: string;
            textColor: string;
        };
        surface: {
            fill: string;
            border: string;
            textColor: string;
        };
        elevated: {
            fill: string;
            border: string;
            textColor: string;
        };
        accent: {
            fill: string;
            border: string;
            textColor: string;
        };
    };
    text: {
        fontFamily: string;
        colorPrimary: string;
        colorSecondary: string;
    };
    colors: {
        primary: string;
        accent: string;
    };
    fontScale: {
        title: {
            family: string;
            size: number;
            weight: number;
        };
        subtitle: {
            family: string;
            size: number;
            weight: number;
        };
        body: {
            family: string;
            size: number;
            weight: number;
        };
        caption: {
            family: string;
            size: number;
            weight: number;
        };
    };
    spaceScale: number[];
    strokeScale: {
        thin: number;
        normal: number;
        heavy: number;
    };
    table: {
        headerFill: string;
        headerTextColor: string;
        bodyFill: string;
        bodyTextColor: string;
        border: string;
    };
    chart: {
        palette: string[];
        textColor: string;
        axisColor: string;
        gridlineColor: string;
        chartAreaFill: string;
    };
    callout: {
        fill: string;
        border: string;
        leader: string;
        textColor: string;
    };
    connector: {
        stroke: string;
    };
    shape: {
        borderWidth: number;
    };
    type: {
        fontFamilyPrimary: string;
        fontFamilySecondary: string;
        bodySize: number;
        smallSize: number;
        weightMedium: number;
        weightBold: number;
    };
}
//# sourceMappingURL=types.d.ts.map