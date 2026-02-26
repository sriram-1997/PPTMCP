# PPT-MCP

PPT-MCP is a Model Context Protocol (MCP) server for PowerPoint workflows, with a deterministic JSON-to-PPTX renderer designed for enterprise guardrails.

## What Is Current

- Primary workflow: `render_pptmcp` (deterministic slide rendering from JSON specs).
- Low-level tools are still available: `create_presentation`, `edit_presentation`, `edit_presentation_enhanced`, `edit_presentation_advanced`, `read_presentation`, `analyze_presentation`.
- Template system: templates v1 compile to standard `grid`/`regions`/`elements` before rendering.
- Theme system: style tokens v2 with strict validation.
- Enterprise hardening: `--enterprise-mode` in CLI render flow.

## Installation

### From source

```bash
```bash
git clone https://github.com/sriram-1997/PPTMCP.git
cd ppt-mcp
npm install
npm run build
```
cd ppt-mcp
npm install
npm run build
```

### Run server (stdio)

```bash
npm start
```

### Run with SSE bridge

```bash
npm run sse
```

## Render CLI

The render CLI is the recommended way to compile specs locally.

```bash
npm run render -- <spec_path> <output_path> \
  [--template=<template>] \
  [--no-strict] \
  [--allow-overflow] \
  [--allow-dense-charts] \
  [--enterprise-mode] \
  [--no-pdf] \
  [--expect-error=<code>] \
  [--repeat=N] \
  [--determinism] \
  [--debug-integrity] \
  [--unzip-out=<dir>]
```

Examples:

```bash
npm run render -- examples/pptmcp_case_mode_v0.1.json out/latest.pptx
npm run render -- examples/demos/enterprise_fixed_demo.json out/enterprise.pptx --enterprise-mode --no-pdf
npm run render -- examples/demos/enterprise_fixed_demo.json out/enterprise_det.pptx --enterprise-mode --repeat=2 --determinism --no-pdf
```

## Enterprise Mode

When `--enterprise-mode` is enabled:

- Overflow soft handling is disabled (no truncation fallback).
- Theme must be explicitly present in the spec.
- Shape usage is restricted by enterprise validation rules.
- Bullet density checks are enforced.
- Determinism is verified by hashing successive renders in CLI flow.

## Render Outputs and Metrics

Render results include:

- `slides_rendered`
- `warnings`
- `validation_report`
- `render_metrics`:
  - `total_slides`
  - `total_elements`
  - `overflow_count`
  - `validation_failures`
  - `render_time_ms`

CLI also writes a markdown report to:

- `docs/validation_report.md`

## Supported Visual Capabilities (Current)

- Text
- Lists
- Cards
- Tables (no merged cells)
- Charts: column and line
- Chevron flow
- Callouts
- Connectors
- Node/edge diagrams
- Images
- Icons

All placement is region/grid-based. Absolute positioning in specs is rejected.

## Smoke and Verification

Common verification commands:

```bash
npm run smoke:layout
npm run smoke:charts
npm run smoke:callouts:good
npm run smoke:all
```

For grouped smoke runs, see `smokes.manifest.json` and `scripts/smoke-runner.mjs`.

## Documentation

- `AGENTS.md` (project contract and schema)
- `docs/theme_v2.md`
- `docs/templates_v1.md`
- `docs/system_discipline.md`
- `docs/geometry_v1.md`
- `docs/failure_modes.md`
- `docs/pilot_readiness.md`

## Known Constraints

- Determinism and guardrails are prioritized over free-form PowerPoint expressiveness.
- Unsupported element types hard-fail in strict mode.
- Advanced animations/video are out of scope.

## Author

Sriram Gurumurthy

- Email: lnus@smu.edu
- GitHub: https://github.com/sriram-1997

## License

Apache-2.0. See `LICENSE`.
