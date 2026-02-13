/**
 * Attempt to convert PPTX to PDF using available system tools.
 * Falls back gracefully if conversion is not possible.
 *
 * Supported methods (in order of preference):
 * 1. PowerPoint COM (Windows only, requires PowerPoint installed)
 * 2. LibreOffice headless (cross-platform, common on Linux/Mac)
 *
 * @returns {Promise<{success: boolean; pdfPath: string | null; warning: string | null}>}
 */
export declare function exportToPdf(pptxPath: string): Promise<{
    success: boolean;
    pdfPath: string | null;
    warning: string | null;
}>;
//# sourceMappingURL=export-pdf.d.ts.map