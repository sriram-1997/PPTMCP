# DESIGN_LOG.md

## Overview
PPTMCP is a deterministic PowerPoint generation system driven by a JSON slide program. It enforces strict grid discipline, validates schema and content, and produces PPTX output with optional best-effort PDF export.

## Implemented Features

### Core Rendering
- `render_pptmcp` tool: deterministic PPTX rendering from JSON spec.
- Grid-based layout: region geometry derived from slide grid (cols/rows/gutter) with inch units.
- Region-bounded rendering only: elements reference named regions; no absolute positioning in spec.
- Deterministic layout computation for all supported elements.
- Universal z-layering: all drawable elements support integer `z` with stable ordering (z asc, input order asc).
- Region-only anchors (v0): callouts and connectors anchor to region points with optional pt offsets.

### Element Types
- Text elements
  - Style: fontSize, minFont, bold, italic, color, align, verticalAlign, fit, paddingPt, lineHeight.
  - Overflow handling: shrink-to-fit or truncate with warnings when `allow_overflow=true`.
- Table elements
  - Basic rectangular tables with headers + rows.
  - Cell types: string or `{text, style}`.
  - Constraints: row cell count must match headers; merged cells unsupported and hard-fail.
- Chart elements (v0/v0.1)
  - Supported: column charts (`chartType="column"`) and line charts (`chartType="line"`).
  - Column data schema: `dataSeries` with 1-2 series, each `data` is `[label, number]` pairs.
  - Line data schema: `data.labels` with `data.series[].values` aligned to labels.
  - Category alignment required across column series; label/value length alignment required for line charts.
  - Density guards (column): category count > 25 or long labels in narrow regions hard-fail unless `allow_dense_charts=true`.
- Callout elements (v0)
  - Box + text + straight leader line, region-bounded container.
  - Placement: explicit direction or deterministic auto placement.
  - Anchor: region-only.
- Connector elements (v0)
  - Straight line between two region anchors, region-bounded container.
  - Constraint (v0): endpoints must be inside the connector region (no line clipping/segment checks).

### Validation & Error Handling
- Strict schema validation by default (`strict=true`), unknown fields hard-fail.
- Actionable errors for unsupported types and invalid chart/table data.
- Layout validation report for text/table overflow actions (shrink/truncate/error).
- Hard-fail for unsupported anchors and absolute positioning on callouts/connectors.
- PPTX integrity: investigating repair prompts; added `--debug-integrity` and repro specs.

### Output & Export
- PPTX output at specified path, creating parent directories if needed.
- Best-effort PDF export (optional): `export_pdf=true`.
  - Windows: PowerPoint COM automation.
  - Fallback: LibreOffice headless if available.
  - Export failures are warnings; PPTX render still succeeds.

### CLI
- `npm run render -- <spec> <output> [--template=...] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--no-pdf] [--expect-error=<code>]`
- `--expect-error` allows smoke tests to assert expected failure codes.

### Smoke Tests
- `npm run smoke:layout` uses `examples/pptmcp_case_mode_v0.1.json`.
- `npm run smoke:charts` uses `examples/charts_smoke.json` and expects a non-column chart failure.
- `npm run smoke:callouts:good` renders `examples/callouts_v0_good.json`.
- `npm run smoke:callouts:fail-anchor` expects `anchor_type_not_supported`.
- `npm run smoke:callouts:fail-placement` expects `callout_no_feasible_placement`.
- `npm run smoke:repair-lines` renders connector/leader repro fixtures for line normalization regression coverage.

### PPTX Integrity Debug Workflow
1. Render a repro spec: `npm run render -- <spec> <out>.pptx --no-pdf --unzip-out=<dir>`
2. Open the PPTX in PowerPoint and allow repair if prompted.
3. Save the repaired file as a new PPTX.
4. Unzip both PPTX files into separate folders.
5. Diff `ppt/slides/slide1.xml`, `ppt/slides/_rels/slide1.xml.rels`, `ppt/drawings/*`, and `[Content_Types].xml`.

### Theme v1 Surfaces & Style Defaults
- Added semantic surface tokens (`color.surface_elevated`, `color.surface_accent`) and surface variants (`surface|elevated|accent`).
- Added `resolveElementStyleDefaults` for consistent, style-only defaults (no geometry).

### Arrowheads + Image v0
- Connectors and callout leaders support deterministic arrowheads (`none|triangle`).
- Image elements render deterministically with `contain|cover` fit and optional surface-backed box.

### Theme v0 Readability
- Added `examples/themes/readability_matrix.json` and `examples/themes/readability_matrix_dark.json` as canonical light/dark regression fixtures.
- Added `--unzip-out` debug helper on the render CLI for PPTX XML diff workflows (warning-only on unzip failure).

## Notes
- Units are inches throughout.
- Charts are intentionally constrained to a minimal, deterministic v0 scope.
- PDF export is best-effort; it does not gate PPTX generation.

## Stability Fixes
- Fixed PPTX repair issue: line shapes now normalized so a:xfrm/a:ext cx/cy are non-negative.
- New error codes: `line_zero_length`, `line_too_short`, `line_width_invalid`.
- Direction-preserving line rendering: extents remain non-negative while diagonal direction is preserved via flip transforms.
- Fixture: `examples/line_direction_quadrants.json` covers all four diagonal directions.
- Connector/leader geometry corrected to preserve absolute start/end positions while maintaining non-negative extents.

## Non-Goals (v0)
- Overlap avoidance or automatic layout.
- Chart-point, element-point, or table-cell anchors.
- Routed or elbow connectors.
- Auto-sizing callout boxes.

## Error Codes
- `layer_z_invalid`
- `anchor_type_not_supported`
- `anchor_region_not_found`
- `anchor_point_invalid`
- `anchor_dx_invalid`
- `anchor_dy_invalid`
- `absolute_position_forbidden`
- `callout_missing_box_dims`
- `callout_no_feasible_placement`
- `callout_box_outside_region`
- `callout_placement_invalid`
- `callout_text_invalid`
- `callout_text_style_invalid`
- `callout_box_padding_invalid`
- `callout_leader_style_not_supported`
- `callout_leader_endcap_not_supported`
- `callout_leader_arrow_invalid`
- `connector_outside_region`
- `connector_style_invalid`
- `connector_arrow_invalid`
- `line_zero_length`
- `line_too_short`
- `line_width_invalid`
- `style_variant_invalid`
- `image_not_found`
- `image_type_not_supported`
- `image_fit_invalid`
- `image_style_invalid`
- `image_opacity_invalid`
- `image_crop_invalid`
- `image_overlay_invalid`
- `image_border_radius_invalid`
- `image_mask_failed`
- `icon_registry_missing`
- `icon_not_found`
- `icon_invalid`
- `theme_invalid_type`
- `theme_name_invalid`
- `theme_overrides_invalid_type`
- `style_tokens_invalid_type`
- `theme_invalid_definition`
- `theme_invalid_json`
- `theme_not_found`
- `theme_contrast_invalid`
- `unknown_style_token`
- `style_token_invalid`

## Renderer Refactor v1
Pure structural extraction.
No behavior changes.
Prepared system for Theme/Style Tokens v0.

## Theme v2 + Geometry v1
- Added post-layout geometry resolution for connectors and callout leaders (arrowheads + trimming, deterministic rounding).
- Introduced Theme v2 scales: font, space, stroke (pure style layer).
- Added Geometry v1 smoke fixture and updated theme readability matrix.


## Templates v1
- Added template compilation layer (templates compile to grid/regions + elements).
- Added template inheritance (single extends) and template library (>=10 templates).
- Updated theme readability matrix to render via `matrix_3x3` template.
- Added templates smoke (light/dark) for deterministic layout verification.

## Design Vocabulary Expansion (2026-02-13)
- Table v0.1: header/body fills + text colors + border driven by theme tokens with contrast validation.
- Icons v0: deterministic registry in `src/assets/iconRegistry.json` and assets in `src/assets/icons/`.
  - Sources: Heroicons `669274d568e42b14f51700ddb2a12b02686f2d55` (optimized/24/outline) and Feather `3dc050d97405062eba78aa57115c0a15c63abdaa` (icons).
  - Added `icons:lint` and `smoke:icons`.
- Image v1: opacity/crop/overlay/border radius supported via deterministic SVG mask wrapper (hard-fail on mask errors).
