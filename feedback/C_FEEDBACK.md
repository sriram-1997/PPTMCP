# C_FEEDBACK.md - Agent C Learnings

## Session 1: Initial render_pptmcp Implementation

### Coordinate System (RESOLVED)
- **Issue**: Ambiguity about measurement units (pixels, inches, EMUs)
- **Decision**: Use **inches** as the standard unit throughout the schema and render function
  - Slide size: 13.333 × 7.5 inches (16:9)
  - Grid cells and regions computed in inches
  - PptxGenJS internally uses inches for positioning
- **Rule**: Always assume inches unless explicitly documented otherwise

### Table Support
- **Status**: `edit_presentation` tool supports `operation: "add_table"`
- **Rule**: Use add_table for table elements; if tool doesn't support it, hard-fail loudly

### Chart Support
- **Status**: Implemented in v0 with constraints
- **Rule**: Only `chartType="column"` is supported. Non-column charts hard-fail with `chart_type_not_supported`. Invalid data hard-fails with `chart_data_invalid`. Series count >2 hard-fails with `chart_series_limit_exceeded`.

### Grid Discipline
- **Key Learning**: Grid discipline means:
  1. Elements have NO absolute x/y positioning
  2. Elements reference named regions via `region` field
  3. Regions define grid coverage via {col, row, colSpan, rowSpan}
  4. Element bbox is computed deterministically from region geometry
- **Rule**: Enforce this strictly; any absolute position in element → ERROR

### Strict Mode
- **Default**: `strict=true` (enforces schema compliance)
- **Behavior**: Unknown top-level fields in JSON → hard-fail
- **Override**: `strict=false` allows graceful ignore + warning
- **Rule**: Always validate against schema in strict mode; log warnings in non-strict

## Next Sessions

(Reserved for future learnings)

## Session 2: Capability Stress-Test Boundaries

### Merged Table Cells
- **Status**: Unsupported in current deterministic table model.
- **Rule**: If table cells include `rowSpan` or `colSpan`, hard-fail with explicit `table_cell_merge_not_supported` instead of silently flattening.

### Table Cell Types
- **Status**: Only string and `{text, style}` cell objects are supported.
- **Rule**: Raw numeric/boolean table cell values must hard-fail with an actionable conversion message (convert to strings in spec).

## Session 3: Callouts v0 + Layering

### z-Order Determinism
- **Learning**: Stable ordering must be explicit when multiple elements share a z value.
- **Rule**: Sort by `(z asc, input order asc)`; do not rely on runtime insertion order.

### Anchor Resolution (Points + Offsets)
- **Learning**: Anchors need deterministic point mapping and pt-to-inch conversion.
- **Rule**: Compute region point first, then apply dxPt/dyPt offsets with `72pt = 1in`.

### Line Shapes in PptxGenJS
- **Learning**: Line shapes use `x,y,w,h` as delta to end point; w/h must be set as end-start.
- **Rule**: Always set `w = end.x - start.x`, `h = end.y - start.y` for deterministic straight lines.

### Chart Data Schema
- **Learning**: PptxGenJS chart data expects `values`, not `val`.
- **Rule**: Always use `{ labels, values }` for series data to avoid runtime XLSX generation errors.

## Session 4: No-Repair PPTX Stability

### Repro-First Debugging
- **Learning**: Isolating PPTX repair prompts requires minimal repro specs and bisection variants (chart vs line vs callout).
- **Rule**: Always create minimal and bisection specs before changing renderer behavior.

### Integrity Logging Fields
- **Learning**: Deterministic geometry logs accelerate root-cause analysis.
- **Rule**: Log render order, region rects, resolved anchor/box/line points, and integrity warnings (NaN/Inf/negative/out-of-bounds/zero-length lines).

### Repair-First Diffing
- **Learning**: Repair-first XML diff workflow for OpenXML corruption.
- **Rule**: Save repaired PPTX, unzip both, and diff slide XML + rels before patching renderer.

### Isolation Order
- **Learning**: Isolation via minimal repro variants before patching renderer.
- **Rule**: Add chart-only and callout-only variants to bisect corruption sources early.

### OpenXML Line Extents
- **Learning**: OpenXML extents must be non-negative; normalize line rects.
- **Rule**: PowerPoint repair clamping indicates invalid geometry; fix source instead of relying on repair.

### Line Direction Preservation
- **Learning**: OpenXML line preset draws a diagonal across the bounding box; preserving direction requires flips or equivalent.
- **Rule**: Normalize extents and apply deterministic flip transforms to keep intended start->end direction.

### Line Anchor Drift
- **Learning**: OpenXML line preset is the diagonal of the bounding box; anchor the box to an actual endpoint to avoid drift.
- **Rule**: Choose x/y per dx/dy quadrant so the start/end points remain exact.
