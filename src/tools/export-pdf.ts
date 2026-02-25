import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

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
export async function exportToPdf(pptxPath: string): Promise<{
  success: boolean;
  pdfPath: string | null;
  warning: string | null;
}> {
  if (!fs.existsSync(pptxPath)) {
    return {
      success: false,
      pdfPath: null,
      warning: `PPTX file not found: ${pptxPath}`,
    };
  }

  const resolvedPptx = path.resolve(pptxPath);
  const pdfPath = resolvedPptx.replace(/\.pptx$/i, ".pdf");
  const dir = path.dirname(resolvedPptx);

  // Method 1: Try Windows PowerPoint COM (native, preferred)
  if (process.platform === "win32") {
    const psScript = `
$pptxPath = "${resolvedPptx.replace(/"/g, '""')}";
$pdfPath = "${pdfPath.replace(/"/g, '""')}";
$ppt = $null;
$pres = $null;
try {
  $ppt = New-Object -ComObject PowerPoint.Application;
  $pres = $ppt.Presentations.Open($pptxPath, $true, $true, $false);
  $pres.SaveAs($pdfPath, 32);
} finally {
  if ($pres) { $pres.Close() | Out-Null }
  if ($ppt) { $ppt.Quit() | Out-Null }
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
`;
    const result = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", psScript],
      { stdio: "pipe", timeout: 60000 }
    );
    if (result.status === 0 && fs.existsSync(pdfPath)) {
      return {
        success: true,
        pdfPath,
        warning: null,
      };
    }
  }

  // Method 2: Try LibreOffice (headless mode)
  try {
    const libreOfficePaths = [
      "soffice",
      "libreoffice",
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      `/Applications/LibreOffice.app/Contents/MacOS/soffice`,
    ];

    for (const loPath of libreOfficePaths) {
      try {
        execSync(`"${loPath}" --version`, { stdio: "pipe" });
        execSync(
          `"${loPath}" --headless --convert-to pdf --outdir "${dir}" "${resolvedPptx}"`,
          { stdio: "pipe", timeout: 30000 }
        );

        if (fs.existsSync(pdfPath)) {
          return {
            success: true,
            pdfPath,
            warning: null,
          };
        }
      } catch {
        continue;
      }
    }
  } catch {
    // LibreOffice not available
  }

  // All methods failed
  return {
    success: false,
    pdfPath: null,
    warning: `PDF export failed: LibreOffice or PowerPoint not found. PPTX was created successfully at ${pptxPath}, but PDF conversion is not available. To create a PDF, open the PPTX file in PowerPoint and export to PDF.`,
  };
}
