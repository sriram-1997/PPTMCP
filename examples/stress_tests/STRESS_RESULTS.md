# Stress Test Results (Capability Phase)

## Specs
- `examples/stress_tests/charts.json`
- `examples/stress_tests/tables.json`
- `examples/stress_tests/diagrams.json`
- `examples/stress_tests/shapes.json`

## Render Outcomes

### `charts.json`
- Command: `node scripts/render-cli.mjs examples/stress_tests/charts.json out/stress/charts.pptx`
- Result: **Fail** (expected; negative cases included)
- Error(s):
  - `chart_type_not_supported` on non-column chart
  - `chart_series_limit_exceeded` on >2 series
  - `chart_data_invalid` on misaligned categories
- Overflows: Not reached (validation failed first)
- Silent degradation: None observed

### `tables.json`
- Command: `node scripts/render-cli.mjs examples/stress_tests/tables.json out/stress/tables.pptx`
- Result: **Fail**
- Error(s):
  - `table_cell_merge_not_supported` at `r1c1`
  - `table_cell_merge_not_supported` at `r2c1`
- Overflows: Not reached (validation failed first)
- Silent degradation: None observed (merge attempts now hard-fail)

### `diagrams.json`
- Command: `node scripts/render-cli.mjs examples/stress_tests/diagrams.json out/stress/diagrams.pptx`
- Result: **Fail**
- Error(s):
  - Unsupported element type `diagram` (2 occurrences)
- Overflows: Not reached (validation failed first)
- Silent degradation: None observed

### `shapes.json`
- Command: `node scripts/render-cli.mjs examples/stress_tests/shapes.json out/stress/shapes.pptx`
- Result: **Fail**
- Error(s):
  - Unsupported element type `shape` (2 occurrences)
- Overflows: Not reached (validation failed first)
- Silent degradation: None observed

## Capability Classification

### Charts
- Supported reliably: **Yes (column only)**
- Supported with constraints: **Yes**
  - `chartType="column"` only
  - 1-2 series, aligned categories
  - Category count capped unless `allow_dense_charts=true`
- Unsupported (must error): **Yes** (non-column, >2 series, invalid data)

### Tables
- Supported reliably: **Yes (basic tables only)**
- Supported with constraints: **Yes**
  - Cells must be string or `{text, style}` object
  - Header count must match each row length
  - Raw numeric/boolean cells must be converted to strings
  - Merged cells (`rowSpan`/`colSpan`) are not supported
- Unsupported (must error): **Yes (merged-cell tables)**

### Diagrams
- Supported reliably: **No**
- Supported with constraints: **No**
- Unsupported (must error): **Yes** (`diagram` element type)

### Advanced Shape Operations
- Supported reliably: **No**
- Supported with constraints: **No**
- Unsupported (must error): **Yes** (`shape` element type and boolean-like ops)

## Recommendation
- Support next:
  1. Basic chart support behind strict bounded scope (one chart type first, explicit data schema).
  2. Explicit diagram primitive mapping only after shape primitives exist.
- Forbid for now:
  1. Merged table cells.
  2. Diagram DSL objects.
  3. Advanced shape boolean operations.
