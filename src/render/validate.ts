import type { Slide, ValidationReportEntry, ValidationAction, TextStyle, TableStyle } from "./types.js";
import { roundInches } from "./utils/units.js";
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value);
}

function isVariant(value: unknown): boolean {
  return value === "surface" || value === "elevated" || value === "accent";
}

function validateTextElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (typeof element.content !== "string") {
    errors.push(`${elemPrefix} Text content must be a string`);
  }
  if (typeof element.style === "undefined") {
    return;
  }
  if (!isPlainObject(element.style)) {
    errors.push(`${elemPrefix} Text style must be an object`);
    return;
  }

  const style = element.style;
  if (typeof style.fontSize !== "undefined" && typeof style.fontSize !== "number") {
    errors.push(`${elemPrefix} style.fontSize must be a number`);
  }
  if (typeof style.minFont !== "undefined" && typeof style.minFont !== "number") {
    errors.push(`${elemPrefix} style.minFont must be a number`);
  }
  if (typeof style.bold !== "undefined" && typeof style.bold !== "boolean") {
    errors.push(`${elemPrefix} style.bold must be a boolean`);
  }
  if (typeof style.italic !== "undefined" && typeof style.italic !== "boolean") {
    errors.push(`${elemPrefix} style.italic must be a boolean`);
  }
  if (typeof style.color !== "undefined" && typeof style.color !== "string") {
    errors.push(`${elemPrefix} style.color must be a string`);
  }
  if (typeof style.align !== "undefined" && !["left", "center", "right", "justify"].includes(String(style.align))) {
    errors.push(`${elemPrefix} style.align must be one of left|center|right|justify`);
  }
  if (
    typeof style.verticalAlign !== "undefined" &&
    !["top", "middle", "bottom"].includes(String(style.verticalAlign))
  ) {
    errors.push(`${elemPrefix} style.verticalAlign must be one of top|middle|bottom`);
  }
  if (typeof style.fit !== "undefined" && !["none", "shrink"].includes(String(style.fit))) {
    errors.push(`${elemPrefix} style.fit must be one of none|shrink`);
  }
  if (typeof style.paddingPt !== "undefined" && typeof style.paddingPt !== "number") {
    errors.push(`${elemPrefix} style.paddingPt must be a number`);
  }
  if (typeof style.lineHeight !== "undefined" && typeof style.lineHeight !== "number") {
    errors.push(`${elemPrefix} style.lineHeight must be a number`);
  }

  if (strict) {
    const allowedStyleFields = new Set([
      "fontSize",
      "bold",
      "italic",
      "color",
      "align",
      "verticalAlign",
      "fit",
      "minFont",
      "paddingPt",
      "lineHeight",
    ]);
    for (const key of Object.keys(style)) {
      if (!allowedStyleFields.has(key)) {
        errors.push(`${elemPrefix} Unknown text style field '${key}'`);
      }
    }
  }
}

function validateTableElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (!isPlainObject(element.content)) {
    errors.push(`${elemPrefix} Table content must be an object`);
    return;
  }
  const content = element.content;

  if (!Array.isArray(content.headers) || content.headers.length === 0) {
    errors.push(`${elemPrefix} Table headers must be a non-empty array`);
  } else {
    content.headers.forEach((header, headerIdx) => {
      if (typeof header !== "string") {
        errors.push(`${elemPrefix} Table header ${headerIdx + 1} must be a string`);
      }
    });
  }

  if (!Array.isArray(content.rows)) {
    errors.push(`${elemPrefix} Table rows must be an array`);
    return;
  }

  const expectedCols = Array.isArray(content.headers) ? content.headers.length : 0;
  content.rows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) {
      errors.push(`${elemPrefix} Table row ${rowIdx + 1} must be an array`);
      return;
    }
    if (expectedCols > 0 && row.length !== expectedCols) {
      errors.push(
        `${elemPrefix} Table row ${rowIdx + 1} has ${row.length} cells, expected ${expectedCols}`
      );
    }
    row.forEach((cell, cellIdx) => {
      if (typeof cell === "string") {
        return;
      }
      if (typeof cell === "number" || typeof cell === "boolean") {
        errors.push(
          `${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} must be string/object; convert numeric/boolean values to strings`
        );
        return;
      }
      if (!isPlainObject(cell)) {
        errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} is invalid`);
        return;
      }

      if ("rowSpan" in cell || "colSpan" in cell) {
        errors.push(
          `${elemPrefix} table_cell_merge_not_supported at r${rowIdx + 1}c${cellIdx + 1} (rowSpan/colSpan)`
        );
      }

      if (typeof cell.text !== "string") {
        errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} requires string 'text'`);
      }

      if (typeof cell.style !== "undefined") {
        if (!isPlainObject(cell.style)) {
          errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} style must be object`);
        } else {
          const cellStyle = cell.style;
          if (typeof cellStyle.bold !== "undefined" && typeof cellStyle.bold !== "boolean") {
            errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} style.bold must be boolean`);
          }
          if (typeof cellStyle.color !== "undefined" && typeof cellStyle.color !== "string") {
            errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} style.color must be string`);
          }
          if (strict) {
            const allowedCellStyleFields = new Set(["bold", "color"]);
            for (const key of Object.keys(cellStyle)) {
              if (!allowedCellStyleFields.has(key)) {
                errors.push(
                  `${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} unknown style field '${key}'`
                );
              }
            }
          }
        }
      }

      if (strict) {
        const allowedCellFields = new Set(["text", "style"]);
        for (const key of Object.keys(cell)) {
          if (!allowedCellFields.has(key) && key !== "rowSpan" && key !== "colSpan") {
            errors.push(`${elemPrefix} Table cell r${rowIdx + 1}c${cellIdx + 1} unknown field '${key}'`);
          }
        }
      }
    });
  });

  if (typeof element.style !== "undefined") {
    if (!isPlainObject(element.style)) {
      errors.push(`${elemPrefix} Table style must be an object`);
    } else {
      const style = element.style;
      if (typeof style.borderColor !== "undefined" && typeof style.borderColor !== "string") {
        errors.push(`${elemPrefix} Table style.borderColor must be string`);
      }
      if (typeof style.borderWidth !== "undefined" && typeof style.borderWidth !== "number") {
        errors.push(`${elemPrefix} Table style.borderWidth must be number`);
      }
      if (typeof style.headerColor !== "undefined" && typeof style.headerColor !== "string") {
        errors.push(`${elemPrefix} Table style.headerColor must be string`);
      }
      if (typeof style.headerTextColor !== "undefined" && typeof style.headerTextColor !== "string") {
        errors.push(`${elemPrefix} Table style.headerTextColor must be string`);
      }
      if (typeof style.fit !== "undefined" && !["none", "shrink"].includes(String(style.fit))) {
        errors.push(`${elemPrefix} Table style.fit must be one of none|shrink`);
      }
      if (typeof style.minFont !== "undefined" && typeof style.minFont !== "number") {
        errors.push(`${elemPrefix} Table style.minFont must be number`);
      }
      if (typeof style.fontSize !== "undefined" && typeof style.fontSize !== "number") {
        errors.push(`${elemPrefix} Table style.fontSize must be number`);
      }
      if (typeof style.headerFontSize !== "undefined" && typeof style.headerFontSize !== "number") {
        errors.push(`${elemPrefix} Table style.headerFontSize must be number`);
      }
      if (typeof style.cellPaddingPt !== "undefined" && typeof style.cellPaddingPt !== "number") {
        errors.push(`${elemPrefix} Table style.cellPaddingPt must be number`);
      }
      if (typeof style.lineHeight !== "undefined" && typeof style.lineHeight !== "number") {
        errors.push(`${elemPrefix} Table style.lineHeight must be number`);
      }

      if (strict) {
        const allowedTableStyleFields = new Set([
          "borderColor",
          "borderWidth",
          "headerColor",
          "headerTextColor",
          "fit",
          "minFont",
          "fontSize",
          "headerFontSize",
          "cellPaddingPt",
          "lineHeight",
        ]);
        for (const key of Object.keys(style)) {
          if (!allowedTableStyleFields.has(key)) {
            errors.push(`${elemPrefix} Unknown table style field '${key}'`);
          }
        }
      }
    }
  }

  if (strict) {
    const allowedTableContentFields = new Set(["headers", "rows"]);
    for (const key of Object.keys(content)) {
      if (!allowedTableContentFields.has(key)) {
        errors.push(`${elemPrefix} Unknown table content field '${key}'`);
      }
    }
  }
}

function validateChartElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (!isPlainObject(element.content)) {
    errors.push(`${elemPrefix} chart_data_invalid (content must be an object)`);
    return;
  }
  const content = element.content;

  // Validate chartType
  if (typeof content.chartType !== "string") {
    errors.push(`${elemPrefix} chart_data_invalid (chartType must be a string)`);
    return;
  }

  if (content.chartType !== "column") {
    errors.push(`${elemPrefix} chart_type_not_supported (only 'column' is supported in v0)`);
    return;
  }

  // Validate dataSeries
  if (!Array.isArray(content.dataSeries)) {
    errors.push(`${elemPrefix} chart_data_invalid (dataSeries must be an array)`);
    return;
  }

  if (content.dataSeries.length === 0 || content.dataSeries.length > 2) {
    errors.push(`${elemPrefix} chart_series_limit_exceeded (1-2 series required, got ${content.dataSeries.length})`);
    return;
  }

  // Validate series structure and alignment
  let expectedCategories: string[] | null = null;

  content.dataSeries.forEach((rawSeries: unknown, seriesIdx: number) => {
    if (!isPlainObject(rawSeries)) {
      errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} must be an object)`);
      return;
    }

    const series = rawSeries;

    if (typeof series.name !== "string") {
      errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} name must be a string)`);
    }

    if (!Array.isArray(series.data)) {
      errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} data must be an array)`);
      return;
    }

    if (series.data.length === 0) {
      errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} data is empty)`);
      return;
    }

    const categories: string[] = [];

    series.data.forEach((point: unknown, pointIdx: number) => {
      if (!Array.isArray(point) || point.length !== 2) {
        errors.push(
          `${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} data point ${pointIdx + 1} must be [label, value])`
        );
        return;
      }

      const [label, value] = point;
      if (typeof label !== "string") {
        errors.push(
          `${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} data point ${pointIdx + 1} label must be string)`
        );
      }
      if (typeof value !== "number") {
        errors.push(
          `${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} data point ${pointIdx + 1} value must be number)`
        );
      }

      if (typeof label === "string") {
        categories.push(label);
      }
    });

    // Validate category alignment across series
    if (seriesIdx === 0) {
      expectedCategories = categories;
    } else if (expectedCategories && JSON.stringify(categories) !== JSON.stringify(expectedCategories)) {
      errors.push(
        `${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} categories do not align with series 1)`
      );
    }
  });

  if (strict) {
    const allowedChartContentFields = new Set(["chartType", "title", "dataSeries"]);
    for (const key of Object.keys(content)) {
      if (!allowedChartContentFields.has(key)) {
        errors.push(`${elemPrefix} Unknown chart content field '${key}'`);
      }
    }
  }
}

function validateRegionAnchorSchema(
  anchor: Record<string, unknown>,
  elemPrefix: string,
  errors: string[]
): void {
  const type = anchor.type;
  if (type !== "region") {
    errors.push(`${elemPrefix} anchor_type_not_supported`);
    return;
  }
  if (typeof anchor.targetRegion !== "string" || anchor.targetRegion.trim().length === 0) {
    errors.push(`${elemPrefix} anchor_region_not_found`);
  }
  if (typeof anchor.point !== "string" || !["n", "ne", "e", "se", "s", "sw", "w", "nw", "center"].includes(anchor.point)) {
    errors.push(`${elemPrefix} anchor_point_invalid`);
  }
  if (typeof anchor.dxPt !== "undefined" && typeof anchor.dxPt !== "number") {
    errors.push(`${elemPrefix} anchor_dx_invalid`);
  }
  if (typeof anchor.dyPt !== "undefined" && typeof anchor.dyPt !== "number") {
    errors.push(`${elemPrefix} anchor_dy_invalid`);
  }
}

function validateCalloutElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if ("x" in element || "y" in element || "w" in element || "h" in element) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }

  if (!isPlainObject(element.anchor)) {
    errors.push(`${elemPrefix} anchor_type_not_supported`);
  } else {
    validateRegionAnchorSchema(element.anchor, elemPrefix, errors);
  }

  if (!isPlainObject(element.box)) {
    errors.push(`${elemPrefix} callout_missing_box_dims`);
  } else {
    const box = element.box as Record<string, unknown>;
    if (typeof box.wIn !== "number" || typeof box.hIn !== "number") {
      errors.push(`${elemPrefix} callout_missing_box_dims`);
    }
    if (typeof box.placement !== "string") {
      errors.push(`${elemPrefix} callout_placement_invalid`);
    }
    if (
      typeof box.placement === "string" &&
      !["auto", "ne", "nw", "se", "sw", "n", "s", "e", "w"].includes(box.placement)
    ) {
      errors.push(`${elemPrefix} callout_placement_invalid`);
    }
    if ("x" in box || "y" in box || "w" in box || "h" in box) {
      errors.push(`${elemPrefix} absolute_position_forbidden`);
    }
    if (typeof box.paddingPt !== "undefined" && typeof box.paddingPt !== "number") {
      errors.push(`${elemPrefix} callout_box_padding_invalid`);
    }
  }

  if (!isPlainObject(element.text)) {
    errors.push(`${elemPrefix} callout_text_invalid`);
  } else {
    const text = element.text as Record<string, unknown>;
    if (typeof text.value !== "string") {
      errors.push(`${elemPrefix} callout_text_invalid`);
    }
    if (typeof text.style !== "undefined" && !isPlainObject(text.style)) {
      errors.push(`${elemPrefix} callout_text_style_invalid`);
    }
  }

  if (typeof element.leader !== "undefined") {
    if (!isPlainObject(element.leader)) {
      errors.push(`${elemPrefix} callout_leader_style_not_supported`);
    } else {
      const leader = element.leader as Record<string, unknown>;
      if (leader.style !== "line") {
        errors.push(`${elemPrefix} callout_leader_style_not_supported`);
      }
      if (typeof leader.endCap !== "undefined" && leader.endCap !== "none") {
        errors.push(`${elemPrefix} callout_leader_endcap_not_supported`);
      }
      if (typeof leader.startArrow !== "undefined" && !["none", "triangle"].includes(String(leader.startArrow))) {
        errors.push(`${elemPrefix} callout_leader_arrow_invalid`);
      }
      if (typeof leader.endArrow !== "undefined" && !["none", "triangle"].includes(String(leader.endArrow))) {
        errors.push(`${elemPrefix} callout_leader_arrow_invalid`);
      }
    }
  }

  if (strict) {
    const allowedFields = new Set(["type", "id", "region", "anchor", "box", "text", "leader", "variant", "z"]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateConnectorElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if ("x" in element || "y" in element || "w" in element || "h" in element) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }

  if (!isPlainObject(element.start)) {
    errors.push(`${elemPrefix} anchor_type_not_supported`);
  } else {
    validateRegionAnchorSchema(element.start, elemPrefix, errors);
  }
  if (!isPlainObject(element.end)) {
    errors.push(`${elemPrefix} anchor_type_not_supported`);
  } else {
    validateRegionAnchorSchema(element.end, elemPrefix, errors);
  }

  if (element.style && !isPlainObject(element.style)) {
    errors.push(`${elemPrefix} connector_style_invalid`);
  } else if (element.style) {
    const style = element.style as Record<string, unknown>;
    if (typeof style.widthPt !== "undefined" && typeof style.widthPt !== "number") {
      errors.push(`${elemPrefix} connector_style_invalid`);
    }
    if (typeof style.color !== "undefined" && typeof style.color !== "string") {
      errors.push(`${elemPrefix} connector_style_invalid`);
    }
    if (
      typeof style.startArrow !== "undefined" &&
      !["none", "triangle"].includes(String(style.startArrow))
    ) {
      errors.push(`${elemPrefix} connector_arrow_invalid`);
    }
    if (
      typeof style.endArrow !== "undefined" &&
      !["none", "triangle"].includes(String(style.endArrow))
    ) {
      errors.push(`${elemPrefix} connector_arrow_invalid`);
    }
  }

  if (strict) {
    const allowedFields = new Set(["type", "id", "region", "start", "end", "style", "variant", "z"]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateImageElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (typeof element.src !== "string" || element.src.trim().length === 0) {
    errors.push(`${elemPrefix} image_not_found`);
  }
  if (typeof element.fit !== "string" || !["contain", "cover"].includes(element.fit)) {
    errors.push(`${elemPrefix} image_fit_invalid`);
  }
  if (typeof element.style !== "undefined") {
    if (!isPlainObject(element.style)) {
      errors.push(`${elemPrefix} image_style_invalid`);
    } else {
      const style = element.style as Record<string, unknown>;
      if (typeof style.borderColor !== "undefined" && typeof style.borderColor !== "string") {
        errors.push(`${elemPrefix} image_style_invalid`);
      }
      if (typeof style.borderWidthPt !== "undefined" && typeof style.borderWidthPt !== "number") {
        errors.push(`${elemPrefix} image_style_invalid`);
      }
      if (strict) {
        const allowedImageStyleFields = new Set(["borderColor", "borderWidthPt"]);
        for (const key of Object.keys(style)) {
          if (!allowedImageStyleFields.has(key)) {
            errors.push(`${elemPrefix} image_style_invalid`);
          }
        }
      }
    }
  }
  if (strict) {
    const allowedFields = new Set(["type", "id", "region", "src", "fit", "style", "variant", "z"]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

export function validateSpec(spec: unknown, strict: boolean): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!spec || typeof spec !== "object") {
    return { valid: false, errors: ["Spec must be a JSON object"] };
  }
  const root = spec as Record<string, unknown>;

  if (typeof root.title !== "string" || root.title.trim().length === 0) {
    errors.push("Missing or invalid top-level 'title' field");
  }
  if (typeof root.theme !== "undefined") {
    if (typeof root.theme === "string") {
      if (root.theme.trim().length === 0) {
        errors.push("theme_name_invalid");
      }
    } else if (!isPlainObject(root.theme)) {
      errors.push("theme_invalid_type");
    } else {
      const themeObj = root.theme as Record<string, unknown>;
      if (typeof themeObj.name !== "string" || themeObj.name.trim().length === 0) {
        errors.push("theme_name_invalid");
      }
      if (typeof themeObj.overrides !== "undefined" && !isPlainObject(themeObj.overrides)) {
        errors.push("theme_overrides_invalid_type");
      }
    }
  }
  if (typeof root.styleTokens !== "undefined" && !isPlainObject(root.styleTokens)) {
    errors.push("style_tokens_invalid_type");
  }
  if (!Array.isArray(root.slides)) {
    errors.push("Missing or invalid 'slides' array");
    return { valid: false, errors };
  }
  if (root.slides.length === 0) {
    errors.push("Slides array is empty");
  }

  root.slides.forEach((rawSlide, slideIdx) => {
    const prefix = `Slide ${slideIdx + 1}:`;
    if (!rawSlide || typeof rawSlide !== "object") {
      errors.push(`${prefix} invalid slide object`);
      return;
    }
    const slide = rawSlide as Record<string, unknown>;
    if (typeof slide.id !== "string" || slide.id.trim().length === 0) {
      errors.push(`${prefix} Missing or invalid 'id'`);
    }
    if (typeof slide.title !== "string" || slide.title.trim().length === 0) {
      errors.push(`${prefix} Missing or invalid 'title'`);
    }
    if (!slide.grid || typeof slide.grid !== "object") {
      errors.push(`${prefix} Missing or invalid 'grid'`);
      return;
    }
    const grid = slide.grid as Record<string, unknown>;
    const cols = Number(grid.cols);
    const rows = Number(grid.rows);
    const gutter = Number(grid.gutter);
    if (!Number.isFinite(cols) || cols <= 0) {
      errors.push(`${prefix} grid.cols must be positive`);
    }
    if (!Number.isFinite(rows) || rows <= 0) {
      errors.push(`${prefix} grid.rows must be positive`);
    }
    if (!Number.isFinite(gutter) || gutter < 0) {
      errors.push(`${prefix} grid.gutter must be non-negative`);
    }

    if (!slide.regions || typeof slide.regions !== "object" || Array.isArray(slide.regions)) {
      errors.push(`${prefix} Missing or invalid 'regions'`);
      return;
    }
    const regions = slide.regions as Record<string, unknown>;
    for (const [regionName, rawRegion] of Object.entries(regions)) {
      if (!rawRegion || typeof rawRegion !== "object") {
        errors.push(`${prefix} Region '${regionName}' is not an object`);
        continue;
      }
      const region = rawRegion as Record<string, unknown>;
      const col = Number(region.col);
      const row = Number(region.row);
      const colSpan = Number(region.colSpan);
      const rowSpan = Number(region.rowSpan);
      if (!Number.isFinite(col) || col < 0) {
        errors.push(`${prefix} Region '${regionName}' invalid 'col'`);
      }
      if (!Number.isFinite(row) || row < 0) {
        errors.push(`${prefix} Region '${regionName}' invalid 'row'`);
      }
      if (!Number.isFinite(colSpan) || colSpan <= 0) {
        errors.push(`${prefix} Region '${regionName}' invalid 'colSpan'`);
      }
      if (!Number.isFinite(rowSpan) || rowSpan <= 0) {
        errors.push(`${prefix} Region '${regionName}' invalid 'rowSpan'`);
      }
      if (Number.isFinite(cols) && Number.isFinite(col) && Number.isFinite(colSpan) && col + colSpan > cols) {
        errors.push(`${prefix} Region '${regionName}' exceeds grid columns`);
      }
      if (Number.isFinite(rows) && Number.isFinite(row) && Number.isFinite(rowSpan) && row + rowSpan > rows) {
        errors.push(`${prefix} Region '${regionName}' exceeds grid rows`);
      }
    }

    if (!Array.isArray(slide.elements)) {
      errors.push(`${prefix} Missing or invalid 'elements' array`);
      return;
    }
    slide.elements.forEach((rawElement, elementIdx) => {
      const elemPrefix = `${prefix} Element ${elementIdx + 1}:`;
      if (!rawElement || typeof rawElement !== "object") {
        errors.push(`${elemPrefix} invalid element object`);
        return;
      }
      const element = rawElement as Record<string, unknown>;
      if (typeof element.type !== "string") {
        errors.push(`${elemPrefix} Missing or invalid 'type'`);
        return;
      }
      if (!["text", "table", "chart", "callout", "connector", "image"].includes(element.type)) {
        errors.push(`${elemPrefix} Unsupported element type '${element.type}'`);
        return;
      }
      if (typeof element.variant !== "undefined" && !isVariant(element.variant)) {
        errors.push(`${elemPrefix} style_variant_invalid`);
      }
      if (typeof element.z !== "undefined" && !isInteger(element.z)) {
        errors.push(`${elemPrefix} layer_z_invalid`);
      }
      if (element.type === "text") {
        validateTextElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "table") {
        validateTableElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "chart") {
        validateChartElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "callout") {
        validateCalloutElementSchema(element, elemPrefix, strict, errors);
        const anchor = (element.anchor as Record<string, unknown>) || {};
        if (typeof anchor.targetRegion === "string" && !regions[anchor.targetRegion]) {
          errors.push(`${elemPrefix} anchor_region_not_found`);
        }
      }
      if (element.type === "connector") {
        validateConnectorElementSchema(element, elemPrefix, strict, errors);
        const start = (element.start as Record<string, unknown>) || {};
        const end = (element.end as Record<string, unknown>) || {};
        if (typeof start.targetRegion === "string" && !regions[start.targetRegion]) {
          errors.push(`${elemPrefix} anchor_region_not_found`);
        }
        if (typeof end.targetRegion === "string" && !regions[end.targetRegion]) {
          errors.push(`${elemPrefix} anchor_region_not_found`);
        }
      }
      if (element.type === "image") {
        validateImageElementSchema(element, elemPrefix, strict, errors);
      }
      if (typeof element.region !== "string" || element.region.trim().length === 0) {
        errors.push(`${elemPrefix} Missing or invalid 'region'`);
        return;
      }
      if (!regions[element.region]) {
        errors.push(`${elemPrefix} Region '${element.region}' not found in slide regions`);
      }
      if (["text", "table", "chart"].includes(element.type) && typeof element.content === "undefined") {
        errors.push(`${elemPrefix} Missing 'content'`);
      }
    });

    if (strict) {
      const allowedSlideFields = new Set(["id", "title", "grid", "regions", "elements"]);
      for (const key of Object.keys(slide)) {
        if (!allowedSlideFields.has(key)) {
          errors.push(`${prefix} Unknown field '${key}'`);
        }
      }
    }
  });

  if (strict) {
    const allowedSpecFields = new Set(["title", "metadata", "slides", "theme", "styleTokens"]);
    for (const key of Object.keys(root)) {
      if (!allowedSpecFields.has(key)) {
        errors.push(`Unknown top-level field '${key}'`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function addValidationEntry(args: {
  report: ValidationReportEntry[];
  slideIndex: number;
  slide: Slide;
  elementIndex: number;
  elementType: "text" | "table";
  region: string;
  estimate: { overflowWidth: boolean; overflowHeight: boolean; requiredWidthPt: number; requiredHeightPt: number; availableWidthPt: number; availableHeightPt: number };
  minFont: number;
  appliedFont: number;
  action: ValidationAction;
  details: string;
}): ValidationReportEntry {
  const entry: ValidationReportEntry = {
    slide_index: args.slideIndex + 1,
    slide_id: args.slide.id,
    slide_title: args.slide.title,
    element_index: args.elementIndex + 1,
    element_type: args.elementType,
    region: args.region,
    overflow: {
      width: args.estimate.overflowWidth,
      height: args.estimate.overflowHeight,
      required_width_in: roundInches(args.estimate.requiredWidthPt / 72),
      required_height_in: roundInches(args.estimate.requiredHeightPt / 72),
      available_width_in: roundInches(args.estimate.availableWidthPt / 72),
      available_height_in: roundInches(args.estimate.availableHeightPt / 72),
    },
    min_font: args.minFont,
    applied_font: args.appliedFont,
    action_taken: args.action,
    details: args.details,
  };
  args.report.push(entry);
  return entry;
}

export function buildOverflowMessage(entry: ValidationReportEntry): string {
  const widthPart = entry.overflow.width
    ? `required width ${entry.overflow.required_width_in}in exceeds ${entry.overflow.available_width_in}in`
    : "";
  const heightPart = entry.overflow.height
    ? `required height ${entry.overflow.required_height_in}in exceeds ${entry.overflow.available_height_in}in`
    : "";
  const dims = [widthPart, heightPart].filter(Boolean).join("; ");
  return `Slide ${entry.slide_index} element ${entry.element_index} (${entry.element_type}, region '${entry.region}') overflow: ${dims}. Increase region rowSpan, split into two regions, or reduce text.`;
}

