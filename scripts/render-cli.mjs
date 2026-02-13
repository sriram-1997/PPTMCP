#!/usr/bin/env node

/**
 * CLI entrypoint for render_pptmcp
 * Usage: npm run render -- <spec_path> <output_path> [--template=<template>] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--no-pdf] [--expect-error=<code>] [--repeat=N] [--determinism] [--debug-integrity] [--unzip-out=<dir>]
 */

import { renderPptmcp } from "../build/tools/render-pptmcp.js";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      "Usage: npm run render -- <spec_path> <output_path> [--template=<template>] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--no-pdf] [--expect-error=<code>] [--repeat=N] [--determinism] [--debug-integrity] [--unzip-out=<dir>]"
    );
    console.error("\nExamples:");
    console.error("  npm run render -- examples/pptmcp_case_mode_v0.1.json out/latest.pptx");
    console.error("  npm run render -- spec.json out.pptx --template=modern");
    console.error("  npm run render -- spec.json out.pptx --no-strict");
    console.error("  npm run render -- spec.json out.pptx --allow-overflow");
    console.error("  npm run render -- spec.json out.pptx --allow-dense-charts");
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

  try {
    console.log(`Rendering: ${specPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Template: ${template}`);
    console.log(`Strict: ${strict}`);
    console.log(`Allow overflow: ${allowOverflow}`);
    console.log(`Allow dense charts: ${allowDenseCharts}`);
    console.log(`Export PDF: ${exportPdf}`);
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

    const outputs = [];

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
      });

      if (result.success) {
        console.log(`Run ${i}: Success`);
        const shrinkCount = result.validation_report.filter((entry) => entry.action_taken === "shrink").length;
        const truncateCount = result.validation_report.filter((entry) => entry.action_taken === "truncate").length;
        const errorCount = result.validation_report.filter((entry) => entry.action_taken === "error").length;
        console.log(`Layout report: shrink=${shrinkCount}, truncate=${truncateCount}, error=${errorCount}`);
        if (result.warnings.length > 0) {
          console.log("Warnings:");
          result.warnings.forEach((w) => console.log(`  - ${w}`));
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
        outputs.push(runPath);
      } else {
        console.error("Rendering failed");
        process.exit(1);
      }
    }

    if (determinism) {
      console.log("\nDeterminism report:");
      const rows = outputs.map((filePath, idx) => {
        const data = fs.readFileSync(filePath);
        const hash = crypto.createHash("sha256").update(data).digest("hex");
        return { i: idx + 1, filePath, hash };
      });
      rows.forEach((row) => {
        console.log(`${row.i}\t${row.filePath}\t${row.hash}`);
      });
      const distinct = new Set(rows.map((r) => r.hash));
      if (distinct.size > 1) {
        console.log("WARNING: Non-deterministic output detected (hashes differ).");
      }
    }

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (expectError && message.includes(expectError)) {
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
      const escapedPptx = pptxPath.replace(/'/g, "''");
      const escapedOut = outDir.replace(/'/g, "''");
      const command = `Expand-Archive -LiteralPath '${escapedPptx}' -DestinationPath '${escapedOut}' -Force`;
      const result = spawnSync("powershell", ["-NoProfile", "-Command", command], { stdio: "inherit" });
      if (result.status !== 0) {
        return `Unzip failed with exit code ${result.status}`;
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
