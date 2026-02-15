# System Discipline (Theme + Templates + Geometry)

This document captures the guardrails that keep PPTMCP deterministic and strictly validated. These rules are enforced at theme load, template compilation, and IR validation time.

## Slot Hierarchy (Canonical Paths)

SlotMap uses canonical theme paths only:

- `theme.font_scale.<name>` for typography slots
- `theme.surfaces.<name>` for surface slots
- `theme.stroke_scale.<name>` for stroke slots

SlotMap (explicit, exhaustive):

- `text.title` → `theme.font_scale.title`
- `text.subtitle` → `theme.font_scale.subtitle`
- `text.body` → `theme.font_scale.body`
- `text.caption` → `theme.font_scale.caption`
- `surface.background` → `theme.surfaces.background`
- `surface.surface` → `theme.surfaces.surface`
- `surface.elevated` → `theme.surfaces.elevated`
- `surface.accent` → `theme.surfaces.accent`
- `stroke.thin` → `theme.stroke_scale.thin`
- `stroke.normal` → `theme.stroke_scale.normal`
- `stroke.heavy` → `theme.stroke_scale.heavy`

Unknown slot paths hard-fail.

## Contrast Policy (Global, Usage-Independent)

Theme contrast is validated at theme load across the full declared set of slot pairs, independent of whether templates use them.

Bounds (hard-fail if violated):

- `contrast.min_ratio_body >= 4.5`
- `contrast.min_ratio_title >= 3.0`
- `contrast.min_ratio_ui >= 3.0`
- `contrast.max_ratio <= 10`

Evaluation scope:

- Cross-product of text slots `{body, title, subtitle, caption}` vs surface slots `{background, surface, elevated, accent}`.
- Required UI pair: `table.headerTextColor` vs `table.headerFill`.

Failure code: `theme_contrast_invalid (<pair>)`.

## Template Discipline

### Placeholder Content Constraints

Placeholders can declare:

- `allowedKinds` (list of supported kinds)
- `minItems`, `maxItems` (integer bounds)

Violations hard-fail (`template_items_count_invalid`, `template_item_kind_invalid`).

### Deterministic Layout Modes

`layoutMode` is one of:

- `single`
- `vstack`
- `hstack`
- `grid`

Rules:

- `gapToken` required for `vstack`, `hstack`, and `grid`.
- `grid` requires `gridRows` and `gridCols`.
- If `items.length < rows*cols`, remaining cells are reserved geometrically and render nothing.
- Items are placed row-major into the first N cells.
- No compaction or reflow.

### Template Variants (Allowlist)

Variant overrides can only change:

- `paddingToken`
- `gapToken`
- `styleSlots` (slot names only)
- placeholder `region` rect overrides

Variants cannot add/remove placeholders or layers. Violations hard-fail (`template_variant_override_forbidden`).

## EMU Quantization (No Silent Snapping)

Canonical quantization step:

- `EMU_STEP = 10`

All template placeholder rects and inset content rects must align to `EMU_STEP`. Non-quantized values hard-fail (`template_rect_not_quantized`). The compiler does not silently snap values.

Use the formatter to quantize template files:

```
npm run templates:format
```

## Placeholder Anchors (Template-Only)

Templates can target placeholder anchors with:

```
{ "target": "placeholderId", "anchor": "top|bottom|left|right|center" }
```

These compile to region anchors (no element-level anchors).

## IR Validation Gate

Template compilation produces a concrete IR (regions + elements with resolved styles). The IR must validate before PPTX writing begins. Invalid IR produces no PPTX output.

## Stress Smoke (Geometry Invariance)

`smoke:themes-stress` renders multiple templates under light/dark themes and compares region rects by stable id. Shrink-to-fit must be disabled for this smoke so geometry is invariant across theme swaps.
