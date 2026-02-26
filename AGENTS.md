# AGENTS.md - PPTMCP Contract & Schema

## Overview

PPTMCP is a Model Context Protocol (MCP) server for deterministic PowerPoint generation from JSON specifications. This document defines the project contract for all coding agents (Agents C, Y, X).

## Maintainer Context

- Canonical GitHub profile: `https://github.com/sriram-1997`
- Legacy GitHub reference `https://github.com/guangxiangdebizi` may still appear in older docs/artifacts.

## Long-Term Memory

- This section is intentionally used as long-term memory for agent decisions.
- Preserve command style preferences, behavior tuning, and recurring maintainer instructions across future sessions.
- Keep entries portable so this `AGENTS.md` can be exported to other repositories and retain expected assistant behavior.

## Architecture

### Core Workflow

```
Slide Program JSON Spec
        ->
render_pptmcp (high-level wrapper tool)
        ->
[create_presentation + edit_presentation* tools]
        ->
Deterministic PPTX Output
```

### Tool Chain

- **Low-level tools** (existing): `create_presentation`, `edit_presentation`, `edit_presentation_enhanced`, `edit_presentation_advanced`, `read_presentation`, `analyze_presentation`
- **High-level tool** (new): `render_pptmcp` - wraps low-level tools for natural language editing and grid discipline

## Slide Program JSON Schema

### Root Structure

```json
{
  "title": "Presentation Title",
  "metadata": {
    "author": "Optional",
    "created": "ISO8601 timestamp"
  },
  "theme": "consulting_light_v1",
  "styleTokens": {
    "color.background": "#FFFFFF"
  },
  "slides": [
    {
      "id": "slide-1",
      "title": "Slide Title",
      "grid": {
        "cols": 12,
        "rows": 8,
        "gutter": 0.1
      },
      "regions": {
        "header": { "col": 0, "row": 0, "colSpan": 12, "rowSpan": 1 },
        "content": { "col": 0, "row": 1, "colSpan": 12, "rowSpan": 6 },
        "footer": { "col": 0, "row": 7, "colSpan": 12, "rowSpan": 1 }
      },
      "elements": [
        {
          "type": "text",
          "region": "header",
          "content": "Header Text",
          "style": { "fontSize": 24, "bold": true, "color": "#000000" }
        },
        {
          "type": "text",
          "region": "content",
          "content": "Body text here",
          "style": { "fontSize": 14, "color": "#333333" }
        }
      ]
    }
  ]
}
```

### Grid Coordinate System

- **Units**: Inches (EMU conversion handled internally)
- **Slide Size**: 13.333 x 7.5 inches (16:9 aspect ratio)
- **Grid**: Each slide defines cols/rows for layout anchoring
- **Gutter**: Spacing in inches between regions
- **Region**: Defined by {col, row, colSpan, rowSpan} relative to grid
- **Element Positioning**: Computed deterministically from region bbox + gutter offsets

### Coordinate Calculation

```
slide_width = 13.333 inches
slide_height = 7.5 inches
cell_width = (slide_width - (cols-1)*gutter) / cols
cell_height = (slide_height - (rows-1)*gutter) / rows

region.x = col * cell_width + col * gutter
region.y = row * cell_height + row * gutter
region.width = colSpan * cell_width + (colSpan-1) * gutter
region.height = rowSpan * cell_height + (rowSpan-1) * gutter
```

### Element Types

#### Text Element
```json
{
  "type": "text",
  "region": "region-name",
  "content": "Text content",
  "style": {
    "fontSize": 14,
    "bold": false,
    "italic": false,
    "color": "#000000",
    "align": "left",
    "verticalAlign": "top"
  }
}
```

#### Table Element
```json
{
  "type": "table",
  "region": "region-name",
  "content": {
    "headers": ["Col1", "Col2"],
    "rows": [
      [{"text": "A1", "style": {...}}, "A2"],
      ["B1", "B2"]
    ]
  },
  "style": {
    "borderColor": "#000000",
    "borderWidth": 1,
    "headerColor": "#F0F0F0"
  }
}
```

#### Chart Element
```json
{
  "type": "chart",
  "region": "region-name",
  "content": {
    "chartType": "column",
    "title": "Chart Title",
    "dataSeries": [
      { "name": "Series A", "data": [["Q1", 1.0], ["Q2", 2.0]] }
    ]
  }
}
```
Line chart (v0.1):
```json
{
  "type": "chart",
  "region": "region-name",
  "chartType": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "series": [
      { "name": "Series A", "values": [10, 15, 12] }
    ]
  },
  "options": { "showGrid": true, "showMarkers": true, "smooth": false, "yAxisZero": true }
}
```
**Status**: Supported in v0/v0.1 with strict constraints (column + line only).

#### List Element
```json
{
  "type": "list",
  "region": "region-name",
  "style": "dot",
  "bullet": { "size": "md", "gap": 10, "color": "text" },
  "indent": { "left": 0, "hanging": 18 },
  "lineGap": 6,
  "items": [
    { "text": "**Bold lead** - supporting explanation" }
  ]
}
```

#### Card Element
```json
{
  "type": "card",
  "region": "region-name",
  "variant": "surface",
  "style": {
    "bg": "surface",
    "border": "default",
    "radius": "md",
    "padding": "md",
    "shadow": "sm",
    "accent": { "edge": "left", "color": "accent", "width": 6 }
  },
  "header": { "title": "Title", "subtitle": "Optional subtitle", "icon": "target" },
  "body": [
    { "type": "list", "style": "dot", "items": [{ "text": "First point" }] }
  ],
  "footer": { "strip": true, "label": "Key Takeaway", "text": "Concise insight sentence." }
}
```

### Theme / Style Tokens v2

Theme is a pure style layer. It does not change geometry or layout behavior.

**Spec forms (both supported):**
```json
{ "theme": "consulting_light_v1", "styleTokens": { "color.accent": "#10B981" } }
```
```json
{ "theme": { "name": "consulting_light_v1", "overrides": { "color.accent": "#10B981" } } }
```

**Token keys (v2):**
- `color.background`
- `color.surface`
- `color.surface_elevated`
- `color.surface_accent`
- `color.text_primary`
- `color.text_secondary`
- `color.border_default`
- `color.table_header_fill`
- `color.table_body_fill`
- `color.table_header_text`
- `color.table_body_text`
- `color.table_border`
- `color.primary`
- `color.accent`
- `chart.palette` (array of `#RRGGBB`)
- `font_scale.title.family`
- `font_scale.title.size`
- `font_scale.title.weight`
- `font_scale.subtitle.family`
- `font_scale.subtitle.size`
- `font_scale.subtitle.weight`
- `font_scale.body.family`
- `font_scale.body.size`
- `font_scale.body.weight`
- `font_scale.caption.family`
- `font_scale.caption.size`
- `font_scale.caption.weight`
- `space_scale.0` .. `space_scale.5`
- `stroke_scale.thin`
- `stroke_scale.normal`
- `stroke_scale.heavy`
- `type.font_family_primary` (legacy)
- `type.font_family_secondary` (legacy)
- `type.body_size` (legacy)
- `type.small_size` (legacy)
- `type.weight_medium` (legacy)
- `type.weight_bold` (legacy)
- `shape.border_width_default` (legacy)

**Rules:**
- Unknown token keys hard-fail with `unknown_style_token`.
- Invalid token values hard-fail with `style_token_invalid`.
- Missing theme file hard-fails with `theme_not_found`.
- Chart styling maps to existing color tokens. Chart text/legend uses `color.text_primary`. Axis/gridlines use `color.border_default`. Chart/plot area fill uses `color.background`.
- Elements may set `variant` to `surface|elevated|accent` to apply semantic surfaces (style-only; no geometry changes).
 
**Theme files:** `src/theme/config/*.json`

Style defaults: use `src/theme/styleDefaults.ts` to resolve variant-based defaults per element (no geometry in this layer).

#### Callout Element (v0)
```json
{
  "type": "callout",
  "region": "container",
  "z": 120,
  "variant": "surface",
  "anchor": { "type": "region", "targetRegion": "chart", "point": "ne", "dxPt": 0, "dyPt": 0 },
  "box": { "wIn": 2.2, "hIn": 0.8, "placement": "auto", "paddingPt": 6 },
  "text": { "value": "Callout text", "style": { "fontSize": 12 } },
  "leader": { "style": "line", "endCap": "none", "startArrow": "none", "endArrow": "triangle" }
}
```

#### Connector Element (v0)
```json
{
  "type": "connector",
  "region": "container",
  "z": 110,
  "variant": "surface",
  "start": { "type": "region", "targetRegion": "chart", "point": "e" },
  "end": { "type": "region", "targetRegion": "table", "point": "w" },
  "style": { "widthPt": 1, "startArrow": "none", "endArrow": "triangle" }
}
```

#### Image Element (v1)
```json
{
  "type": "image",
  "region": "content",
  "src": "relative/or/absolute/path.png",
  "fit": "contain",
  "variant": "elevated",
  "opacity": 0.95,
  "crop": { "left": 0.05, "right": 0.05, "top": 0.05, "bottom": 0.05 },
  "overlaySurfaceSlot": "surface.background",
  "overlayOpacity": 0.3,
  "borderRadiusPt": 12,
  "style": { "borderColor": "#D1D5DB", "borderWidthPt": 1 }
}
```

#### Icon Element (v0)
```json
{
  "type": "icon",
  "region": "content",
  "name": "growth",
  "sizeToken": 2,
  "colorSlot": "text.body",
  "align": "center",
  "verticalAlign": "middle"
}
```


#### Template Slide (v1, compile-to-regions)
Templates allow slides to reference a named template (from `src/templates/config`) or provide an inline template object. Templates compile deterministically into standard `grid`/`regions`/`elements` before rendering.

Example:
```json
{
  "id": "slide-1",
  "title": "Template Slide",
  "template": "title_slide",
  "fills": {
    "title": { "content": "Templates v1" },
    "subtitle": { "content": "Compiled to regions" }
  }
}
```

Rules:
- `template` must be a string id or inline template object.
- `fills` keys must match template placeholder ids.
- Slot overrides only: `textStyleSlot`, `paddingSlot`, `strokeSlot`. Raw style values are rejected.
- Template inheritance is single-level (`extends`), cycles hard-fail.

### Element Validation Rules

1. **Region Reference**: All elements must have a valid `region` that exists in the slide's `regions` object.
2. **Unsupported Types**: If `type` is not in {text, list, card, table, chart, chevron_flow, callout, connector, image, icon}, hard-fail with actionable error.
3. **Missing Fields**: If required fields (type, region, content) are missing, hard-fail.
4. **Chart Types**: Only `chartType="column"` and `chartType="line"` are supported. Anything else hard-fails with `chart_type_not_supported`.
5. **Chart Data**: Column charts use `dataSeries` (1-2 series, aligned categories, `[label, number]` points) and invalid data hard-fails with `chart_data_invalid`. Line charts require `data.labels` plus `data.series[].values` length matches; empty series hard-fails with `chart_no_series`; non-numeric values hard-fail with `chart_invalid_value`.
6. **Chart Density**: Category count > 25 hard-fails unless `allow_dense_charts` is enabled.
7. **Label Constraints**: Long labels in narrow charts hard-fail unless `allow_dense_charts` is enabled.
8. **Anchors**: Callout/connector anchors must be `type="region"` only; other types hard-fail with `anchor_type_not_supported`.
9. **Layering**: `z` must be an integer; invalid values hard-fail with `layer_z_invalid`.
10. **Unknown Schema Fields**: In strict mode (default true), any unknown top-level field causes hard-fail.

### Anchors v0
- Supported: `type="region"` with `targetRegion`, `point`, `dxPt`, `dyPt`.
- Reserved (hard-fail `anchor_type_not_supported`): `chart_point`, `element_point`, `table_cell`.

## Component Library v1

Canonical templates under `src/templates/config/`:
- `analysis_5_col`
- `comparison_3_col`
- `kpi_dashboard`
- `architecture_flow`
- `before_after`
- `timeline_horizontal`
- `strategy_stack`
- `matrix_2x2`

Template requirements:
- Deterministic compile-to-regions only (no absolute x/y).
- `layoutMode` explicitly declared per placeholder.
- `gapToken` required for `vstack|hstack|grid`.
- `allowedKinds` explicitly declared.
- `minItems`/`maxItems` enforced.

## IR Canonicalization v0.2

Canonicalization runs after template compilation and before validation/render.

- Entry point: `src/compiler/canonicalize.ts` (`canonicalizeIR`).
- Card padding authority:
  - `style.paddingSlot` + `style.paddingPt` together hard-fail with `card_padding_ambiguous`.
  - `style.paddingSlot` resolves to `style.paddingPt` from theme `space_scale`.
  - Runtime IR removes `paddingSlot`; renderer consumes `paddingPt` only.
- Quantization:
  - Grid/region geometry and resolved insets are quantized to `EMU_STEP`.
  - Region rects are persisted on IR (`region.__rect`) and reused downstream.
- Z-order stabilization:
  - Deterministic bucket order: `background -> surfaces -> shapes -> connectors -> text -> overlays`.
  - Tie-breaker uses stable element id key and source order.

## Geometry Stabilization v2

### Chevron geometry
- Chevron tip/notch depth is fixed from header height (not region width-proportional).
- `tipDepthIn = min(0.25 * headerHeight, constantMax)`.
- `notchDepthIn = tipDepthIn` unless narrow-width fallback applies.
- Narrow-width fallback: if `width < 2*tipDepthIn + minTextPadding`, notch is removed (trapezoid fallback).

### Arrowhead scaling policy
- Minimum viable line length invariant remains `0.01 in`.
- Arrowhead scaling in `80%-100%` band is silent.
- If required arrow scaling is `<80%`, hard-fail with `line_too_short`.
- `arrowhead_scaled` warning is removed.

### Card padding slot enforcement
- Template compiler resolves card padding from `space_scale[paddingSlot]` into compiled card IR (`style.paddingPt`).
- Card body/inner padding and footer strip padding consume resolved slot-driven padding.
- No compiler hardcoded card padding fallback values.

## Typography Invariants v0.1

### List Metrics
- Canonical list metrics are centralized in `src/typography/listMetrics.ts`.
- Dot metrics:
  - `leftIndentPt = 18`
  - `hangingPt = 12`
  - `bulletGapPt = 6`
- Number metrics:
  - Fixed prefix width; text left edge aligned to dot style.
- Icon metrics:
  - `iconBoxWidthPt = 12`
  - text left edge aligned to dot/number styles
  - baseline nudge is deterministic
- Invariants:
  - text left edge is style-invariant (`dot|number|icon`)
  - `hangingPt <= leftIndentPt`
  - inline bold runs never alter indentation.

### Rhythm
- Rhythm rules are centralized in `src/typography/rhythm.ts`.
- Slots:
  - `title`: `lineHeight=1.05`, paragraph spacing before/after `0`
  - `body`: `lineHeight=1.15`, paragraph spacing before/after `0`
  - `lists`: `lineHeight=1.15`, paragraph spacing before/after `0`
- Out-of-band line-height overrides hard-fail with `rhythm_override_out_of_band`.

## render_pptmcp Tool Specification

### Input Schema

```json
{
  "spec_path": "string (required)",
  "output_path": "string (required)",
  "template": "string (optional, default='professional')",
  "strict": "boolean (optional, default=true)",
  "allow_dense_charts": "boolean (optional, default=false)",
  "export_pdf": "boolean (optional, default=false)"
}
```

### Output Schema

```json
{
  "output_path": "string",
  "slides_rendered": "number",
  "warnings": ["array of strings"],
  "success": "boolean"
}
```

### Behavior

- **Deterministic**: Same spec -> same PPTX (byte-for-byte when possible)
- **Fail-Fast**: Unknown field or unsupported element -> no partial output
- **Warnings**: Logged but don't fail; e.g., "missing optional metadata", "font fallback used"
- **PDF Export**: If `export_pdf=true`, attempt to create a PDF next to the PPTX (best-effort; failures become warnings).
- **Strict Mode**: 
  - `true` (default): Unknown schema fields -> ERROR
  - `false`: Unknown fields ignored, logged as warnings

### Implementation Contract

1. Parse JSON spec, validate schema
2. Create presentation via `create_presentation` with title from spec
3. For each slide:
   - Validate grid and regions
   - For each element:
     - Validate region reference
     - Compute bbox from region
     - Render via appropriate operation:
       - Text -> `edit_presentation` op=add_text
       - Table -> `edit_presentation` op=add_table (or hard-fail if unsupported)
       - Chart -> `pptxgenjs` addChart (column + line), or hard-fail on unsupported chart types/data
       - Callout -> box + text + straight leader line (region-bounded)
       - Connector -> straight line between two region anchors (region-bounded)
4. Return result with warnings array

### Error Handling

- **Validation Errors** (exit code 1):
  - Invalid JSON
  - Missing required fields
  - Unknown region references
  - Unsupported element types (in strict mode)
- **Rendering Errors** (exit code 1):
  - File I/O failures
  - Tool invocation timeouts
  - Coordinate computation errors

## CLI Entrypoint

### Command

```bash
npm run render -- <spec_path> <output_path> [--template=<template>] [--no-strict] [--allow-overflow] [--allow-dense-charts] [--no-pdf] [--expect-error=<code>]
```

### Examples

```bash
npm run render -- examples/pptmcp_case_mode_v0.1.json out/latest.pptx
npm run render -- spec.json out.pptx --template=modern
npm run render -- spec.json out.pptx --no-strict
npm run render -- spec.json out.pptx --allow-overflow
npm run render -- spec.json out.pptx --allow-dense-charts
npm run render -- spec.json out.pptx --no-pdf
```

### Exit Codes

- `0`: Success
- `1`: Validation or rendering error

## Backlog TODO

- TODO: Plan a repo/tool naming migration away from `pptmcp` toward a capability-based name. Do not execute rename in this task; define migration scope, aliases, and compatibility path first.
- TODO: Add chart_point anchors (plot area / legend / data point) when chart semantics are stable.
- TODO: Add element_point anchors for generic shapes/text boxes.
- TODO: Add routed/elbow connectors with deterministic routing.
- TODO: Add overlap avoidance for callouts (deterministic; no auto layout drift).
- TODO: Add repro_chart_only + repro_callout_no_leader for corruption isolation.
- TODO: Add unzip-out helper for XML diff debugging.
- TODO: Stability - No-repair PPTX: add integrity harness, isolate culprit via repro specs, then patch renderer.
- TODO: Add optional XML sanity validator pass (future).
- TODO: Keep line normalization invariant for any future arrow/connector primitives.
- TODO: If future arrowheads added, ensure arrow orientation uses preserved direction.
- Invariant: Line rendering must preserve start/end coordinates exactly.

## Smoke Test

### Command

```bash
npm run smoke:layout
```

### Charts Smoke

```bash
npm run smoke:charts
```

### Callouts Smoke

```bash
npm run smoke:callouts:good
npm run smoke:callouts:fail-anchor
npm run smoke:callouts:fail-placement
```

### Behavior

- Reads `examples/pptmcp_case_mode_v0.1.json`
- Outputs to `out/layout-smoke.pptx`
- Exits 0 on success, 1 on failure
- Validates: render succeeds with zero overflow in validation report

## Repo Hygiene

- One canonical smoke path: use `npm run smoke:layout` (and `npm run smoke:charts` for chart assertions). Avoid parallel smoke scripts.

## Supported Visual Capabilities (v0)

- **Charts**: Yes, with constraints.
  - Supported: column charts (`chartType="column"`), 1-2 series, aligned categories.
  - Supported: line charts v0.1 (`chartType="line"`), multiple series with aligned labels.
  - Constraints: max 25 categories for column charts unless `allow_dense_charts=true`; long labels require sufficiently wide regions.
  - Unsupported: other chart types hard-fail with `chart_type_not_supported`.
- **Lists**: Yes, with constraints.
  - Supported: dot, number, icon, none; inline **bold** runs only; hanging indent.
  - Constraints: invalid bullet styles hard-fail (`invalid_bullet_style`); missing icon hard-fails (`missing_icon`).
- **Cards**: Yes, with constraints.
  - Supported: header/body/footer zones, accent edge, footer strip, list body content.
  - Constraints: overflow hard-fails with `card_overflow`.
- **Callouts**: Yes, with constraints.
  - Supported: box + text + straight leader line; region-only anchors.
  - Constraints: box must fit region; auto placement uses deterministic order.
- **Connectors**: Yes, with constraints.
  - Supported: straight line between two region anchors.
  - Constraints: endpoints must be inside the connector region.
- **Tables**: Yes, with constraints.
  - Supported: basic rectangular tables (`headers` + `rows`) with string or `{text, style}` cells.
  - Constraints: row cell count must match headers; raw numeric/boolean cell values must be stringified in spec.
  - Unsupported: merged cells (`rowSpan`/`colSpan`) must hard-fail.
- **Images**: Yes, with constraints.
  - Supported: `contain` or `cover` fit inside a region; optional surface-backed box via `variant`.
  - Supported: optional `opacity`, `crop`, `borderRadiusPt`; optional full-slide overlay via `overlaySurfaceSlot` + `overlayOpacity`.
  - Constraints: `src` must exist; only PNG/JPG/JPEG supported. Overlay only allowed for full-slide images.
- **Icons**: Yes, with constraints.
  - Supported: registry-backed SVG icons (`src/assets/icons` + `src/assets/iconRegistry.json`).
  - Constraints: name must exist in registry; size comes from `space_scale[sizeToken]`; color from `text.*` slot.
- **Diagrams**: No. Diagram DSL/object elements are unsupported and must hard-fail.
- **Advanced shape ops**: Unsupported. Layered/boolean shape operations are out of scope and must hard-fail.

## Design Philosophy

PPTMCP prioritizes structural clarity, deterministic layout behavior, and strict grid discipline over arbitrary PowerPoint expressiveness.
- Determinism > expressiveness.
- Regions-only placement; no absolute x/y/w/h in specs.
- Hard-fail unsupported types or invalid schema.

## Known Limitations & Future Work

1. **Charts**: Column charts (v0) and line charts (v0.1) only; other types remain unsupported.
2. **Tables**: Depends on `add_table` support in `edit_presentation`. If missing, hard-fail.
3. **Images**: Supported with constraints; only PNG/JPG/JPEG, `contain|cover`, optional crop/opacity/border radius, full-slide overlay only.
4. **Icons**: Registry-backed only; no arbitrary SVG injection from spec.
5. **Custom Fonts**: Text content uses available system fonts; specifying unavailable fonts is a warning, not an error.
6. **Video/Animations**: Not supported. Hard-fail.

## Feedback & Issues

See [/feedback/C_FEEDBACK.md](/feedback/C_FEEDBACK.md) for known issues and learnings.

## Prompting Guidelines (Y <-> C)

- State the target artifact first (tooling change, CLI behavior, PPT output, or test).
- Define explicit success criteria (what command should pass/fail, expected report fields, and exit code behavior).
- Include constraints and exclusions (what must not be changed, especially protocol and schema compatibility).
- Specify verification commands and expected outcomes.

