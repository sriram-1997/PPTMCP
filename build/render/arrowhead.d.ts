export interface ArrowheadDiagnostics {
    segmentLengthIn: number;
    requiredHeadLengthIn: number;
    computedScale: number;
    thresholdUsed: number;
}
export interface ArrowheadResult {
    scale: number;
    headLengthPt: number;
    headWidthPt: number;
    valid: boolean;
    diagnostics?: ArrowheadDiagnostics;
}
export declare function computeArrowhead(args: {
    strokeWidthPt: number;
    segmentLengthIn: number;
    preferredHeadLengthPt?: number;
}): ArrowheadResult;
export declare function formatLineTooShortFromArrowhead(diagnostics: ArrowheadDiagnostics | undefined): string;
//# sourceMappingURL=arrowhead.d.ts.map