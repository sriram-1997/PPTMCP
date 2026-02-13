# PPTMCP Project Overview

## Executive Summary
PPTMCP is a deterministic PowerPoint generation system driven by a JSON slide program. It enforces strict schema validation, grid-based layout, and reproducible output for structured slide creation. The system is optimized for stability and repeatability rather than freeform design.

## What It Does
- Converts JSON slide specs into PPTX files using a strict, region-based layout grid.
- Supports text, tables, column charts, callouts (box + leader), connectors, and images.
- Provides a CLI (`npm run render`) and MCP tool interface for automated workflows.

## Architecture (High-Level)
1. JSON spec -> validation (strict by default)
2. Grid/region math -> deterministic bounding boxes
3. Element preparation -> content + styles + layout report
4. Rendering -> PptxGenJS PPTX output
5. Optional PDF export (best-effort)

## Determinism & Validation
- Determinism prioritized over expressiveness; same input yields the same PPTX.
- Unknown schema fields hard-fail in strict mode.
- Validation reports for text/table overflow (shrink/truncate/error).
- Integrity checks and repro fixtures protect against PowerPoint repair prompts.

## Supported Elements (v0)
- Text: font, color, alignment, shrink-to-fit.
- Table: headers + rows, strict column alignment.
- Chart: column-only, 1?2 series, aligned categories.
- Callout: box + text + straight leader line.
- Connector: straight line between region anchors.
- Image: contain/cover fit inside region, deterministic.

## Theme System (v1)
- Pure style layer: no geometry or layout changes.
- Semantic surfaces: surface, elevated, accent.
- Theme tokens map to consistent colors, borders, and text styling.
- Dark/light themes remain readable across elements.

## Recent Enhancements
- Theme v1 semantic surfaces and shared style-default resolver.
- Arrowheads on connectors and callout leaders with stable directionality.
- Image element support with deterministic fit modes.

## Primary Use Cases
- Consulting-style decks with strict templates.
- Automated reporting decks with charts and tables.
- Reliable, testable slide generation in CI.

## Known Limitations
- Chart types are limited to column in v0.
- No absolute positioning in specs (region-only).
- No animations, media, or advanced shape operations.

## Suggested Next Steps
- Expand chart types while preserving strict validation.
- Optional XML sanity validation pass for OpenXML integrity.
- More theme variants and brand presets.
