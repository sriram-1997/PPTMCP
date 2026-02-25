#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { renderPptmcp } from "../build/tools/render-pptmcp.js";

function parseArgs(argv) {
  const args = {
    group: "all",
    manifestPath: "smokes.manifest.json",
  };
  argv.forEach((arg) => {
    if (arg.startsWith("--group=")) {
      args.group = arg.split("=")[1] || "all";
    } else if (arg.startsWith("--manifest=")) {
      args.manifestPath = arg.split("=")[1] || args.manifestPath;
    }
  });
  return args;
}

function loadManifest(manifestPath) {
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (!Array.isArray(raw)) {
    throw new Error("smokes.manifest.json must be an array");
  }
  return raw;
}

function normalizeEntryForCompare(entry) {
  const clone = { ...entry };
  delete clone.id;
  delete clone.render_index;
  return clone;
}

function assertIrCardEquivalence(result) {
  if (!result.integrity_debug || !Array.isArray(result.integrity_debug.slides)) {
    throw new Error("ir_card_equivalence assertion requires integrity_debug output");
  }
  const slides = result.integrity_debug.slides;
  if (slides.length < 2) {
    throw new Error("ir_card_equivalence assertion requires at least 2 slides");
  }
  const first = slides[0].render_list.map(normalizeEntryForCompare);
  const second = slides[1].render_list.map(normalizeEntryForCompare);
  if (JSON.stringify(first) !== JSON.stringify(second)) {
    throw new Error("ir_card_equivalence failed: template and raw card geometry differ");
  }
}

function runAssertion(assertName, result) {
  if (!assertName) {
    return;
  }
  if (assertName === "ir_card_equivalence") {
    assertIrCardEquivalence(result);
    return;
  }
  throw new Error(`Unknown smoke assertion '${assertName}'`);
}

function shouldRunEntry(entry, group) {
  if (!group || group === "all") {
    return true;
  }
  if (Array.isArray(entry.groups)) {
    return entry.groups.includes(group);
  }
  return false;
}

async function runSmokeEntry(entry) {
  const specPath = path.resolve(process.cwd(), entry.spec);
  const outputPath = path.resolve(
    process.cwd(),
    entry.output || path.join("out", "smokes", `${path.parse(entry.spec).name}.pptx`)
  );
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const expect = entry.expect === "fail" ? "fail" : "pass";
  const expectedError = typeof entry.error === "string" ? entry.error : "";

  try {
    const result = await renderPptmcp({
      spec_path: specPath,
      output_path: outputPath,
      strict: true,
      allow_overflow: false,
      allow_dense_charts: false,
      export_pdf: false,
      debug_integrity: Boolean(entry.assert),
    });
    if (expect === "fail") {
      return {
        ok: false,
        message: `expected failure${expectedError ? ` (${expectedError})` : ""} but render passed`,
      };
    }
    runAssertion(entry.assert, result);
    return { ok: true, message: "pass" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (expect === "fail") {
      if (!expectedError || message.includes(expectedError)) {
        return { ok: true, message: `expected failure observed${expectedError ? ` (${expectedError})` : ""}` };
      }
      return {
        ok: false,
        message: `failure observed but missing expected code '${expectedError}'`,
      };
    }
    return { ok: false, message };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(process.cwd(), args.manifestPath);
  const manifest = loadManifest(manifestPath).filter((entry) => shouldRunEntry(entry, args.group));

  if (manifest.length === 0) {
    throw new Error(`No smoke entries matched group '${args.group}'`);
  }

  let passCount = 0;
  let failCount = 0;
  console.log(`smoke-runner: group=${args.group} manifest=${args.manifestPath} entries=${manifest.length}`);

  for (let i = 0; i < manifest.length; i += 1) {
    const entry = manifest[i];
    const label = entry.id || entry.spec;
    const result = await runSmokeEntry(entry);
    if (result.ok) {
      passCount += 1;
      console.log(`[${i + 1}/${manifest.length}] PASS ${label} :: ${result.message}`);
    } else {
      failCount += 1;
      console.log(`[${i + 1}/${manifest.length}] FAIL ${label} :: ${result.message}`);
    }
  }

  console.log(`smoke-runner summary: pass=${passCount} fail=${failCount} total=${manifest.length}`);
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
