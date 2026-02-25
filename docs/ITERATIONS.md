# Iterations

## 2026-02-25 - Hardening Patch v0.2
- Added IR canonicalization (`canonicalizeIR`) into render pipeline (post-template, pre-validation/render).
- Unified card padding authority to runtime `paddingPt`; slot conflict now hard-fails with `card_padding_ambiguous`.
- Centralized arrowhead viability (`computeArrowhead`) and removed duplicated threshold logic.
- Added diagnostic `line_too_short` path for `<80%` arrowhead scale requests.
- Normalized list metrics across dot/number/icon with fixed text-left alignment and deterministic numbering.
- Added typography rhythm enforcement (`title=1.05`, `body/lists=1.15`, paragraph spacing 0).
- Hardened `chevron_flow` schema (`2..12` steps, non-empty labels, strict allowlists) plus shrink-first overflow failure `chevron_label_overflow`.
- Replaced bespoke smoke scripts with manifest runner (`smokes.manifest.json`, `scripts/smoke-runner.mjs`).
- Added hardening smokes:
  - `examples/smoke/ir_canonicalization_equivalence.json`
  - `examples/smoke/list_alignment_matrix.json`
  - `examples/smoke/list_alignment_matrix_dark.json`
  - `examples/smoke/arrowhead_threshold_band.json`
  - `examples/smoke/chevron_flow_long_labels_shrink.json`
  - `examples/smoke/chevron_flow_overflow_fail.json`

## 2026-02-20 - Component Library v1 + Chevron Geometry v2
- Fixed chevron distortion with fixed-depth geometry derived from header height and deterministic narrow-width fallback.
- Stabilized arrowhead policy: silent scaling within 80%-100%, hard-fail `line_too_short` below 80%.
- Enforced card padding slot compilation (`paddingSlot -> style.paddingPt`) and renderer consumption.
- Added 8 canonical templates:
  - `analysis_5_col`
  - `comparison_3_col`
  - `kpi_dashboard`
  - `architecture_flow`
  - `before_after`
  - `timeline_horizontal`
  - `strategy_stack`
  - `matrix_2x2`
- Expanded smoke coverage:
  - `examples/smoke/chevron_width_stress.json` (+ dark variant invariance check)
  - `examples/smoke/card_padding_matrix.json`
  - `examples/smoke/templates_v1_light.json`
  - `examples/smoke/templates_v1_dark.json`
- Rebuilt EPS forecast demo using `analysis_5_col` template and rendered v2 PPTX/PDF outputs.
- Preserved deterministic output and strict validation behavior (no schema-breaking changes).

## 2026-02-13 - Theme v2 + Geometry v1
- Geometry v1: post-layout connector/leader resolution, arrowhead sizing + trimming, no negative extents, deterministic rounding.
- Theme v2: typography/spacing/stroke scales with strict token validation and deterministic defaults.
- Surface contrast tuning for light/dark themes.
- Smoke expansion: variants, overlap stack, arrowheads in multiple directions, callout leader intersections.
- Docs: capabilities, limitations, roadmap.

## 2026-02-13 - Design Vocabulary Expansion
- Table v0.1: header/body fills + text colors + border tokens with contrast enforcement.
- Icons v0: registry-backed icons from Heroicons/Feather pinned commits.
- Image v1: opacity/crop/overlay/border radius via deterministic SVG mask wrapper.
