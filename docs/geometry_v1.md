# Geometry v1

## Overview
Geometry v1 resolves all connector and callout-leader geometry **after** layout has finalized slide boxes.
The pipeline is:

1. Layout resolves region boxes and callout boxes.
2. Geometry resolution computes connector/leader endpoints.
3. Arrowheads are sized and applied; line segments are trimmed to arrow bases.
4. Geometry invariants are validated.

## Arrowhead sizing
Arrowheads scale deterministically with stroke width (points):

```
headLengthPt = clamp(minL, kL * strokeWidthPt, maxL)
headWidthPt  = clamp(minW, kW * strokeWidthPt, maxW)
```

Defaults:
- `minL=6`, `maxL=14`, `kL=4`
- `minW=4`, `maxW=12`, `kW=2.5`

Arrowhead tips sit **exactly** on the intended endpoint. The line is trimmed so the line end matches the arrowhead base.

## Callout leader trimming
Leader endpoints are computed by intersecting a ray from the anchor to the callout box center with the box boundary.
This ensures leaders terminate precisely on the box edge, then arrowheads/trim are applied.

## Deterministic rounding
Final geometry is rounded to **1e-4 inches** to ensure stable, deterministic output across runs.

## Invariants
- No negative extents on any shape.
- Line start/end never coincide (`line_zero_length`).
- Lines shorter than 0.01 in hard-fail (`line_too_short`).

## Related error codes
- `line_zero_length`
- `line_too_short`
- `line_width_invalid`
- `connector_outside_region`
- `callout_no_feasible_placement`

## Arrowhead Policy
- Arrowheads may scale silently only within the 80%-100% target size band.
- If required scaling drops below 80%, rendering hard-fails with `line_too_short`.
- `line_too_short` now includes threshold diagnostics:
  - `segmentLengthIn`
  - `requiredHeadLengthIn`
  - `computedScale`
  - `thresholdUsed`
