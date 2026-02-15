# Theme v2

Theme v2 is a **pure style layer**. It does not change layout or grid semantics.
Unknown tokens hard-fail (`unknown_style_token`). Invalid values hard-fail (`style_token_invalid`).

## Token catalog

### Colors (existing)
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
- `chart.palette` (array)

### Font scale
Per-style typography tokens:
- `font_scale.title.family` / `font_scale.title.size` / `font_scale.title.weight`
- `font_scale.subtitle.family` / `font_scale.subtitle.size` / `font_scale.subtitle.weight`
- `font_scale.body.family` / `font_scale.body.size` / `font_scale.body.weight`
- `font_scale.caption.family` / `font_scale.caption.size` / `font_scale.caption.weight`

### Space scale
Numeric spacing scale in points:
- `space_scale.0` .. `space_scale.5`

### Stroke scale
Stroke widths in points:
- `stroke_scale.thin`
- `stroke_scale.normal`
- `stroke_scale.heavy`

### Contrast policy (configurable, bounded)
- `contrast.min_ratio_body`
- `contrast.min_ratio_title`
- `contrast.min_ratio_ui`
- `contrast.max_ratio`

Table contrast is validated at theme load:
- `color.table_header_text` vs `color.table_header_fill`
- `color.table_body_text` vs `color.table_body_fill`

### Legacy tokens (kept for compatibility)
- `type.font_family_primary`
- `type.font_family_secondary`
- `type.body_size`
- `type.small_size`
- `type.weight_medium`
- `type.weight_bold`
- `shape.border_width_default`

## Mapping rules (template-owned)
- Text defaults use `font_scale.*` by region label (title/subtitle/body/caption).
- Default text padding uses `space_scale.1`.
- Table cell padding uses `space_scale.2`.
- Callout padding uses `space_scale.3`.
- Connector and leader strokes use `stroke_scale.normal`.
- Surface borders use `stroke_scale.thin`.

## Canonical theme paths
SlotMap references use canonical paths:
- `theme.font_scale.<name>`
- `theme.surfaces.<name>`
- `theme.stroke_scale.<name>`

## Example
```json
{
  "theme": "consulting_light_v1",
  "styleTokens": {
    "font_scale.body.size": 15,
    "space_scale.3": 8,
    "stroke_scale.normal": 1.25,
    "color.surface_accent": "#DCE7FF"
  }
}
```
