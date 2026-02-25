# Pilot Readiness

## Business Problem Statement
Enterprise teams need presentation generation that is fast enough for strategy workflows but governed enough for compliance, executive review, and repeatable delivery.

## Why GenAI Is Required
GenAI accelerates conversion from intent to structured slide content, reduces manual authoring time, and enables rapid iteration from large strategy inputs. The deterministic renderer then constrains that generated intent into auditable output.

## Guardrail Architecture
- Schema and template compilation enforce structural correctness before rendering.
- Validation enforces region discipline, supported element constraints, and strict unknown-field handling.
- Enterprise mode adds hard controls: explicit theme requirement, shape allowlist, bullet density/length limits, and no overflow truncation.
- Runtime reports emit measurable quality signals (overflow count, validation failures, render latency, output hash).

## Deterministic Rendering
- Geometry is grid-anchored and quantized.
- Layer ordering is stable and canonicalized.
- Render output is hash-checked in enterprise mode by running two successive renders and comparing SHA-256 values.

## Enterprise Deployment Scenario
- A strategy assistant generates a slide spec.
- CI executes `npm run render -- <spec> <out> --enterprise-mode --no-pdf`.
- Pipeline blocks release if any enterprise validation fails or determinism hash check mismatches.
- Artifacts include PPTX plus `docs/validation_report.md` for audit traceability.

## Known Limitations
- Enterprise shape allowlist excludes card/chart/image/icon elements by policy.
- Unsupported chart/diagram capabilities still hard-fail by design.
- Determinism check currently relies on binary hash equality and does not isolate semantic deltas automatically.

## v1.1 Roadmap (Short)
1. Add policy profiles (e.g., finance, consulting, regulated) with configurable guardrail thresholds.
2. Emit machine-readable validation metrics JSON alongside markdown report.
3. Add deterministic delta diagnostics for faster mismatch triage.
4. Expand enterprise policy tests in smoke/stress manifests.
