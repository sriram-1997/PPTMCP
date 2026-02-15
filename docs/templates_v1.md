# Templates v1

Templates v1 provide a deterministic authoring layer that compiles into the existing region/grid slide schema. Templates define layout (grid + placeholder regions) and default style slot references; fills provide content. The compiler emits a standard slide spec with `grid`, `regions`, and `elements` so all existing rendering behavior stays unchanged.

## Design Goals

- Deterministic compile-to-regions output.
- No absolute x/y in slide specs.
- Theme supplies concrete values (Theme v2 tokens); templates only reference slots.
- Strict validation; unsupported inputs hard-fail.

## Template Definition Schema

Template files live under `src/templates/config/*.json` and are loaded by `template` id.

```json
{
  "id": "title_slide",
  "title": "Title Slide",
  "extends": "base_standard",
  "grid": { "cols": 12, "rows": 8, "gutter": 0.0501312336 },
  "layers": [
    { "id": "content", "z": 100 },
    { "id": "foreground", "z": 200 }
  ],
  "defaultSlots": { "text": "text.body", "padding": 2, "stroke": "stroke.normal" },
  "policies": { "requireAllPlaceholders": true },
  "placeholders": [
    {
      "id": "title",
      "kind": "text",
      "region": { "col": 0, "row": 2, "colSpan": 12, "rowSpan": 2 },
      "layer": "content",
      "styleSlots": { "text": "text.title", "padding": 2 }
    }
  ]
}
```

### Placeholder Fields

- `id` (string): placeholder identifier and compiled region name.
- `kind`: `text | table | chart | callout | connector | image | icon`.
- `region`: `{ col, row, colSpan, rowSpan }` (grid-based).
- `layer` (optional): references a layer id to compute base z.
- `z` (optional): integer offset added to layer z.
- `variant` (optional): `surface | elevated | accent`.
- `styleSlots` (optional):
  - `text`: `text.title | text.subtitle | text.body | text.caption` (maps to `theme.font_scale.*`).
  - `padding`: `0..5` (maps to `space_scale.*`).
  - `stroke`: `stroke.thin | stroke.normal | stroke.heavy` (maps to `theme.stroke_scale.*`).
- `anchor` (callout only): `{ target, point?, anchor?, dxPt?, dyPt? }` (anchor = top|bottom|left|right|center).
- `box` (callout only): `{ wIn, hIn, placement, paddingSlot? }`.
- `start` / `end` (connector only): `{ target, point, dxPt?, dyPt? }`.
- `leader` (callout only): `{ startArrow?, endArrow? }`.
- `connectorStyle` (connector only): `{ startArrow?, endArrow? }`.
- `allowedKinds` / `minItems` / `maxItems` (optional): content constraints for fills.
- `layoutMode` (optional): `single | vstack | hstack | grid`.
- `gapToken` (required for vstack/hstack/grid): `0..5`.
- `gridRows` / `gridCols` (required for grid).

## Slide Usage (Fill Model)

Slides can reference a template by id or embed a template inline. Variants are selected via:

```json
{
  "template": { "name": "matrix_3x3", "variant": "compact" }
}
```

```json
{
  "id": "slide-1",
  "title": "Template Slide",
  "template": "title_slide",
  "fills": {
    "title": { "content": "Templates v1" },
    "subtitle": { "content": "Deterministic layout" }
  }
}
```

### Fill Rules

- `fills` keys must match placeholder ids.
- Fills provide content only; geometry stays in the template.
- Fills can override slot names (`textStyleSlot`, `paddingSlot`, `strokeSlot`) and `variant`.
- Multi-item fills use `items[]` with element-style schemas (text uses `text`, not `content`).
- Raw numeric styles are not allowed in fills.

### Allowed Fill Fields (by kind)

- `text`: `content`, `textStyleSlot`, `paddingSlot`, `variant`.
- `table`: `content`, `paddingSlot`, `variant`.
- `chart`: `content`, `variant`.
- `image`: `src`, `fit`, `opacity?`, `crop?`, `overlaySurfaceSlot?`, `overlayOpacity?`, `borderRadiusPt?`, `variant`.
- `icon`: `name`, `sizeToken`, `colorSlot`, `align?`, `verticalAlign?`.
- `callout`: `text`, `textStyleSlot`, `paddingSlot`, `variant`, `leader`.
- `connector`: `strokeSlot`, `startArrow`, `endArrow`, `variant`.

### Multi-item fill schema (layoutMode != single)
- `text`: `{ "kind": "text", "text": "...", "textStyleSlot": "text.body" }`
- `list`: `{ "kind": "list", "items": ["a","b"] }`
- `image`: `{ "kind": "image", "src": "...", "fit": "contain|cover" }`
- `table`: `{ "kind": "table", "headers": [...], "rows": [...] }`
- `chart`: `{ "kind": "chart", "chartType": "column", "dataSeries": [...] }`
- `callout`: `{ "kind": "callout", "text": "...", "leader": { "endArrow": "triangle" } }`
- `icon`: `{ "kind": "icon", "name": "growth", "sizeToken": 2, "colorSlot": "text.body" }`

## Card Templates (v0)

## Compile-to-Regions Rules

- Each placeholder becomes a region with the same id.
- Elements are emitted using the placeholder kind and region id.
- Slots are resolved using Theme v2 tokens:
  - `textStyleSlot` ? font size + bold based on `font_scale.*`.
  - `paddingSlot` ? padding in points from `space_scale.*`.
  - `strokeSlot` ? width in points from `stroke_scale.*`.
- Element-level style overrides remain supported in the compiled output (no runtime cascade).

## Template Inheritance

- Single inheritance via `extends`.
- Placeholders merge by id (child overrides fields); new placeholders append.
- Layers merge by id (child overrides).
- `defaultSlots` and `policies` merge (child overrides).
- Cycles hard-fail (`template_cycle_detected`).

## Validation Rules (Hard-Fail)

- Missing/invalid placeholders or regions.
- Unknown placeholder kinds.
- Unknown fill keys or placeholder ids.
- Invalid slot names or padding indices.
- Template cycles or missing template ids.
- Unsupported anchor targets or placement values.

## Limitations

- No absolute positioning in templates or fills.
- No multi-level inheritance or CSS-like cascading.
- Template slots reference only Theme v2 scales (font/space/stroke).
- Anchors remain region-only (no element/chart/table cell anchors).
