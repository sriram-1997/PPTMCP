#!/usr/bin/env node

/**
 * CLI entrypoint for render_pptmcp
 * Usage: npm run render -- <spec_path> <output_path> [--template=<template>] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--enterprise-mode] [--no-pdf] [--expect-error=<code>] [--repeat=N] [--determinism] [--debug-integrity] [--unzip-out=<dir>]
 */

import { renderPptmcp } from "../build/tools/render-pptmcp.js";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function removeFileIfExists(filePath) {
  if (!filePath) {
    return;
  }
  try {
    fs.rmSync(filePath, { force: true });
  } catch {
    // Ignore cleanup failures for temp determinism artifacts.
  }
}

function writeValidationReport(args) {
  const reportPath = path.resolve(process.cwd(), "docs", "validation_report.md");
  const generatedAt = new Date().toISOString();
  const lines = [
    "# Validation Report",
    "",
    `Generated: ${generatedAt}`,
    `Spec: ${args.specPath}`,
    `Primary output: ${args.outputPath}`,
    `Template: ${args.template}`,
    `Strict: ${args.strict}`,
    `Allow overflow: ${args.allowOverflow}`,
    `Allow dense charts: ${args.allowDenseCharts}`,
    `Export PDF: ${args.exportPdf}`,
    `Enterprise mode: ${args.enterpriseMode}`,
    `Determinism flag: ${args.determinism}`,
    `Repeat: ${args.repeat}`,
    `Status: ${args.status}`,
  ];

  if (args.errorMessage) {
    lines.push(`Error: ${args.errorMessage}`);
  }

  lines.push("", "## Run Metrics", "");
  lines.push(
    "| run | output | total_slides | total_elements | overflow_count | validation_failures | render_time_ms | deterministic_hash | determinism_verified | determinism_match |"
  );
  lines.push(
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |"
  );

  if (args.runs.length === 0) {
    lines.push("| n/a | n/a | 0 | 0 | 0 | 1 | 0 | n/a | false | false |");
  } else {
    args.runs.forEach((run) => {
      lines.push(
        `| ${run.index} | ${run.outputPath} | ${run.totalSlides} | ${run.totalElements} | ${run.overflowCount} | ${run.validationFailures} | ${run.renderTimeMs} | ${run.hash} | ${run.determinismVerified} | ${run.determinismMatch} |`
      );
    });
  }

  lines.push("", "## Warnings", "");
  const warnings = args.runs.flatMap((run) => run.warnings || []);
  if (warnings.length === 0) {
    lines.push("- none");
  } else {
    warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  fs.writeFileSync(reportPath, lines.join("\n"), "utf-8");
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let specPath = null;
  let outputPath = null;
  let template = "professional";
  let strict = true;
  let allowOverflow = false;
  let allowDenseCharts = false;
  let exportPdf = true;
  let enterpriseMode = false;
  let expectError = null;
  let repeat = 1;
  let determinism = false;
  let debugIntegrity = false;
  let unzipOut = null;

  for (const arg of args) {
    if (arg.startsWith("--template=")) {
      template = arg.split("=")[1];
    } else if (arg === "--no-strict") {
      strict = false;
    } else if (arg === "--allow-overflow") {
      allowOverflow = true;
    } else if (arg === "--allow-dense-charts") {
      allowDenseCharts = true;
    } else if (arg === "--enterprise-mode") {
      enterpriseMode = true;
    } else if (arg === "--no-pdf") {
      exportPdf = false;
    } else if (arg.startsWith("--expect-error=")) {
      expectError = arg.split("=")[1] || null;
    } else if (arg.startsWith("--repeat=")) {
      repeat = Number(arg.split("=")[1] || "1");
    } else if (arg === "--determinism") {
      determinism = true;
    } else if (arg === "--debug-integrity") {
      debugIntegrity = true;
    } else if (arg.startsWith("--unzip-out=")) {
      unzipOut = arg.split("=")[1] || null;
    } else if (!specPath) {
      specPath = arg;
    } else if (!outputPath) {
      outputPath = arg;
    }
  }

  // Validate required arguments
  if (!specPath || !outputPath) {
    console.error(
      "Usage: npm run render -- <spec_path> <output_path> [--template=<template>] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--enterprise-mode] [--no-pdf] [--expect-error=<code>] [--repeat=N] [--determinism] [--debug-integrity] [--unzip-out=<dir>]"
    );
    console.error("\nExamples:");
    console.error("  npm run render -- examples/pptmcp_case_mode_v0.1.json out/latest.pptx");
    console.error("  npm run render -- spec.json out.pptx --template=modern");
    console.error("  npm run render -- spec.json out.pptx --no-strict");
    console.error("  npm run render -- spec.json out.pptx --allow-overflow");
    console.error("  npm run render -- spec.json out.pptx --allow-dense-charts");
    console.error("  npm run render -- spec.json out.pptx --enterprise-mode");
    console.error("  npm run render -- spec.json out.pptx --no-pdf");
    console.error("  npm run render -- spec.json out.pptx --expect-error=chart_type_not_supported");
    console.error("  npm run render -- spec.json out.pptx --repeat=10 --determinism --debug-integrity");
    console.error("  npm run render -- spec.json out.pptx --unzip-out=out/unzipped");
    process.exit(1);
  }

  if (!Number.isFinite(repeat) || repeat <= 0) {
    console.error("Invalid --repeat value. Must be >= 1.");
    process.exit(1);
  }

  const outputs = [];
  const runSummaries = [];

  try {
    console.log(`Rendering: ${specPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Template: ${template}`);
    console.log(`Strict: ${strict}`);
    console.log(`Allow overflow: ${allowOverflow}`);
    console.log(`Allow dense charts: ${allowDenseCharts}`);
    console.log(`Export PDF: ${exportPdf}`);
    console.log(`Enterprise mode: ${enterpriseMode}`);
    console.log(`Repeat: ${repeat}`);
    console.log(`Determinism: ${determinism}`);
    console.log(`Debug integrity: ${debugIntegrity}`);
    if (unzipOut) {
      console.log(`Unzip out: ${unzipOut}`);
    }
    if (expectError) {
      console.log(`Expect error: ${expectError}`);
    }
    console.log("");

    for (let i = 1; i <= repeat; i += 1) {
      const parsed = path.parse(outputPath);
      const suffix = repeat > 1 ? `_${i}` : "";
      const runPath = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext || ".pptx"}`);
      const unzipDir = unzipOut ? (repeat > 1 ? `${unzipOut}_${i}` : unzipOut) : null;

      const result = await renderPptmcp({
        spec_path: specPath,
        output_path: runPath,
        template,
        strict,
        allow_overflow: allowOverflow,
        allow_dense_charts: allowDenseCharts,
        export_pdf: exportPdf,
        debug_integrity: debugIntegrity,
        enterprise_mode: enterpriseMode,
      });

      if (!result.success) {
        throw new Error("Rendering failed");
      }

      const shrinkCount = result.validation_report.filter((entry) => entry.action_taken === "shrink").length;
      const truncateCount = result.validation_report.filter((entry) => entry.action_taken === "truncate").length;
      const errorCount = result.validation_report.filter((entry) => entry.action_taken === "error").length;
      const runHash = hashFile(runPath);

      let determinismVerified = false;
      let determinismMatch = true;
      let comparisonHash = null;

      if (enterpriseMode || determinism) {
        determinismVerified = true;
        const detPath = path.join(parsed.dir, `${parsed.name}${suffix}__determinism${parsed.ext || ".pptx"}`);
        const detResult = await renderPptmcp({
          spec_path: specPath,
          output_path: detPath,
          template,
          strict,
          allow_overflow: allowOverflow,
          allow_dense_charts: allowDenseCharts,
          export_pdf: false,
          debug_integrity: false,
          enterprise_mode: enterpriseMode,
        });
        if (!detResult.success) {
          throw new Error(`Determinism reference render failed for run ${i}`);
        }
        comparisonHash = hashFile(detPath);
        determinismMatch = runHash === comparisonHash;
        removeFileIfExists(detPath);

        if (!determinismMatch) {
          const mismatchMessage = `run ${i} hash mismatch: ${runHash} != ${comparisonHash}`;
          if (enterpriseMode) {
            throw new Error(`enterprise_determinism_mismatch (${mismatchMessage})`);
          }
          console.log(`WARNING: Non-deterministic output detected (${mismatchMessage}).`);
        }
      }

      const metrics = {
        totalSlides: result.render_metrics?.total_slides ?? result.slides_rendered,
        totalElements: result.render_metrics?.total_elements ?? 0,
        overflowCount:
          result.render_metrics?.overflow_count ??
          result.validation_report.filter((entry) => entry.overflow.width || entry.overflow.height).length,
        validationFailures:
          result.render_metrics?.validation_failures ??
          result.validation_report.filter((entry) => entry.action_taken === "error").length,
        renderTimeMs: result.render_metrics?.render_time_ms ?? 0,
      };

      console.log(`Run ${i}: Success`);
      console.log(`Layout report: shrink=${shrinkCount}, truncate=${truncateCount}, error=${errorCount}`);
      console.log(
        `Metrics: total_slides=${metrics.totalSlides}, total_elements=${metrics.totalElements}, overflow_count=${metrics.overflowCount}, validation_failures=${metrics.validationFailures}, render_time_ms=${metrics.renderTimeMs}, deterministic_hash=${runHash}`
      );
      if (determinismVerified) {
        console.log(`Determinism check: ${determinismMatch ? "PASS" : "FAIL"}`);
      }
      if (result.warnings.length > 0) {
        console.log("Warnings:");
        result.warnings.forEach((warning) => console.log(`  - ${warning}`));
      }
      if (debugIntegrity && result.integrity_debug) {
        console.log("INTEGRITY_DEBUG:");
        console.log(JSON.stringify(result.integrity_debug, null, 2));
      }
      if (unzipDir) {
        const unzipWarning = unzipPptx(runPath, unzipDir);
        if (unzipWarning) {
          console.warn(`WARNING: ${unzipWarning}`);
        }
      }

      outputs.push({ filePath: runPath, hash: runHash });
      runSummaries.push({
        index: i,
        outputPath: runPath,
        totalSlides: metrics.totalSlides,
        totalElements: metrics.totalElements,
        overflowCount: metrics.overflowCount,
        validationFailures: metrics.validationFailures,
        renderTimeMs: metrics.renderTimeMs,
        hash: runHash,
        comparisonHash,
        determinismVerified,
        determinismMatch,
        warnings: result.warnings,
      });
    }

    if (determinism) {
      console.log("\nDeterminism report:");
      outputs.forEach((row, idx) => {
        console.log(`${idx + 1}\t${row.filePath}\t${row.hash}`);
      });
      const distinct = new Set(outputs.map((row) => row.hash));
      if (distinct.size > 1) {
        console.log("WARNING: Non-deterministic output detected across repeated runs (hashes differ).");
      }
    }

    writeValidationReport({
      specPath,
      outputPath,
      template,
      strict,
      allowOverflow,
      allowDenseCharts,
      exportPdf,
      enterpriseMode,
      determinism,
      repeat,
      status: "success",
      runs: runSummaries,
      errorMessage: "",
    });

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const expectedMatch = expectError && message.includes(expectError);

    writeValidationReport({
      specPath,
      outputPath,
      template,
      strict,
      allowOverflow,
      allowDenseCharts,
      exportPdf,
      enterpriseMode,
      determinism,
      repeat,
      status: expectedMatch ? "expected_failure" : "failure",
      runs: runSummaries,
      errorMessage: message,
    });

    if (expectedMatch) {
      console.log(`Expected error observed: ${expectError}`);
      process.exit(0);
    }

    console.error("Error:", message);
    process.exit(1);
  }
}

function unzipPptx(pptxPath, outDir) {
  if (!pptxPath || !outDir) {
    return null;
  }
  try {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    if (process.platform === "win32") {
      const escapedOut = outDir.replace(/'/g, "''");
      const tempZip = path.join(outDir, "__pptx_unzip__.zip");
      fs.copyFileSync(pptxPath, tempZip);
      const escapedZip = tempZip.replace(/'/g, "''");
      try {
        const command = `Expand-Archive -LiteralPath '${escapedZip}' -DestinationPath '${escapedOut}' -Force`;
        const result = spawnSync("powershell", ["-NoProfile", "-Command", command], { stdio: "inherit" });
        if (result.status !== 0) {
          return `Unzip failed with exit code ${result.status}`;
        }
      } finally {
        try {
          fs.rmSync(tempZip, { force: true });
        } catch {
          // Ignore cleanup errors for debug-only unzip.
        }
      }
      return null;
    }

    const result = spawnSync("unzip", ["-o", pptxPath, "-d", outDir], { stdio: "inherit" });
    if (result.status !== 0) {
      return `Unzip failed with exit code ${result.status}`;
    }
    return null;
  } catch (error) {
    return `Unzip failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}

main();
