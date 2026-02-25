import type { ConcreteTheme } from "../theme/types.js";
import type {
  SlideProgramSpec,
  Slide,
  Element,
  TextElement,
  TableElement,
  ChartElement,
  ChevronFlowElement,
  CardElement,
  CalloutElement,
  ConnectorElement,
  ImageElement,
  IconElement,
} from "../render/types.js";
import { loadTemplateDefinition } from "./loader.js";
import { SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES, ptToIn, inchesToEmu, EMU_STEP } from "../render/utils/units.js";
import type {
  TemplateDefinition,
  TemplatePlaceholder,
  TemplateAnchor,
  TemplateVariant,
  TemplateKind,
  TemplateLayer,
  TemplateStyleSlots,
  TextStyleSlot,
  StrokeSlot,
} from "./types.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value);
}

function isVariant(value: unknown): value is TemplateVariant {
  return value === "surface" || value === "elevated" || value === "accent";
}

const TEXT_SLOT_MAP: Record<string, keyof ConcreteTheme["fontScale"]> = {
  "text.title": "title",
  "text.subtitle": "subtitle",
  "text.body": "body",
  "text.caption": "caption",
};
const STROKE_SLOT_MAP: Record<string, keyof ConcreteTheme["strokeScale"]> = {
  "stroke.thin": "thin",
  "stroke.normal": "normal",
  "stroke.heavy": "heavy",
};
const TEXT_SLOTS = new Set(Object.keys(TEXT_SLOT_MAP));
const STROKE_SLOTS = new Set(Object.keys(STROKE_SLOT_MAP));
const ITEM_KINDS = new Set(["text", "list", "image", "table", "chart", "card", "callout", "icon"]);
const LAYOUT_MODES = new Set(["single", "vstack", "hstack", "grid"]);
const ANCHOR_EDGES = new Set(["top", "bottom", "left", "right", "center"]);
const PLACEHOLDER_KINDS = new Set([
  "text",
  "list",
  "table",
  "chart",
  "chevron_flow",
  "card",
  "callout",
  "connector",
  "image",
  "icon",
]);
const ANCHOR_POINTS = new Set(["n", "ne", "e", "se", "s", "sw", "w", "nw", "center"]);
const PLACEMENTS = new Set(["auto", "ne", "nw", "se", "sw", "n", "s", "e", "w"]);
const OVERLAY_SURFACE_SLOTS = new Set([
  "surface.background",
  "surface.surface",
  "surface.elevated",
  "surface.accent",
]);

function isTextSlot(value: unknown): value is TextStyleSlot {
  return typeof value === "string" && TEXT_SLOTS.has(value);
}

function isStrokeSlot(value: unknown): value is StrokeSlot {
  return typeof value === "string" && STROKE_SLOTS.has(value);
}

function validateTemplateAnchor(anchor: TemplateAnchor, prefix: string, errors: string[]): void {
  if (typeof anchor.target !== "string" || anchor.target.trim().length === 0) {
    errors.push(`${prefix} template_anchor_target_invalid`);
  }
  if (typeof anchor.point !== "undefined") {
    if (!ANCHOR_POINTS.has(anchor.point)) {
      errors.push(`${prefix} template_anchor_point_invalid`);
    }
  } else if (typeof anchor.anchor !== "undefined") {
    if (!ANCHOR_EDGES.has(anchor.anchor)) {
      errors.push(`${prefix} template_anchor_point_invalid`);
    }
  } else {
    errors.push(`${prefix} template_anchor_point_invalid`);
  }
  if (typeof anchor.dxPt !== "undefined" && typeof anchor.dxPt !== "number") {
    errors.push(`${prefix} template_anchor_dx_invalid`);
  }
  if (typeof anchor.dyPt !== "undefined" && typeof anchor.dyPt !== "number") {
    errors.push(`${prefix} template_anchor_dy_invalid`);
  }
}

function validateTemplatePlaceholder(
  placeholder: TemplatePlaceholder,
  prefix: string,
  errors: string[]
): void {
  if (typeof placeholder.id !== "string" || placeholder.id.trim().length === 0) {
    errors.push(`${prefix} template_placeholder_id_invalid`);
  }
  if (!PLACEHOLDER_KINDS.has(placeholder.kind)) {
    errors.push(`${prefix} template_placeholder_kind_invalid`);
  }
  if (!placeholder.region || typeof placeholder.region !== "object") {
    errors.push(`${prefix} template_placeholder_region_invalid`);
  } else {
    const region = placeholder.region;
    if (typeof region.col !== "number" || region.col < 0) {
      errors.push(`${prefix} template_placeholder_region_invalid`);
    }
    if (typeof region.row !== "number" || region.row < 0) {
      errors.push(`${prefix} template_placeholder_region_invalid`);
    }
    if (typeof region.colSpan !== "number" || region.colSpan <= 0) {
      errors.push(`${prefix} template_placeholder_region_invalid`);
    }
    if (typeof region.rowSpan !== "number" || region.rowSpan <= 0) {
      errors.push(`${prefix} template_placeholder_region_invalid`);
    }
  }
  if (typeof placeholder.layer !== "undefined" && typeof placeholder.layer !== "string") {
    errors.push(`${prefix} template_placeholder_layer_invalid`);
  }
  if (typeof placeholder.z !== "undefined" && !isInteger(placeholder.z)) {
    errors.push(`${prefix} template_placeholder_z_invalid`);
  }
  if (typeof placeholder.variant !== "undefined" && !isVariant(placeholder.variant)) {
    errors.push(`${prefix} template_placeholder_variant_invalid`);
  }
  if (typeof placeholder.layoutMode !== "undefined" && !LAYOUT_MODES.has(placeholder.layoutMode)) {
    errors.push(`${prefix} template_layout_mode_invalid`);
  }
  if (typeof placeholder.gapToken !== "undefined") {
    if (!Number.isInteger(placeholder.gapToken) || placeholder.gapToken < 0 || placeholder.gapToken > 5) {
      errors.push(`${prefix} template_layout_gap_missing`);
    }
  }
  if (placeholder.layoutMode && placeholder.layoutMode !== "single" && typeof placeholder.gapToken === "undefined") {
    errors.push(`${prefix} template_layout_gap_missing`);
  }
  if (placeholder.layoutMode === "grid") {
    if (typeof placeholder.gridRows !== "number" || !Number.isInteger(placeholder.gridRows) || placeholder.gridRows <= 0) {
      errors.push(`${prefix} template_layout_grid_invalid`);
    }
    if (typeof placeholder.gridCols !== "number" || !Number.isInteger(placeholder.gridCols) || placeholder.gridCols <= 0) {
      errors.push(`${prefix} template_layout_grid_invalid`);
    }
  }
  if (typeof placeholder.allowedKinds !== "undefined") {
    if (!Array.isArray(placeholder.allowedKinds) || placeholder.allowedKinds.length === 0) {
      errors.push(`${prefix} template_items_invalid`);
    } else {
      for (const kind of placeholder.allowedKinds) {
        if (!PLACEHOLDER_KINDS.has(kind)) {
          errors.push(`${prefix} template_item_kind_invalid`);
        }
      }
      if (!placeholder.allowedKinds.includes(placeholder.kind)) {
        errors.push(`${prefix} template_item_kind_invalid`);
      }
    }
  }
  if (typeof placeholder.minItems !== "undefined") {
    if (!Number.isInteger(placeholder.minItems) || placeholder.minItems < 0) {
      errors.push(`${prefix} template_items_count_invalid`);
    }
  }
  if (typeof placeholder.maxItems !== "undefined") {
    if (!Number.isInteger(placeholder.maxItems) || placeholder.maxItems < 0) {
      errors.push(`${prefix} template_items_count_invalid`);
    }
  }
  if (
    typeof placeholder.minItems !== "undefined" &&
    typeof placeholder.maxItems !== "undefined" &&
    placeholder.minItems > placeholder.maxItems
  ) {
    errors.push(`${prefix} template_items_count_invalid`);
  }
  if (placeholder.styleSlots) {
    if (typeof placeholder.styleSlots !== "object") {
      errors.push(`${prefix} template_placeholder_style_slots_invalid`);
    } else {
      const slots = placeholder.styleSlots as TemplateStyleSlots;
      if (typeof slots.text !== "undefined" && !isTextSlot(slots.text)) {
        errors.push(`${prefix} template_placeholder_text_slot_invalid`);
      }
      if (typeof slots.stroke !== "undefined" && !isStrokeSlot(slots.stroke)) {
        errors.push(`${prefix} template_placeholder_stroke_slot_invalid`);
      }
      if (typeof slots.padding !== "undefined" && (!Number.isInteger(slots.padding) || slots.padding < 0)) {
        errors.push(`${prefix} template_placeholder_padding_slot_invalid`);
      }
    }
  }
  if (placeholder.kind === "callout") {
    if (!placeholder.anchor) {
      errors.push(`${prefix} template_callout_anchor_missing`);
    } else {
      validateTemplateAnchor(placeholder.anchor, prefix, errors);
    }
    if (!placeholder.box) {
      errors.push(`${prefix} template_callout_box_missing`);
    } else {
      const box = placeholder.box;
      if (typeof box.wIn !== "number" || typeof box.hIn !== "number") {
        errors.push(`${prefix} template_callout_box_invalid`);
      }
      if (!PLACEMENTS.has(box.placement)) {
        errors.push(`${prefix} template_callout_box_invalid`);
      }
      if (typeof box.paddingSlot !== "undefined" && (!Number.isInteger(box.paddingSlot) || box.paddingSlot < 0)) {
        errors.push(`${prefix} template_callout_box_padding_invalid`);
      }
    }
  }
  if (placeholder.kind === "connector") {
    if (!placeholder.start || !placeholder.end) {
      errors.push(`${prefix} template_connector_anchor_missing`);
    } else {
      validateTemplateAnchor(placeholder.start, prefix, errors);
      validateTemplateAnchor(placeholder.end, prefix, errors);
    }
    if (placeholder.connectorStyle) {
      const style = placeholder.connectorStyle;
      if (typeof style.startArrow !== "undefined" && !["none", "triangle"].includes(String(style.startArrow))) {
        errors.push(`${prefix} template_connector_arrow_invalid`);
      }
      if (typeof style.endArrow !== "undefined" && !["none", "triangle"].includes(String(style.endArrow))) {
        errors.push(`${prefix} template_connector_arrow_invalid`);
      }
    }
  }
  if (placeholder.kind === "callout" && placeholder.leader) {
    const leader = placeholder.leader;
    if (typeof leader.startArrow !== "undefined" && !["none", "triangle"].includes(String(leader.startArrow))) {
      errors.push(`${prefix} template_callout_arrow_invalid`);
    }
    if (typeof leader.endArrow !== "undefined" && !["none", "triangle"].includes(String(leader.endArrow))) {
      errors.push(`${prefix} template_callout_arrow_invalid`);
    }
  }
}

function validateTemplateDefinition(template: TemplateDefinition, strict: boolean, errors: string[], context: string): void {
  const prefix = `Template ${context}:`;
  if (typeof template.id !== "string" || template.id.trim().length === 0) {
    errors.push(`${prefix} template_id_invalid`);
  }
  if (typeof template.title !== "undefined" && typeof template.title !== "string") {
    errors.push(`${prefix} template_title_invalid`);
  }
  if (typeof template.extends !== "undefined" && typeof template.extends !== "string") {
    errors.push(`${prefix} template_extends_invalid`);
  }
  if (template.grid) {
    const grid = template.grid;
    if (typeof grid.cols !== "number" || grid.cols <= 0) {
      errors.push(`${prefix} template_grid_invalid`);
    }
    if (typeof grid.rows !== "number" || grid.rows <= 0) {
      errors.push(`${prefix} template_grid_invalid`);
    }
    if (typeof grid.gutter !== "number" || grid.gutter < 0) {
      errors.push(`${prefix} template_grid_invalid`);
    }
  }
  if (!Array.isArray(template.placeholders)) {
    errors.push(`${prefix} template_placeholders_invalid`);
  } else {
    template.placeholders.forEach((placeholder, idx) => {
      validateTemplatePlaceholder(placeholder, `${prefix} Placeholder ${idx + 1}:`, errors);
    });
  }
  if (template.layers) {
    if (!Array.isArray(template.layers)) {
      errors.push(`${prefix} template_layers_invalid`);
    } else {
      template.layers.forEach((layer: TemplateLayer) => {
        if (typeof layer.id !== "string" || layer.id.trim().length === 0 || !isInteger(layer.z)) {
          errors.push(`${prefix} template_layers_invalid`);
        }
      });
    }
  }
  if (template.defaultSlots) {
    const slots = template.defaultSlots;
    if (typeof slots !== "object") {
      errors.push(`${prefix} template_default_slots_invalid`);
    } else {
      if (typeof slots.text !== "undefined" && !isTextSlot(slots.text)) {
        errors.push(`${prefix} template_default_text_slot_invalid`);
      }
      if (typeof slots.stroke !== "undefined" && !isStrokeSlot(slots.stroke)) {
        errors.push(`${prefix} template_default_stroke_slot_invalid`);
      }
      if (typeof slots.padding !== "undefined" && (!Number.isInteger(slots.padding) || slots.padding < 0)) {
        errors.push(`${prefix} template_default_padding_slot_invalid`);
      }
    }
  }
  if (template.policies) {
    const policies = template.policies;
    if (typeof policies !== "object") {
      errors.push(`${prefix} template_policies_invalid`);
    } else if (typeof policies.requireAllPlaceholders !== "undefined" && typeof policies.requireAllPlaceholders !== "boolean") {
      errors.push(`${prefix} template_policies_invalid`);
    }
  }
  if (template.variants) {
    if (!isPlainObject(template.variants)) {
      errors.push(`${prefix} template_variant_invalid`);
    } else {
      for (const [variantName, variantDef] of Object.entries(template.variants)) {
        if (!variantName || typeof variantName !== "string") {
          errors.push(`${prefix} template_variant_invalid`);
          continue;
        }
        if (!isPlainObject(variantDef)) {
          errors.push(`${prefix} template_variant_invalid`);
          continue;
        }
        const allowedVariantFields = new Set(["placeholders"]);
        if (strict) {
          for (const key of Object.keys(variantDef)) {
            if (!allowedVariantFields.has(key)) {
              errors.push(`${prefix} template_variant_override_forbidden`);
            }
          }
        }
        if ("placeholders" in variantDef) {
          const placeholders = (variantDef as { placeholders?: unknown }).placeholders;
          if (!Array.isArray(placeholders)) {
            errors.push(`${prefix} template_variant_invalid`);
          } else {
            placeholders.forEach((entry) => {
              if (!isPlainObject(entry)) {
                errors.push(`${prefix} template_variant_invalid`);
                return;
              }
              const allowedFields = new Set(["id", "paddingToken", "gapToken", "styleSlots", "region"]);
              if (strict) {
                for (const key of Object.keys(entry)) {
                  if (!allowedFields.has(key)) {
                    errors.push(`${prefix} template_variant_override_forbidden`);
                  }
                }
              }
            });
          }
        }
      }
    }
  }

  if (strict) {
    const allowedTemplateFields = new Set([
      "id",
      "title",
      "extends",
      "grid",
      "placeholders",
      "layers",
      "defaultSlots",
      "policies",
      "variants",
    ]);
    for (const key of Object.keys(template)) {
      if (!allowedTemplateFields.has(key)) {
        errors.push(`${prefix} template_unknown_field '${key}'`);
      }
    }

    template.placeholders?.forEach((placeholder) => {
      const allowedPlaceholderFields = new Set([
        "id",
        "kind",
        "region",
        "layer",
        "z",
        "variant",
        "styleSlots",
        "policies",
        "allowedKinds",
        "minItems",
        "maxItems",
        "layoutMode",
        "gapToken",
        "gridRows",
        "gridCols",
        "anchor",
        "box",
        "start",
        "end",
        "leader",
        "connectorStyle",
      ]);
      for (const key of Object.keys(placeholder)) {
        if (!allowedPlaceholderFields.has(key)) {
          errors.push(`${prefix} template_placeholder_unknown_field '${key}'`);
        }
      }
    });
  }
}

function mergePlaceholders(base: TemplatePlaceholder[], child: TemplatePlaceholder[]): TemplatePlaceholder[] {
  const result: TemplatePlaceholder[] = base.map((placeholder) => ({ ...placeholder }));
  const index = new Map<string, number>();
  result.forEach((placeholder, idx) => index.set(placeholder.id, idx));

  for (const placeholder of child) {
    const existingIndex = index.get(placeholder.id);
    if (existingIndex === undefined) {
      result.push({ ...placeholder });
      index.set(placeholder.id, result.length - 1);
      continue;
    }
    const basePlaceholder = result[existingIndex];
    result[existingIndex] = {
      ...basePlaceholder,
      ...placeholder,
      region: placeholder.region ?? basePlaceholder.region,
      styleSlots: { ...basePlaceholder.styleSlots, ...placeholder.styleSlots },
      policies: { ...basePlaceholder.policies, ...placeholder.policies },
      anchor: placeholder.anchor ?? basePlaceholder.anchor,
      box: placeholder.box ?? basePlaceholder.box,
      start: placeholder.start ?? basePlaceholder.start,
      end: placeholder.end ?? basePlaceholder.end,
      leader:
        basePlaceholder.leader || placeholder.leader
          ? { ...basePlaceholder.leader, ...placeholder.leader }
          : undefined,
      connectorStyle:
        basePlaceholder.connectorStyle || placeholder.connectorStyle
          ? { ...basePlaceholder.connectorStyle, ...placeholder.connectorStyle }
          : undefined,
    };
  }
  return result;
}

function mergeLayers(base: TemplateLayer[] | undefined, child: TemplateLayer[] | undefined): TemplateLayer[] | undefined {
  if (!base && !child) {
    return undefined;
  }
  const result: TemplateLayer[] = [];
  const index = new Map<string, number>();
  (base ?? []).forEach((layer) => {
    result.push({ ...layer });
    index.set(layer.id, result.length - 1);
  });
  (child ?? []).forEach((layer) => {
    const existingIndex = index.get(layer.id);
    if (existingIndex === undefined) {
      result.push({ ...layer });
      index.set(layer.id, result.length - 1);
    } else {
      result[existingIndex] = { ...layer };
    }
  });
  return result;
}

function mergeTemplates(base: TemplateDefinition, child: TemplateDefinition): TemplateDefinition {
  return {
    id: child.id,
    title: child.title ?? base.title,
    extends: child.extends,
    grid: child.grid ?? base.grid,
    placeholders: mergePlaceholders(base.placeholders, child.placeholders),
    layers: mergeLayers(base.layers, child.layers),
    defaultSlots: { ...base.defaultSlots, ...child.defaultSlots },
    policies: { ...base.policies, ...child.policies },
    variants: { ...base.variants, ...child.variants },
  };
}

function resolveTemplate(templateRef: unknown, strict: boolean, errors: string[]): TemplateDefinition | null {
  if (typeof templateRef === "string") {
    return resolveTemplateById(templateRef, strict, errors, []);
  }
  if (!isPlainObject(templateRef)) {
    errors.push("template_reference_invalid");
    return null;
  }
  const inline = templateRef as unknown as TemplateDefinition;
  const inlineErrors: string[] = [];
  validateTemplateDefinition(inline, strict, inlineErrors, inline.id || "inline");
  if (inlineErrors.length > 0) {
    errors.push(...inlineErrors);
    return null;
  }
  if (inline.extends) {
    const base = resolveTemplateById(inline.extends, strict, errors, []);
    if (!base) {
      return null;
    }
    return mergeTemplates(base, inline);
  }
  return inline;
}

function resolveTemplateById(
  templateId: string,
  strict: boolean,
  errors: string[],
  stack: string[]
): TemplateDefinition | null {
  if (stack.includes(templateId)) {
    errors.push(`template_cycle_detected (${templateId})`);
    return null;
  }
  let raw: TemplateDefinition;
  try {
    raw = loadTemplateDefinition(templateId);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return null;
  }

  const validationErrors: string[] = [];
  validateTemplateDefinition(raw, strict, validationErrors, templateId);
  if (validationErrors.length > 0) {
    errors.push(...validationErrors);
    return null;
  }

  if (raw.extends) {
    const nextStack = [...stack, templateId];
    const base = resolveTemplateById(raw.extends, strict, errors, nextStack);
    if (!base) {
      return null;
    }
    return mergeTemplates(base, raw);
  }
  return raw;
}

function applyVariant(
  template: TemplateDefinition,
  variantName: string | undefined,
  strict: boolean,
  errors: string[],
  context: string
): TemplateDefinition | null {
  if (!variantName) {
    return template;
  }
  const prefix = `Template ${context}:`;
  if (!template.variants || !template.variants[variantName]) {
    errors.push(`${prefix} template_variant_not_found (${variantName})`);
    return null;
  }
  const variantDef = template.variants[variantName];
  if (!isPlainObject(variantDef)) {
    errors.push(`${prefix} template_variant_invalid`);
    return null;
  }
  const allowedVariantFields = new Set(["placeholders"]);
  if (strict) {
    for (const key of Object.keys(variantDef)) {
      if (!allowedVariantFields.has(key)) {
        errors.push(`${prefix} template_variant_override_forbidden`);
      }
    }
  }
  const placeholderOverrides = (variantDef as { placeholders?: unknown }).placeholders;
  if (typeof placeholderOverrides === "undefined") {
    return template;
  }
  if (!Array.isArray(placeholderOverrides)) {
    errors.push(`${prefix} template_variant_invalid`);
    return null;
  }

  const updatedPlaceholders = template.placeholders.map((placeholder) => ({
    ...placeholder,
    styleSlots: { ...placeholder.styleSlots },
  }));
  const index = new Map(updatedPlaceholders.map((placeholder, idx) => [placeholder.id, idx]));

  for (const override of placeholderOverrides) {
    if (!isPlainObject(override)) {
      errors.push(`${prefix} template_variant_invalid`);
      continue;
    }
    const overrideObj = override as Record<string, unknown>;
    const id = overrideObj.id;
    if (typeof id !== "string" || id.trim().length === 0) {
      errors.push(`${prefix} template_variant_invalid`);
      continue;
    }
    const idx = index.get(id);
    if (typeof idx === "undefined") {
      errors.push(`${prefix} template_variant_override_forbidden`);
      continue;
    }
    const allowedOverrideFields = new Set(["id", "paddingToken", "gapToken", "styleSlots", "region"]);
    if (strict) {
      for (const key of Object.keys(overrideObj)) {
        if (!allowedOverrideFields.has(key)) {
          errors.push(`${prefix} template_variant_override_forbidden`);
        }
      }
    }
    const target = updatedPlaceholders[idx];
    if (typeof overrideObj.paddingToken !== "undefined") {
      if (!Number.isInteger(overrideObj.paddingToken) || (overrideObj.paddingToken as number) < 0 || (overrideObj.paddingToken as number) > 5) {
        errors.push(`${prefix} template_variant_invalid`);
      } else {
        target.styleSlots = { ...target.styleSlots, padding: overrideObj.paddingToken as number };
      }
    }
    if (typeof overrideObj.gapToken !== "undefined") {
      if (!Number.isInteger(overrideObj.gapToken) || (overrideObj.gapToken as number) < 0 || (overrideObj.gapToken as number) > 5) {
        errors.push(`${prefix} template_variant_invalid`);
      } else {
        target.gapToken = overrideObj.gapToken as number;
      }
    }
    if (typeof overrideObj.styleSlots !== "undefined") {
      if (!isPlainObject(overrideObj.styleSlots)) {
        errors.push(`${prefix} template_variant_invalid`);
      } else {
        const slots = overrideObj.styleSlots as TemplateStyleSlots;
        if (typeof slots.text !== "undefined" && !isTextSlot(slots.text)) {
          errors.push(`${prefix} template_variant_invalid`);
        }
        if (typeof slots.stroke !== "undefined" && !isStrokeSlot(slots.stroke)) {
          errors.push(`${prefix} template_variant_invalid`);
        }
        if (typeof slots.padding !== "undefined" && (!Number.isInteger(slots.padding) || slots.padding < 0)) {
          errors.push(`${prefix} template_variant_invalid`);
        }
        target.styleSlots = { ...target.styleSlots, ...slots };
      }
    }
    if (typeof overrideObj.region !== "undefined") {
      if (!isPlainObject(overrideObj.region)) {
        errors.push(`${prefix} template_variant_invalid`);
      } else {
        const region = overrideObj.region as Record<string, unknown>;
        if (
          typeof region.col !== "number" ||
          typeof region.row !== "number" ||
          typeof region.colSpan !== "number" ||
          typeof region.rowSpan !== "number" ||
          region.col < 0 ||
          region.row < 0 ||
          region.colSpan <= 0 ||
          region.rowSpan <= 0
        ) {
          errors.push(`${prefix} template_variant_invalid`);
        } else {
          target.region = {
            col: region.col,
            row: region.row,
            colSpan: region.colSpan,
            rowSpan: region.rowSpan,
          };
        }
      }
    }
  }

  return {
    ...template,
    placeholders: updatedPlaceholders,
  };
}

function resolveSlot<T>(
  overrideValue: T | undefined,
  placeholderValue: T | undefined,
  defaultValue: T | undefined
): T | undefined {
  if (typeof overrideValue !== "undefined") {
    return overrideValue;
  }
  if (typeof placeholderValue !== "undefined") {
    return placeholderValue;
  }
  return defaultValue;
}

function resolveVariantValue(
  fill: Record<string, unknown> | undefined,
  placeholderVariant: TemplateVariant | undefined,
  prefix: string,
  errors: string[]
): TemplateVariant | undefined {
  if (!fill || typeof fill.variant === "undefined") {
    return placeholderVariant;
  }
  if (!isVariant(fill.variant)) {
    errors.push(`${prefix} template_variant_invalid`);
    return placeholderVariant;
  }
  return fill.variant;
}

type OverlaySurfaceSlot = ImageElement["overlaySurfaceSlot"];

function resolveOverlaySurfaceSlot(
  value: unknown,
  prefix: string,
  errorCode: string,
  errors: string[]
): OverlaySurfaceSlot {
  if (typeof value === "undefined") {
    return undefined;
  }
  if (typeof value === "string" && OVERLAY_SURFACE_SLOTS.has(value)) {
    return value as OverlaySurfaceSlot;
  }
  errors.push(`${prefix} ${errorCode}`);
  return undefined;
}

function resolvePaddingSlot(
  slot: unknown,
  prefix: string,
  errors: string[]
): number | undefined {
  if (typeof slot === "undefined") {
    return undefined;
  }
  if (typeof slot !== "number" || !Number.isInteger(slot) || slot < 0 || slot > 5) {
    errors.push(`${prefix} template_padding_slot_invalid`);
    return undefined;
  }
  return slot as number;
}

function resolvePaddingInches(
  slot: number | undefined,
  theme: ConcreteTheme,
  prefix: string,
  errors: string[]
): number | undefined {
  if (typeof slot === "undefined") {
    return undefined;
  }
  const padPt = theme.spaceScale[slot];
  if (typeof padPt !== "number" || !Number.isFinite(padPt)) {
    errors.push(`${prefix} template_padding_token_missing`);
    return undefined;
  }
  return ptToIn(padPt);
}

const EMU_EPSILON = 1e-3;

function resolveGapInches(
  slot: number | undefined,
  theme: ConcreteTheme,
  prefix: string,
  errors: string[]
): number | undefined {
  if (typeof slot === "undefined") {
    return undefined;
  }
  const gapPt = theme.spaceScale[slot];
  if (typeof gapPt !== "number" || !Number.isFinite(gapPt)) {
    errors.push(`${prefix} template_layout_gap_missing`);
    return undefined;
  }
  return ptToIn(gapPt);
}

function isEmuAligned(valueIn: number): boolean {
  const emu = inchesToEmu(valueIn);
  const rounded = Math.round(emu);
  if (Math.abs(emu - rounded) > EMU_EPSILON) {
    return false;
  }
  return rounded % EMU_STEP === 0;
}

function assertRectQuantized(
  rect: { x: number; y: number; width: number; height: number },
  prefix: string,
  errors: string[]
): void {
  if (
    !isEmuAligned(rect.x) ||
    !isEmuAligned(rect.y) ||
    !isEmuAligned(rect.width) ||
    !isEmuAligned(rect.height)
  ) {
    errors.push(`${prefix} template_rect_not_quantized`);
  }
}

function computeLayoutRects(args: {
  mode: "single" | "vstack" | "hstack" | "grid";
  rect: { x: number; y: number; width: number; height: number };
  count: number;
  gapIn: number;
  gridRows?: number;
  gridCols?: number;
  prefix: string;
  errors: string[];
}): Array<{ x: number; y: number; width: number; height: number }> {
  const { mode, rect, count, gapIn, gridRows, gridCols, prefix, errors } = args;
  if (count === 0) {
    return [];
  }
  if (mode === "single") {
    return [{ ...rect }];
  }
  if (mode === "vstack") {
    const totalGap = gapIn * (count - 1);
    const height = (rect.height - totalGap) / count;
    if (height <= 0) {
      errors.push(`${prefix} template_layout_grid_invalid`);
      return [];
    }
    return Array.from({ length: count }, (_, idx) => ({
      x: rect.x,
      y: rect.y + idx * (height + gapIn),
      width: rect.width,
      height,
    }));
  }
  if (mode === "hstack") {
    const totalGap = gapIn * (count - 1);
    const width = (rect.width - totalGap) / count;
    if (width <= 0) {
      errors.push(`${prefix} template_layout_grid_invalid`);
      return [];
    }
    return Array.from({ length: count }, (_, idx) => ({
      x: rect.x + idx * (width + gapIn),
      y: rect.y,
      width,
      height: rect.height,
    }));
  }
  if (!gridRows || !gridCols) {
    errors.push(`${prefix} template_layout_grid_invalid`);
    return [];
  }
  const totalGapX = gapIn * (gridCols - 1);
  const totalGapY = gapIn * (gridRows - 1);
  const cellWidth = (rect.width - totalGapX) / gridCols;
  const cellHeight = (rect.height - totalGapY) / gridRows;
  if (cellWidth <= 0 || cellHeight <= 0) {
    errors.push(`${prefix} template_layout_grid_invalid`);
    return [];
  }
  const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (let row = 0; row < gridRows; row += 1) {
    for (let col = 0; col < gridCols; col += 1) {
      rects.push({
        x: rect.x + col * (cellWidth + gapIn),
        y: rect.y + row * (cellHeight + gapIn),
        width: cellWidth,
        height: cellHeight,
      });
    }
  }
  return rects;
}

function gridMetrics(grid: { cols: number; rows: number; gutter: number }) {
  const cellWidth = (SLIDE_WIDTH_INCHES - (grid.cols - 1) * grid.gutter) / grid.cols;
  const cellHeight = (SLIDE_HEIGHT_INCHES - (grid.rows - 1) * grid.gutter) / grid.rows;
  return { cellWidth, cellHeight };
}

function regionToRectInches(
  grid: { cols: number; rows: number; gutter: number },
  region: { col: number; row: number; colSpan: number; rowSpan: number }
): { x: number; y: number; width: number; height: number } {
  const { cellWidth, cellHeight } = gridMetrics(grid);
  const stepX = cellWidth + grid.gutter;
  const stepY = cellHeight + grid.gutter;
  const x = region.col * stepX;
  const y = region.row * stepY;
  const width = region.colSpan * stepX - grid.gutter;
  const height = region.rowSpan * stepY - grid.gutter;
  return { x, y, width, height };
}

function rectToRegion(
  grid: { cols: number; rows: number; gutter: number },
  rect: { x: number; y: number; width: number; height: number }
): { col: number; row: number; colSpan: number; rowSpan: number } {
  const { cellWidth, cellHeight } = gridMetrics(grid);
  const stepX = cellWidth + grid.gutter;
  const stepY = cellHeight + grid.gutter;
  const col = rect.x / stepX;
  const row = rect.y / stepY;
  const colSpan = (rect.width + grid.gutter) / stepX;
  const rowSpan = (rect.height + grid.gutter) / stepY;
  return { col, row, colSpan, rowSpan };
}

function resolveStrokeSlot(
  slot: unknown,
  prefix: string,
  errors: string[]
): StrokeSlot | undefined {
  if (typeof slot === "undefined") {
    return undefined;
  }
  if (!isStrokeSlot(slot)) {
    errors.push(`${prefix} template_stroke_slot_invalid`);
    return undefined;
  }
  return slot;
}

function resolveTextSlot(
  slot: unknown,
  prefix: string,
  errors: string[]
): TextStyleSlot | undefined {
  if (typeof slot === "undefined") {
    return undefined;
  }
  if (!isTextSlot(slot)) {
    errors.push(`${prefix} template_text_slot_invalid`);
    return undefined;
  }
  return slot;
}

function textScaleForSlot(theme: ConcreteTheme, slot: TextStyleSlot) {
  return theme.fontScale[TEXT_SLOT_MAP[slot]];
}

function strokeWidthForSlot(theme: ConcreteTheme, slot: StrokeSlot) {
  return theme.strokeScale[STROKE_SLOT_MAP[slot]];
}

function resolveAnchorPoint(anchor: TemplateAnchor): string {
  if (anchor.point) {
    return anchor.point;
  }
  switch (anchor.anchor) {
    case "top":
      return "n";
    case "bottom":
      return "s";
    case "left":
      return "w";
    case "right":
      return "e";
    case "center":
      return "center";
    default:
      return "center";
  }
}

function toRegionAnchor(anchor: TemplateAnchor): { type: "region"; targetRegion: string; point: string; dxPt?: number; dyPt?: number } {
  return {
    type: "region",
    targetRegion: anchor.target,
    point: resolveAnchorPoint(anchor),
    dxPt: anchor.dxPt,
    dyPt: anchor.dyPt,
  };
}

function computeZ(placeholder: TemplatePlaceholder, layers: TemplateLayer[] | undefined, errors: string[], prefix: string): number | undefined {
  let base = 0;
  if (placeholder.layer) {
    const match = layers?.find((layer) => layer.id === placeholder.layer);
    if (!match) {
      errors.push(`${prefix} template_layer_not_found (${placeholder.layer})`);
    } else {
      base = match.z;
    }
  }
  if (typeof placeholder.z !== "undefined") {
    return base + placeholder.z;
  }
  return base || undefined;
}

function ensureFillObject(fill: unknown, prefix: string, errors: string[]): Record<string, unknown> | null {
  if (!isPlainObject(fill)) {
    errors.push(`${prefix} template_fill_invalid`);
    return null;
  }
  return fill as Record<string, unknown>;
}

function validateFillFields(
  fill: Record<string, unknown>,
  allowed: Set<string>,
  prefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (!strict) {
    return;
  }
  for (const key of Object.keys(fill)) {
    if (!allowed.has(key)) {
      errors.push(`${prefix} template_fill_unknown_field '${key}'`);
    }
  }
}

function validateItemFields(
  item: Record<string, unknown>,
  allowed: Set<string>,
  prefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (!strict) {
    return;
  }
  for (const key of Object.keys(item)) {
    if (!allowed.has(key)) {
      errors.push(`${prefix} template_item_field_invalid`);
    }
  }
}

function pushCardFillError(prefix: string, errors: string[], code = "template_card_fill_invalid"): void {
  errors.push(`${prefix} ${code}`);
}

function parseCardStyleSpec(
  style: Record<string, unknown>,
  prefix: string,
  errors: string[]
): CardElement["style"] | null {
  const parsed: CardElement["style"] = {};
  if (typeof style.bg !== "undefined") {
    if (!["background", "surface", "elevated", "accent"].includes(String(style.bg))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.bg = style.bg as any;
  }
  if (typeof style.border !== "undefined") {
    if (!["default", "subtle", "none"].includes(String(style.border))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.border = style.border as any;
  }
  if (typeof style.radius !== "undefined") {
    if (!["sm", "md", "lg"].includes(String(style.radius))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.radius = style.radius as any;
  }
  if (typeof style.padding !== "undefined") {
    if (!["sm", "md", "lg"].includes(String(style.padding))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.padding = style.padding as any;
  }
  if (typeof style.paddingSlot !== "undefined") {
    if (!Number.isInteger(style.paddingSlot) || (style.paddingSlot as number) < 0) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.paddingSlot = style.paddingSlot as number;
  }
  if (typeof style.paddingPt !== "undefined") {
    if (typeof style.paddingPt !== "number" || !Number.isFinite(style.paddingPt) || style.paddingPt < 0) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.paddingPt = style.paddingPt as number;
  }
  if (typeof style.shadow !== "undefined") {
    if (!["none", "sm"].includes(String(style.shadow))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    parsed.shadow = style.shadow as any;
  }
  if (typeof style.accent !== "undefined") {
    if (!isPlainObject(style.accent)) {
      pushCardFillError(prefix, errors);
      return null;
    }
    const accent = style.accent as Record<string, unknown>;
    if (typeof accent.edge !== "undefined" && !["left", "top", "none"].includes(String(accent.edge))) {
      pushCardFillError(prefix, errors);
      return null;
    }
    if (typeof accent.color !== "undefined" && accent.color !== "accent") {
      pushCardFillError(prefix, errors);
      return null;
    }
    if (typeof accent.width !== "undefined") {
      if (typeof accent.width !== "number" || !Number.isFinite(accent.width) || accent.width <= 0) {
        pushCardFillError(prefix, errors);
        return null;
      }
    }
    parsed.accent = {
      edge: typeof accent.edge === "string" ? (accent.edge as any) : "none",
      color: typeof accent.color === "string" ? (accent.color as any) : undefined,
      width: typeof accent.width === "number" ? (accent.width as number) : undefined,
    };
  }
  return parsed;
}

function parseCardHeader(
  header: Record<string, unknown>,
  prefix: string,
  errors: string[]
): CardElement["header"] | null {
  if (typeof header.title !== "string") {
    pushCardFillError(prefix, errors);
    return null;
  }
  if (typeof header.subtitle !== "undefined" && typeof header.subtitle !== "string") {
    pushCardFillError(prefix, errors);
    return null;
  }
  if (typeof header.icon !== "undefined" && typeof header.icon !== "string") {
    pushCardFillError(prefix, errors);
    return null;
  }
  return {
    title: header.title,
    subtitle: typeof header.subtitle === "string" ? header.subtitle : undefined,
    icon: typeof header.icon === "string" ? header.icon : undefined,
  };
}

function parseCardFooter(
  footer: Record<string, unknown>,
  prefix: string,
  errors: string[]
): CardElement["footer"] | null {
  if (typeof footer.strip !== "undefined" && typeof footer.strip !== "boolean") {
    pushCardFillError(prefix, errors);
    return null;
  }
  if (typeof footer.label !== "undefined" && typeof footer.label !== "string") {
    pushCardFillError(prefix, errors);
    return null;
  }
  if (typeof footer.text !== "undefined" && typeof footer.text !== "string") {
    pushCardFillError(prefix, errors);
    return null;
  }
  return {
    strip: typeof footer.strip === "boolean" ? footer.strip : undefined,
    label: typeof footer.label === "string" ? footer.label : undefined,
    text: typeof footer.text === "string" ? footer.text : undefined,
  };
}

function parseCardBody(
  body: unknown,
  prefix: string,
  errors: string[],
  strict: boolean
): Array<CardElement["body"][number]> | null {
  if (!Array.isArray(body) || body.length === 0) {
    pushCardFillError(prefix, errors);
    return null;
  }
  const listItems: Array<CardElement["body"][number]> = [];
  body.forEach((entry, idx) => {
    const itemPrefix = `${prefix} Body ${idx + 1}:`;
    if (!isPlainObject(entry)) {
      pushCardFillError(itemPrefix, errors);
      return;
    }
    const item = entry as Record<string, unknown>;
    if (item.type !== "list") {
      pushCardFillError(itemPrefix, errors);
      return;
    }
    if (!Array.isArray(item.items)) {
      pushCardFillError(itemPrefix, errors);
      return;
    }
    const normalizedItems: Array<{ text: string }> = [];
    for (const listEntry of item.items as unknown[]) {
      if (typeof listEntry === "string") {
        normalizedItems.push({ text: listEntry });
      } else if (isPlainObject(listEntry) && typeof (listEntry as Record<string, unknown>).text === "string") {
        normalizedItems.push({ text: (listEntry as Record<string, unknown>).text as string });
      } else {
        pushCardFillError(itemPrefix, errors);
        return;
      }
    }
    if (strict) {
      const allowedListFields = new Set(["type", "style", "bullet", "indent", "lineGap", "items"]);
      for (const key of Object.keys(item)) {
        if (!allowedListFields.has(key)) {
          pushCardFillError(itemPrefix, errors);
        }
      }
    }
    listItems.push({
      type: "list",
      style: typeof item.style === "string" ? (item.style as any) : undefined,
      bullet: isPlainObject(item.bullet) ? (item.bullet as any) : undefined,
      indent: isPlainObject(item.indent) ? (item.indent as any) : undefined,
      lineGap: typeof item.lineGap === "number" ? (item.lineGap as number) : undefined,
      items: normalizedItems,
    });
  });
  return listItems.length > 0 ? listItems : null;
}

export function compileTemplateSpec(args: {
  spec: unknown;
  theme: ConcreteTheme;
  strict: boolean;
}): { spec: SlideProgramSpec | null; errors: string[] } {
  const errors: string[] = [];
  if (!args.spec || typeof args.spec !== "object" || Array.isArray(args.spec)) {
    return { spec: null, errors: ["Spec must be a JSON object"] };
  }
  const root = args.spec as Record<string, unknown>;
  if (typeof root.title !== "string" || root.title.trim().length === 0) {
    errors.push("Missing or invalid top-level 'title' field");
  }
  if (!Array.isArray(root.slides)) {
    errors.push("Missing or invalid 'slides' array");
    return { spec: null, errors };
  }

  const compiledSlides: Slide[] = [];

  root.slides.forEach((rawSlide, slideIdx) => {
    const prefix = `Slide ${slideIdx + 1}:`;
    if (!rawSlide || typeof rawSlide !== "object") {
      errors.push(`${prefix} invalid slide object`);
      return;
    }
    const slide = rawSlide as Record<string, unknown>;
    const hasTemplate = "template" in slide;

    if (!hasTemplate) {
      compiledSlides.push(slide as unknown as Slide);
      return;
    }

    if ("grid" in slide || "regions" in slide || "elements" in slide) {
      errors.push(`${prefix} template_slide_conflict`);
      return;
    }
    if (typeof slide.id !== "string" || slide.id.trim().length === 0) {
      errors.push(`${prefix} Missing or invalid 'id'`);
      return;
    }
    if (typeof slide.title !== "string" || slide.title.trim().length === 0) {
      errors.push(`${prefix} Missing or invalid 'title'`);
      return;
    }

    let templateRef: unknown = slide.template;
    let templateVariant: string | undefined;
    if (isPlainObject(slide.template) && "name" in slide.template) {
      const templateObj = slide.template as Record<string, unknown>;
      const name = templateObj.name;
      if (typeof name !== "string" || name.trim().length === 0) {
        errors.push(`${prefix} template_reference_invalid`);
        return;
      }
      templateRef = name;
      if (typeof templateObj.variant !== "undefined") {
        if (typeof templateObj.variant !== "string" || templateObj.variant.trim().length === 0) {
          errors.push(`${prefix} template_variant_invalid`);
          return;
        }
        templateVariant = templateObj.variant;
      }
      if (args.strict) {
        const allowedFields = new Set(["name", "variant"]);
        for (const key of Object.keys(templateObj)) {
          if (!allowedFields.has(key)) {
            errors.push(`${prefix} template_variant_invalid`);
          }
        }
      }
    } else if (isPlainObject(slide.template) && "variant" in slide.template) {
      errors.push(`${prefix} template_variant_invalid`);
      return;
    }

    const baseTemplate = resolveTemplate(templateRef, args.strict, errors);
    if (!baseTemplate) {
      return;
    }
    const resolvedTemplate = applyVariant(baseTemplate, templateVariant, args.strict, errors, baseTemplate.id || "inline");
    if (!resolvedTemplate) {
      return;
    }
    const template = resolvedTemplate;
    if (!template.grid) {
      errors.push(`${prefix} template_grid_invalid`);
      return;
    }
    const templateGrid = template.grid;

    const placeholderMap = new Map<string, TemplatePlaceholder>();
    template.placeholders.forEach((placeholder) => {
      if (placeholderMap.has(placeholder.id)) {
        errors.push(`${prefix} template_placeholder_duplicate (${placeholder.id})`);
      }
      placeholderMap.set(placeholder.id, placeholder);
    });

    const fills = isPlainObject(slide.fills) ? (slide.fills as Record<string, unknown>) : {};
    if (slide.fills && !isPlainObject(slide.fills)) {
      errors.push(`${prefix} template_fills_invalid`);
      return;
    }

    for (const fillKey of Object.keys(fills)) {
      if (!placeholderMap.has(fillKey)) {
        errors.push(`${prefix} template_fill_unknown_placeholder (${fillKey})`);
      }
    }

    const regions: Record<string, { col: number; row: number; colSpan: number; rowSpan: number }> = {};
    const elements: Element[] = [];
    const requireAll = template.policies?.requireAllPlaceholders !== false;

    for (const placeholder of template.placeholders) {
      const placeholderPrefix = `${prefix} Placeholder '${placeholder.id}':`;
      validateTemplatePlaceholder(placeholder, placeholderPrefix, errors);
      const anchorsToCheck: TemplateAnchor[] = [];
      if (placeholder.anchor) {
        anchorsToCheck.push(placeholder.anchor);
      }
      if (placeholder.start) {
        anchorsToCheck.push(placeholder.start);
      }
      if (placeholder.end) {
        anchorsToCheck.push(placeholder.end);
      }
      anchorsToCheck.forEach((anchor) => {
        if (anchor && !placeholderMap.has(anchor.target)) {
          errors.push(`${placeholderPrefix} template_anchor_target_unknown (${anchor.target})`);
        }
      });
      const region = placeholder.region;
      if (
        typeof region.col === "number" &&
        typeof region.colSpan === "number" &&
        region.col + region.colSpan > templateGrid.cols
      ) {
        errors.push(`${placeholderPrefix} template_placeholder_region_invalid`);
      }
      if (
        typeof region.row === "number" &&
        typeof region.rowSpan === "number" &&
        region.row + region.rowSpan > templateGrid.rows
      ) {
        errors.push(`${placeholderPrefix} template_placeholder_region_invalid`);
      }

      const fill = fills[placeholder.id];
      const required = placeholder.policies?.required ?? requireAll;
      const needsFill = placeholder.kind !== "connector";
      if (typeof fill === "undefined" && required && needsFill) {
        errors.push(`${placeholderPrefix} template_fill_missing`);
        continue;
      }

      const outerRect = regionToRectInches(templateGrid, region);
      assertRectQuantized(outerRect, placeholderPrefix, errors);

      const fillObj = typeof fill === "undefined" ? undefined : ensureFillObject(fill, placeholderPrefix, errors);
      if (fill && !fillObj) {
        continue;
      }

      const fillObjForPadding = fillObj;
      const paddingSlot = resolvePaddingSlot(
        resolveSlot(fillObjForPadding?.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
        placeholderPrefix,
        errors
      );
      const paddingIn = resolvePaddingInches(paddingSlot, args.theme, placeholderPrefix, errors);
      let contentRegionId: string | null = null;
      let contentRect: { x: number; y: number; width: number; height: number } | null = null;
      if (typeof paddingIn === "number") {
        const insetRect = {
          x: outerRect.x + paddingIn,
          y: outerRect.y + paddingIn,
          width: outerRect.width - paddingIn * 2,
          height: outerRect.height - paddingIn * 2,
        };
        if (insetRect.width <= 0 || insetRect.height <= 0) {
          errors.push(`${placeholderPrefix} template_padding_invalid`);
        } else {
          assertRectQuantized(insetRect, placeholderPrefix, errors);
          const contentRegion = rectToRegion(templateGrid, insetRect);
          const contentId = `${placeholder.id}__content`;
          regions[contentId] = contentRegion;
          contentRegionId = contentId;
          contentRect = insetRect;
        }
      }

      regions[placeholder.id] = {
        col: region.col,
        row: region.row,
        colSpan: region.colSpan,
        rowSpan: region.rowSpan,
      };

      const z = computeZ(placeholder, template.layers, errors, placeholderPrefix);

      const allowedKinds = placeholder.allowedKinds ?? [placeholder.kind];
      const itemCount = Array.isArray(fillObj?.items) ? (fillObj?.items as unknown[]).length : (typeof fill === "undefined" ? 0 : 1);
      if (typeof placeholder.minItems !== "undefined" && itemCount < placeholder.minItems) {
        errors.push(`${placeholderPrefix} template_items_count_invalid`);
      }
      if (typeof placeholder.maxItems !== "undefined" && itemCount > placeholder.maxItems) {
        errors.push(`${placeholderPrefix} template_items_count_invalid`);
      }

      if (fillObj && "items" in fillObj && !Array.isArray(fillObj.items)) {
        errors.push(`${placeholderPrefix} template_items_invalid`);
      }
      const items = Array.isArray(fillObj?.items) ? (fillObj?.items as unknown[]) : null;
      const layoutMode = placeholder.layoutMode ?? "single";
      const containerRect = contentRect ?? outerRect;

      if (!items && layoutMode !== "single" && typeof fillObj !== "undefined") {
        errors.push(`${placeholderPrefix} template_items_invalid`);
      }

      if (items) {
        if (fillObj) {
          validateFillFields(
            fillObj,
            new Set(["items", "variant"]),
            placeholderPrefix,
            args.strict,
            errors
          );
        }
        if (placeholder.kind === "connector") {
          errors.push(`${placeholderPrefix} template_item_kind_invalid`);
          continue;
        }
        if (layoutMode === "single" && items.length > 1) {
          errors.push(`${placeholderPrefix} template_layout_mode_invalid`);
          continue;
        }
        if (layoutMode !== "single" && typeof placeholder.gapToken === "undefined") {
          errors.push(`${placeholderPrefix} template_layout_gap_missing`);
          continue;
        }
        if (layoutMode === "single") {
          const hasNestedCard = items.some((item) => isPlainObject(item) && (item as Record<string, unknown>).kind === "card");
          if (hasNestedCard) {
            errors.push(`${placeholderPrefix} nested_card_without_template_layout`);
            continue;
          }
        }

        const gapIn = layoutMode === "single" ? 0 : (resolveGapInches(placeholder.gapToken, args.theme, placeholderPrefix, errors) ?? 0);
        let rects: Array<{ x: number; y: number; width: number; height: number }> = [];
        let regionIds: string[] = [];

        if (layoutMode === "grid") {
          const rows = placeholder.gridRows ?? 0;
          const cols = placeholder.gridCols ?? 0;
          if (rows <= 0 || cols <= 0) {
            errors.push(`${placeholderPrefix} template_layout_grid_invalid`);
            continue;
          }
          const capacity = rows * cols;
          if (items.length > capacity) {
            errors.push(`${placeholderPrefix} template_items_count_invalid`);
          }
          rects = computeLayoutRects({
            mode: "grid",
            rect: containerRect,
            count: capacity,
            gapIn,
            gridRows: rows,
            gridCols: cols,
            prefix: placeholderPrefix,
            errors,
          });
          rects.forEach((rect, idx) => {
            assertRectQuantized(rect, placeholderPrefix, errors);
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const regionId = `${placeholder.id}__cell_${row + 1}_${col + 1}`;
            regions[regionId] = rectToRegion(templateGrid, rect);
            regionIds.push(regionId);
          });
        } else if (layoutMode === "vstack" || layoutMode === "hstack") {
          rects = computeLayoutRects({
            mode: layoutMode,
            rect: containerRect,
            count: items.length,
            gapIn,
            prefix: placeholderPrefix,
            errors,
          });
          rects.forEach((rect, idx) => {
            assertRectQuantized(rect, placeholderPrefix, errors);
            const regionId = `${placeholder.id}__item_${idx + 1}`;
            regions[regionId] = rectToRegion(templateGrid, rect);
            regionIds.push(regionId);
          });
        } else {
          regionIds = [contentRegionId ?? placeholder.id];
        }

        items.forEach((item, idx) => {
          if (!isPlainObject(item)) {
            errors.push(`${placeholderPrefix} template_items_invalid`);
            return;
          }
          const itemObj = item as Record<string, unknown>;
          const itemPrefix = `${placeholderPrefix} Item ${idx + 1}:`;
          const kindValue = itemObj.kind;
          if (typeof kindValue !== "string") {
            errors.push(`${itemPrefix} template_item_kind_invalid`);
            return;
          }
          if (!ITEM_KINDS.has(kindValue)) {
            errors.push(`${itemPrefix} template_item_kind_invalid`);
            return;
          }
          const kindForAllow = kindValue;
          if (!allowedKinds.includes(kindForAllow as TemplateKind)) {
            errors.push(`${itemPrefix} template_item_kind_invalid`);
            return;
          }
          const regionId = regionIds[idx] ?? (contentRegionId ?? placeholder.id);
          const variant = resolveVariantValue(itemObj, placeholder.variant, itemPrefix, errors);

          if (kindValue === "text") {
            validateItemFields(
              itemObj,
              new Set(["kind", "text", "items", "textStyleSlot", "paddingSlot", "variant"]),
              itemPrefix,
              args.strict,
              errors
            );
            const textValue = typeof itemObj.text === "string" ? itemObj.text : null;
            if (typeof textValue !== "string") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const textSlot = resolveTextSlot(
              resolveSlot(itemObj.textStyleSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
              itemPrefix,
              errors
            );
            const paddingSlot = resolvePaddingSlot(
              resolveSlot(itemObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
              itemPrefix,
              errors
            );
            const style: Record<string, unknown> = {};
            if (textSlot) {
              const scale = textScaleForSlot(args.theme, textSlot);
              style.fontSize = scale.size;
              style.bold = scale.weight >= args.theme.type.weightBold;
            }
            if (typeof paddingSlot !== "undefined") {
              style.paddingPt = args.theme.spaceScale[paddingSlot];
            }
            elements.push({
              type: "text",
              region: regionId,
              content: textValue,
              variant,
              z,
              style: Object.keys(style).length > 0 ? (style as any) : undefined,
            });
            return;
          }

          if (kindValue === "list") {
            validateItemFields(
              itemObj,
              new Set(["kind", "items", "style", "bullet", "indent", "lineGap"]),
              itemPrefix,
              args.strict,
              errors
            );
            if (!Array.isArray(itemObj.items)) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const listItems: Array<{ text: string }> = [];
            for (const entry of itemObj.items as unknown[]) {
              if (typeof entry === "string") {
                listItems.push({ text: entry });
              } else if (isPlainObject(entry) && typeof (entry as Record<string, unknown>).text === "string") {
                listItems.push({ text: (entry as Record<string, unknown>).text as string });
              } else {
                errors.push(`${itemPrefix} template_item_field_invalid`);
                return;
              }
            }
            elements.push({
              type: "list",
              region: regionId,
              style: typeof itemObj.style === "string" ? (itemObj.style as any) : undefined,
              bullet: isPlainObject(itemObj.bullet) ? (itemObj.bullet as any) : undefined,
              indent: isPlainObject(itemObj.indent) ? (itemObj.indent as any) : undefined,
              lineGap: typeof itemObj.lineGap === "number" ? itemObj.lineGap : undefined,
              items: listItems,
              z,
            });
            return;
          }

          if (kindValue === "card") {
            validateItemFields(
              itemObj,
              new Set(["kind", "variant", "style", "header", "body", "footer", "paddingSlot"]),
              itemPrefix,
              args.strict,
              errors
            );
            const paddingSlot = resolvePaddingSlot(
              resolveSlot(itemObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
              itemPrefix,
              errors
            );
            let cardVariant: CardElement["variant"] | undefined = placeholder.variant as CardElement["variant"];
            if (typeof itemObj.variant !== "undefined") {
              if (!isVariant(itemObj.variant)) {
                pushCardFillError(itemPrefix, errors, "card_variant_invalid");
                return;
              }
              cardVariant = itemObj.variant as CardElement["variant"];
            }
            const cardStyle =
              typeof itemObj.style === "undefined"
                ? undefined
                : isPlainObject(itemObj.style)
                  ? parseCardStyleSpec(itemObj.style as Record<string, unknown>, itemPrefix, errors)
                  : (pushCardFillError(itemPrefix, errors), null);
            if (cardStyle === null) {
              return;
            }
            const cardHeader =
              typeof itemObj.header === "undefined"
                ? undefined
                : isPlainObject(itemObj.header)
                  ? parseCardHeader(itemObj.header as Record<string, unknown>, itemPrefix, errors)
                  : (pushCardFillError(itemPrefix, errors), null);
            if (cardHeader === null) {
              return;
            }
            const cardFooter =
              typeof itemObj.footer === "undefined"
                ? undefined
                : isPlainObject(itemObj.footer)
                  ? parseCardFooter(itemObj.footer as Record<string, unknown>, itemPrefix, errors)
                  : (pushCardFillError(itemPrefix, errors), null);
            if (cardFooter === null) {
              return;
            }
            const cardBody = parseCardBody(itemObj.body, itemPrefix, errors, args.strict);
            if (!cardBody) {
              return;
            }
            let compiledCardStyle = cardStyle ? { ...cardStyle } : undefined;
            if (typeof paddingSlot !== "undefined") {
              compiledCardStyle = {
                ...(compiledCardStyle ?? {}),
                paddingPt: args.theme.spaceScale[paddingSlot],
              };
            }
            elements.push({
              type: "card",
              region: regionId,
              variant: cardVariant,
              style: compiledCardStyle,
              header: cardHeader ?? undefined,
              body: cardBody,
              footer: cardFooter ?? undefined,
              z,
            });
            return;
          }

          if (kindValue === "table") {
            validateItemFields(
              itemObj,
              new Set(["kind", "headers", "rows", "paddingSlot", "variant"]),
              itemPrefix,
              args.strict,
              errors
            );
            if (
              !Array.isArray(itemObj.headers) ||
              !itemObj.headers.every((entry) => typeof entry === "string") ||
              !Array.isArray(itemObj.rows)
            ) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const paddingSlot = resolvePaddingSlot(
              resolveSlot(itemObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
              itemPrefix,
              errors
            );
            const style: Record<string, unknown> = {};
            if (typeof paddingSlot !== "undefined") {
              style.cellPaddingPt = args.theme.spaceScale[paddingSlot];
            }
            elements.push({
              type: "table",
              region: regionId,
              content: { headers: itemObj.headers as any, rows: itemObj.rows as any },
              variant,
              z,
              style: Object.keys(style).length > 0 ? (style as any) : undefined,
            });
            return;
          }

          if (kindValue === "chart") {
            validateItemFields(
              itemObj,
              new Set(["kind", "chartType", "title", "dataSeries", "variant"]),
              itemPrefix,
              args.strict,
              errors
            );
            if (typeof itemObj.chartType !== "string" || !Array.isArray(itemObj.dataSeries)) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            elements.push({
              type: "chart",
              region: regionId,
              content: {
                chartType: itemObj.chartType as string,
                title: typeof itemObj.title === "string" ? itemObj.title : undefined,
                dataSeries: itemObj.dataSeries as any,
              },
              variant,
              z,
            });
            return;
          }

          if (kindValue === "image") {
            validateItemFields(
              itemObj,
              new Set([
                "kind",
                "src",
                "fit",
                "variant",
                "opacity",
                "crop",
                "overlaySurfaceSlot",
                "overlayOpacity",
                "borderRadiusPt",
              ]),
              itemPrefix,
              args.strict,
              errors
            );
            if (typeof itemObj.src !== "string" || typeof itemObj.fit !== "string") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            if (itemObj.fit !== "contain" && itemObj.fit !== "cover") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            elements.push({
              type: "image",
              id: placeholder.id,
              region: regionId,
              src: itemObj.src,
              fit: itemObj.fit === "cover" ? "cover" : "contain",
              variant,
              z,
              opacity: typeof itemObj.opacity === "number" ? itemObj.opacity : undefined,
              crop: isPlainObject(itemObj.crop) ? (itemObj.crop as any) : undefined,
              overlaySurfaceSlot: resolveOverlaySurfaceSlot(
                itemObj.overlaySurfaceSlot,
                itemPrefix,
                "template_item_field_invalid",
                errors
              ),
              overlayOpacity: typeof itemObj.overlayOpacity === "number" ? itemObj.overlayOpacity : undefined,
              borderRadiusPt: typeof itemObj.borderRadiusPt === "number" ? itemObj.borderRadiusPt : undefined,
            });
            return;
          }

          if (kindValue === "icon") {
            validateItemFields(
              itemObj,
              new Set(["kind", "name", "sizeToken", "colorSlot", "align", "verticalAlign"]),
              itemPrefix,
              args.strict,
              errors
            );
            if (typeof itemObj.name !== "string") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            if (typeof itemObj.sizeToken !== "number" || !Number.isInteger(itemObj.sizeToken)) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const colorSlot = resolveTextSlot(
              resolveSlot(itemObj.colorSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
              itemPrefix,
              errors
            );
            if (!colorSlot) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            if (typeof itemObj.align !== "undefined" && !["left", "center", "right"].includes(String(itemObj.align))) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            if (
              typeof itemObj.verticalAlign !== "undefined" &&
              !["top", "middle", "bottom"].includes(String(itemObj.verticalAlign))
            ) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            elements.push({
              type: "icon",
              region: regionId,
              name: itemObj.name,
              sizeToken: itemObj.sizeToken as number,
              colorSlot,
              align: typeof itemObj.align === "string" ? (itemObj.align as any) : undefined,
              verticalAlign: typeof itemObj.verticalAlign === "string" ? (itemObj.verticalAlign as any) : undefined,
              z,
            });
            return;
          }

          if (kindValue === "callout") {
            validateItemFields(
              itemObj,
              new Set(["kind", "text", "content", "textStyleSlot", "paddingSlot", "variant", "leader"]),
              itemPrefix,
              args.strict,
              errors
            );
            if (!placeholder.anchor || !placeholder.box) {
              errors.push(`${itemPrefix} template_callout_definition_invalid`);
              return;
            }
            if (typeof itemObj.leader !== "undefined" && !isPlainObject(itemObj.leader)) {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            if (isPlainObject(itemObj.leader)) {
              const leaderObj = itemObj.leader as Record<string, unknown>;
              if (
                typeof leaderObj.startArrow !== "undefined" &&
                !["none", "triangle"].includes(String(leaderObj.startArrow))
              ) {
                errors.push(`${itemPrefix} template_item_field_invalid`);
                return;
              }
              if (
                typeof leaderObj.endArrow !== "undefined" &&
                !["none", "triangle"].includes(String(leaderObj.endArrow))
              ) {
                errors.push(`${itemPrefix} template_item_field_invalid`);
                return;
              }
            }
            let contentObj: { text: string; icon?: string } | null = null;
            if (isPlainObject(itemObj.content)) {
              const content = itemObj.content as Record<string, unknown>;
              if (typeof content.text !== "string") {
                errors.push(`${itemPrefix} template_item_field_invalid`);
                return;
              }
              if (typeof content.icon !== "undefined" && typeof content.icon !== "string") {
                errors.push(`${itemPrefix} template_item_field_invalid`);
                return;
              }
              contentObj = { text: content.text, icon: typeof content.icon === "string" ? content.icon : undefined };
            } else if (typeof itemObj.content !== "undefined") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const textValue = contentObj ? contentObj.text : typeof itemObj.text === "string" ? itemObj.text : null;
            if (typeof textValue !== "string") {
              errors.push(`${itemPrefix} template_item_field_invalid`);
              return;
            }
            const paddingSlot = resolvePaddingSlot(
              resolveSlot(
                itemObj.paddingSlot as any,
                placeholder.box.paddingSlot ?? placeholder.styleSlots?.padding,
                template.defaultSlots?.padding
              ),
              itemPrefix,
              errors
            );
            const textSlot = resolveTextSlot(
              resolveSlot(itemObj.textStyleSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
              itemPrefix,
              errors
            );
            const textStyle: Record<string, unknown> = {};
            if (textSlot) {
              const scale = textScaleForSlot(args.theme, textSlot);
              textStyle.fontSize = scale.size;
              textStyle.bold = scale.weight >= args.theme.type.weightBold;
            }
            const leader = placeholder.leader || itemObj.leader ? ({
              style: "line" as const,
              endCap: "none" as const,
              startArrow: (itemObj.leader as any)?.startArrow ?? placeholder.leader?.startArrow,
              endArrow: (itemObj.leader as any)?.endArrow ?? placeholder.leader?.endArrow,
            }) : undefined;
            elements.push({
              type: "callout",
              id: placeholder.id,
              region: regionId,
              anchor: toRegionAnchor(placeholder.anchor) as any,
              box: {
                wIn: placeholder.box.wIn,
                hIn: placeholder.box.hIn,
                placement: placeholder.box.placement,
                paddingPt: typeof paddingSlot !== "undefined" ? args.theme.spaceScale[paddingSlot] : undefined,
              },
              ...(contentObj
                ? { content: { text: contentObj.text, icon: contentObj.icon } }
                : {
                    text: {
                      value: textValue,
                      style: Object.keys(textStyle).length > 0 ? (textStyle as any) : undefined,
                    },
                  }),
              leader,
              variant,
              z,
            });
            return;
          }

          errors.push(`${itemPrefix} template_item_kind_invalid`);
        });

        continue;
      }

      if (placeholder.kind === "text") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["content", "textStyleSlot", "paddingSlot", "variant"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (typeof fillObj.content !== "string") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const variant = resolveVariantValue(fillObj, placeholder.variant, placeholderPrefix, errors);
        const textSlot = resolveTextSlot(
          resolveSlot(fillObj.textStyleSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
          placeholderPrefix,
          errors
        );
        const paddingSlot = resolvePaddingSlot(
          resolveSlot(fillObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
          placeholderPrefix,
          errors
        );
        const style: Record<string, unknown> = {};
        if (textSlot) {
          const scale = textScaleForSlot(args.theme, textSlot);
          style.fontSize = scale.size;
          style.bold = scale.weight >= args.theme.type.weightBold;
        }
        if (typeof paddingSlot !== "undefined") {
          style.paddingPt = args.theme.spaceScale[paddingSlot];
        }
        const regionId = contentRegionId ?? placeholder.id;
        const element: TextElement = {
          type: "text",
          region: regionId,
          content: fillObj.content,
          variant,
          z,
          style: Object.keys(style).length > 0 ? (style as any) : undefined,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "card") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        if (args.strict) {
          const allowedFields = new Set(["variant", "style", "header", "body", "footer", "paddingSlot"]);
          for (const key of Object.keys(fillObj)) {
            if (!allowedFields.has(key)) {
              pushCardFillError(placeholderPrefix, errors);
            }
          }
        }
        if ("items" in fillObj) {
          pushCardFillError(placeholderPrefix, errors);
          continue;
        }
        let cardVariant: CardElement["variant"] | undefined = placeholder.variant as CardElement["variant"];
        if (typeof fillObj.variant !== "undefined") {
          if (!isVariant(fillObj.variant)) {
            pushCardFillError(placeholderPrefix, errors, "card_variant_invalid");
            continue;
          }
          cardVariant = fillObj.variant as CardElement["variant"];
        }
        const paddingSlot = resolvePaddingSlot(
          resolveSlot(fillObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
          placeholderPrefix,
          errors
        );
        const cardStyle =
          typeof fillObj.style === "undefined"
            ? undefined
            : isPlainObject(fillObj.style)
              ? parseCardStyleSpec(fillObj.style as Record<string, unknown>, placeholderPrefix, errors)
              : (pushCardFillError(placeholderPrefix, errors), null);
        if (cardStyle === null) {
          continue;
        }
        const cardHeader =
          typeof fillObj.header === "undefined"
            ? undefined
            : isPlainObject(fillObj.header)
              ? parseCardHeader(fillObj.header as Record<string, unknown>, placeholderPrefix, errors)
              : (pushCardFillError(placeholderPrefix, errors), null);
        if (cardHeader === null) {
          continue;
        }
        const cardFooter =
          typeof fillObj.footer === "undefined"
            ? undefined
            : isPlainObject(fillObj.footer)
              ? parseCardFooter(fillObj.footer as Record<string, unknown>, placeholderPrefix, errors)
              : (pushCardFillError(placeholderPrefix, errors), null);
        if (cardFooter === null) {
          continue;
        }
        const cardBody = parseCardBody(fillObj.body, placeholderPrefix, errors, args.strict);
        if (!cardBody) {
          continue;
        }
        const regionId = contentRegionId ?? placeholder.id;
        let compiledCardStyle = cardStyle ? { ...cardStyle } : undefined;
        if (typeof paddingSlot !== "undefined") {
          compiledCardStyle = {
            ...(compiledCardStyle ?? {}),
            paddingPt: args.theme.spaceScale[paddingSlot],
          };
        }
        const element: CardElement = {
          type: "card",
          region: regionId,
          variant: cardVariant,
          style: compiledCardStyle,
          header: cardHeader ?? undefined,
          body: cardBody,
          footer: cardFooter ?? undefined,
          z,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "list") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["items", "style", "bullet", "indent", "lineGap"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (!Array.isArray(fillObj.items)) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const listItems: Array<{ text: string }> = [];
        for (const entry of fillObj.items as unknown[]) {
          if (typeof entry === "string") {
            listItems.push({ text: entry });
          } else if (isPlainObject(entry) && typeof (entry as Record<string, unknown>).text === "string") {
            listItems.push({ text: (entry as Record<string, unknown>).text as string });
          } else {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            return;
          }
        }
        const regionId = contentRegionId ?? placeholder.id;
        elements.push({
          type: "list",
          region: regionId,
          style: typeof fillObj.style === "string" ? (fillObj.style as any) : undefined,
          bullet: isPlainObject(fillObj.bullet) ? (fillObj.bullet as any) : undefined,
          indent: isPlainObject(fillObj.indent) ? (fillObj.indent as any) : undefined,
          lineGap: typeof fillObj.lineGap === "number" ? fillObj.lineGap : undefined,
          items: listItems,
          z,
        });
        continue;
      }

      if (placeholder.kind === "table") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["content", "paddingSlot", "variant"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (!isPlainObject(fillObj.content)) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const variant = resolveVariantValue(fillObj, placeholder.variant, placeholderPrefix, errors);
        const paddingSlot = resolvePaddingSlot(
          resolveSlot(fillObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
          placeholderPrefix,
          errors
        );
        const style: Record<string, unknown> = {};
        if (typeof paddingSlot !== "undefined") {
          style.cellPaddingPt = args.theme.spaceScale[paddingSlot];
        }
        const regionId = contentRegionId ?? placeholder.id;
        const element: TableElement = {
          type: "table",
          region: regionId,
          content: fillObj.content as any,
          variant,
          z,
          style: Object.keys(style).length > 0 ? (style as any) : undefined,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "chart") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(fillObj, new Set(["content", "variant"]), placeholderPrefix, args.strict, errors);
        if (!isPlainObject(fillObj.content)) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const variant = resolveVariantValue(fillObj, placeholder.variant, placeholderPrefix, errors);
        const regionId = contentRegionId ?? placeholder.id;
        const element: ChartElement = {
          type: "chart",
          region: regionId,
          content: fillObj.content as any,
          variant,
          z,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "chevron_flow") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["steps", "orientation", "layoutProfile"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (!Array.isArray(fillObj.steps) || fillObj.steps.length < 2 || fillObj.steps.length > 12) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const steps: ChevronFlowElement["steps"] = [];
        for (const [stepIdx, stepRaw] of (fillObj.steps as unknown[]).entries()) {
          if (!isPlainObject(stepRaw)) {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            steps.length = 0;
            break;
          }
          const step = stepRaw as Record<string, unknown>;
          if (typeof step.label !== "string" || step.label.trim().length === 0) {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            steps.length = 0;
            break;
          }
          if (typeof step.icon !== "undefined" && typeof step.icon !== "string") {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            steps.length = 0;
            break;
          }
          steps.push({
            label: step.label.trim(),
            icon: typeof step.icon === "string" ? step.icon : undefined,
          });
          if (args.strict) {
            for (const key of Object.keys(step)) {
              if (!new Set(["label", "icon"]).has(key)) {
                errors.push(`${placeholderPrefix} template_fill_invalid`);
                steps.length = 0;
                break;
              }
            }
          }
          if (steps.length === 0 && stepIdx < (fillObj.steps as unknown[]).length - 1) {
            break;
          }
        }
        if (steps.length === 0) {
          continue;
        }
        const orientation = typeof fillObj.orientation === "string" ? fillObj.orientation : undefined;
        if (typeof orientation !== "undefined" && orientation !== "horizontal") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const layoutProfile = typeof fillObj.layoutProfile === "string" ? fillObj.layoutProfile : undefined;
        if (typeof layoutProfile !== "undefined" && layoutProfile !== "flow.chevron" && layoutProfile !== "flow.card") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const regionId = contentRegionId ?? placeholder.id;
        const element: ChevronFlowElement = {
          type: "chevron_flow",
          region: regionId,
          steps,
          orientation: orientation as ChevronFlowElement["orientation"],
          layoutProfile: layoutProfile as ChevronFlowElement["layoutProfile"],
          z,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "image") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set([
            "src",
            "fit",
            "variant",
            "opacity",
            "crop",
            "overlaySurfaceSlot",
            "overlayOpacity",
            "borderRadiusPt",
          ]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (typeof fillObj.src !== "string" || typeof fillObj.fit !== "string") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const variant = resolveVariantValue(fillObj, placeholder.variant, placeholderPrefix, errors);
        const regionId = contentRegionId ?? placeholder.id;
        const element: ImageElement = {
          type: "image",
          id: placeholder.id,
          region: regionId,
          src: fillObj.src,
          fit: fillObj.fit === "cover" ? "cover" : "contain",
          variant,
          z,
          opacity: typeof fillObj.opacity === "number" ? fillObj.opacity : undefined,
          crop: isPlainObject(fillObj.crop) ? (fillObj.crop as any) : undefined,
          overlaySurfaceSlot: resolveOverlaySurfaceSlot(
            fillObj.overlaySurfaceSlot,
            placeholderPrefix,
            "template_fill_invalid",
            errors
          ),
          overlayOpacity: typeof fillObj.overlayOpacity === "number" ? fillObj.overlayOpacity : undefined,
          borderRadiusPt: typeof fillObj.borderRadiusPt === "number" ? fillObj.borderRadiusPt : undefined,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "icon") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["name", "sizeToken", "colorSlot", "align", "verticalAlign"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (typeof fillObj.name !== "string") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        if (typeof fillObj.sizeToken !== "number" || !Number.isInteger(fillObj.sizeToken)) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const colorSlot = resolveTextSlot(
          resolveSlot(fillObj.colorSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
          placeholderPrefix,
          errors
        );
        if (!colorSlot) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        if (typeof fillObj.align !== "undefined" && !["left", "center", "right"].includes(String(fillObj.align))) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        if (
          typeof fillObj.verticalAlign !== "undefined" &&
          !["top", "middle", "bottom"].includes(String(fillObj.verticalAlign))
        ) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const regionId = contentRegionId ?? placeholder.id;
        const element: IconElement = {
          type: "icon",
          region: regionId,
          name: fillObj.name,
          sizeToken: fillObj.sizeToken as number,
          colorSlot,
          align: typeof fillObj.align === "string" ? (fillObj.align as any) : undefined,
          verticalAlign: typeof fillObj.verticalAlign === "string" ? (fillObj.verticalAlign as any) : undefined,
          z,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "callout") {
        if (typeof fill === "undefined") {
          continue;
        }
        if (!fillObj) {
          continue;
        }
        validateFillFields(
          fillObj,
          new Set(["text", "content", "textStyleSlot", "paddingSlot", "variant", "leader"]),
          placeholderPrefix,
          args.strict,
          errors
        );
        if (typeof fillObj.leader !== "undefined" && !isPlainObject(fillObj.leader)) {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        let contentObj: { text: string; icon?: string } | null = null;
        if (isPlainObject(fillObj.content)) {
          const content = fillObj.content as Record<string, unknown>;
          if (typeof content.text !== "string") {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            continue;
          }
          if (typeof content.icon !== "undefined" && typeof content.icon !== "string") {
            errors.push(`${placeholderPrefix} template_fill_invalid`);
            continue;
          }
          contentObj = { text: content.text, icon: typeof content.icon === "string" ? content.icon : undefined };
        } else if (typeof fillObj.content !== "undefined") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const textValue = contentObj
          ? contentObj.text
          : typeof fillObj.text === "string"
            ? fillObj.text
            : (fillObj.text as any)?.value;
        if (typeof textValue !== "string") {
          errors.push(`${placeholderPrefix} template_fill_invalid`);
          continue;
        }
        const variant = resolveVariantValue(fillObj, placeholder.variant, placeholderPrefix, errors);
        if (!placeholder.anchor || !placeholder.box) {
          errors.push(`${placeholderPrefix} template_callout_definition_invalid`);
          continue;
        }
        const paddingSlot = resolvePaddingSlot(
          resolveSlot(
            fillObj.paddingSlot as any,
            placeholder.box.paddingSlot ?? placeholder.styleSlots?.padding,
            template.defaultSlots?.padding
          ),
          placeholderPrefix,
          errors
        );
        const textSlot = resolveTextSlot(
          resolveSlot(fillObj.textStyleSlot as any, placeholder.styleSlots?.text, template.defaultSlots?.text),
          placeholderPrefix,
          errors
        );
        const textStyle: Record<string, unknown> = {};
        if (textSlot) {
          const scale = textScaleForSlot(args.theme, textSlot);
          textStyle.fontSize = scale.size;
          textStyle.bold = scale.weight >= args.theme.type.weightBold;
        }
        const box = {
          wIn: placeholder.box.wIn,
          hIn: placeholder.box.hIn,
          placement: placeholder.box.placement,
          paddingPt: typeof paddingSlot !== "undefined" ? args.theme.spaceScale[paddingSlot] : undefined,
        };
        const leader = placeholder.leader || fillObj.leader ? ({
          style: "line" as const,
          endCap: "none" as const,
          startArrow: (fillObj.leader as any)?.startArrow ?? placeholder.leader?.startArrow,
          endArrow: (fillObj.leader as any)?.endArrow ?? placeholder.leader?.endArrow,
        }) : undefined;
        const regionId = contentRegionId ?? placeholder.id;
        const element: CalloutElement = {
          type: "callout",
          id: placeholder.id,
          region: regionId,
          anchor: toRegionAnchor(placeholder.anchor) as any,
          box: box as any,
          ...(contentObj
            ? { content: { text: contentObj.text, icon: contentObj.icon } }
            : {
                text: {
                  value: textValue,
                  style: Object.keys(textStyle).length > 0 ? (textStyle as any) : undefined,
                },
              }),
          leader,
          variant,
          z,
        };
        elements.push(element);
        continue;
      }

      if (placeholder.kind === "connector") {
        const connectorFill = fillObj;
        if (fill && !connectorFill) {
          continue;
        }
        if (connectorFill) {
          validateFillFields(
            connectorFill,
            new Set(["strokeSlot", "variant", "startArrow", "endArrow"]),
            placeholderPrefix,
            args.strict,
            errors
          );
          if (typeof connectorFill.variant !== "undefined" && !isVariant(connectorFill.variant)) {
            errors.push(`${placeholderPrefix} template_variant_invalid`);
          }
        }
        const variant = resolveVariantValue(connectorFill ?? undefined, placeholder.variant, placeholderPrefix, errors);
        if (!placeholder.start || !placeholder.end) {
          errors.push(`${placeholderPrefix} template_connector_definition_invalid`);
          continue;
        }
        const strokeSlot = resolveStrokeSlot(
          resolveSlot(connectorFill?.strokeSlot as any, placeholder.styleSlots?.stroke, template.defaultSlots?.stroke),
          placeholderPrefix,
          errors
        );
        const style: Record<string, unknown> = {};
        if (strokeSlot) {
          style.widthPt = strokeWidthForSlot(args.theme, strokeSlot);
        }
        const startArrow = connectorFill?.startArrow ?? placeholder.connectorStyle?.startArrow;
        const endArrow = connectorFill?.endArrow ?? placeholder.connectorStyle?.endArrow;
        if (typeof startArrow !== "undefined") {
          style.startArrow = startArrow;
        }
        if (typeof endArrow !== "undefined") {
          style.endArrow = endArrow;
        }
        const element: ConnectorElement = {
          type: "connector",
          id: placeholder.id,
          region: placeholder.id,
          start: toRegionAnchor(placeholder.start) as any,
          end: toRegionAnchor(placeholder.end) as any,
          style: Object.keys(style).length > 0 ? (style as any) : undefined,
          variant,
          z,
        };
        elements.push(element);
        continue;
      }
    }

    if (args.strict) {
      const allowedSlideFields = new Set(["id", "title", "template", "fills"]);
      for (const key of Object.keys(slide)) {
        if (!allowedSlideFields.has(key)) {
          errors.push(`${prefix} Unknown field '${key}'`);
        }
      }
    }

    compiledSlides.push({
      id: slide.id as string,
      title: slide.title as string,
      grid: templateGrid,
      regions,
      elements,
    });
  });

  const compiledSpec: SlideProgramSpec = {
    title: root.title as string,
    metadata: isPlainObject(root.metadata) ? (root.metadata as any) : undefined,
    theme: root.theme as any,
    styleTokens: root.styleTokens as any,
    slides: compiledSlides,
  };

  if (args.strict) {
    const allowedSpecFields = new Set(["title", "metadata", "slides", "theme", "styleTokens"]);
    for (const key of Object.keys(root)) {
      if (!allowedSpecFields.has(key)) {
        errors.push(`Unknown top-level field '${key}'`);
      }
    }
  }

  return { spec: errors.length > 0 ? null : compiledSpec, errors };
}
