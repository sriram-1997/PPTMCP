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
  if (typeof element.emphasisColumn !== "undefined") {
    const emphasisColumn = element.emphasisColumn;
    if (typeof emphasisColumn !== "number" || !Number.isInteger(emphasisColumn) || emphasisColumn < 1) {
      errors.push(`${elemPrefix} table_emphasis_invalid`);
    } else if (expectedCols > 0 && emphasisColumn > expectedCols) {
      errors.push(`${elemPrefix} table_emphasis_invalid`);
    }
  }
  if (typeof element.rowStriping !== "undefined" && typeof element.rowStriping !== "boolean") {
    errors.push(`${elemPrefix} table_row_striping_invalid`);
  }
  if (typeof element.columnAlign !== "undefined") {
    if (!Array.isArray(element.columnAlign)) {
      errors.push(`${elemPrefix} table_alignment_invalid`);
    } else if (expectedCols > 0 && element.columnAlign.length !== expectedCols) {
      errors.push(`${elemPrefix} table_alignment_invalid`);
    } else {
      element.columnAlign.forEach((value) => {
        if (typeof value !== "string" || !["left", "center", "right"].includes(value)) {
          errors.push(`${elemPrefix} table_alignment_invalid`);
        }
      });
    }
  }
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

  if (strict) {
    const allowedTableFields = new Set([
      "type",
      "region",
      "content",
      "style",
      "emphasisColumn",
      "rowStriping",
      "columnAlign",
      "variant",
      "z",
    ]);
    for (const key of Object.keys(element)) {
      if (!allowedTableFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
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
  const overlaysRaw = element.overlays;
  const hasOverlays = typeof overlaysRaw !== "undefined";
  const overlays = isPlainObject(overlaysRaw) ? (overlaysRaw as Record<string, unknown>) : null;
  if (hasOverlays && !overlays) {
    errors.push(`${elemPrefix} chart_overlay_invalid`);
  }

  const chartType =
    typeof element.chartType === "string"
      ? element.chartType
      : isPlainObject(element.content) && typeof element.content.chartType === "string"
        ? (element.content.chartType as string)
        : null;

  if (!chartType) {
    errors.push(`${elemPrefix} chart_data_invalid (chartType must be a string)`);
    return;
  }

  if (chartType === "line") {
    if (!isPlainObject(element.data)) {
      errors.push(`${elemPrefix} chart_data_invalid (data must be an object)`);
      return;
    }
    const data = element.data as Record<string, unknown>;
    if (!Array.isArray(data.labels)) {
      errors.push(`${elemPrefix} chart_data_invalid (labels must be an array)`);
      return;
    }
    data.labels.forEach((label, idx) => {
      if (typeof label !== "string") {
        errors.push(`${elemPrefix} chart_data_invalid (label ${idx + 1} must be a string)`);
      }
    });
    if (!Array.isArray(data.series)) {
      errors.push(`${elemPrefix} chart_no_series`);
      return;
    }
    if (data.series.length === 0) {
      errors.push(`${elemPrefix} chart_no_series`);
      return;
    }
    const labels = data.labels;
    data.series.forEach((rawSeries, seriesIdx) => {
      if (!isPlainObject(rawSeries)) {
        errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} must be an object)`);
        return;
      }
      const series = rawSeries as Record<string, unknown>;
      if (typeof series.name !== "string") {
        errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} name must be a string)`);
      }
      if (!Array.isArray(series.values)) {
        errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} values must be an array)`);
        return;
      }
      if (series.values.length !== labels.length) {
        errors.push(`${elemPrefix} chart_data_length_mismatch`);
      }
      series.values.forEach((value) => {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          errors.push(`${elemPrefix} chart_invalid_value`);
        }
      });
    });

    if (strict) {
      const allowedChartFields = new Set([
        "type",
        "region",
        "chartType",
        "data",
        "options",
        "overlays",
        "title",
        "variant",
        "z",
      ]);
      for (const key of Object.keys(element)) {
        if (!allowedChartFields.has(key)) {
          errors.push(`${elemPrefix} Unknown field '${key}'`);
        }
      }
      const allowedDataFields = new Set(["labels", "series"]);
      for (const key of Object.keys(data)) {
        if (!allowedDataFields.has(key)) {
          errors.push(`${elemPrefix} Unknown chart data field '${key}'`);
        }
      }
      if (element.options) {
        if (!isPlainObject(element.options)) {
          errors.push(`${elemPrefix} chart_data_invalid (options must be an object)`);
        } else {
          const options = element.options as Record<string, unknown>;
          const allowedOptionFields = new Set(["showGrid", "showMarkers", "smooth", "yAxisZero"]);
          for (const key of Object.keys(options)) {
            if (!allowedOptionFields.has(key)) {
              errors.push(`${elemPrefix} Unknown chart options field '${key}'`);
            }
          }
          if (typeof options.showGrid !== "undefined" && typeof options.showGrid !== "boolean") {
            errors.push(`${elemPrefix} chart_data_invalid (options.showGrid must be boolean)`);
          }
          if (typeof options.showMarkers !== "undefined" && typeof options.showMarkers !== "boolean") {
            errors.push(`${elemPrefix} chart_data_invalid (options.showMarkers must be boolean)`);
          }
          if (typeof options.smooth !== "undefined" && typeof options.smooth !== "boolean") {
            errors.push(`${elemPrefix} chart_data_invalid (options.smooth must be boolean)`);
          }
          if (typeof options.yAxisZero !== "undefined" && typeof options.yAxisZero !== "boolean") {
            errors.push(`${elemPrefix} chart_data_invalid (options.yAxisZero must be boolean)`);
          }
        }
      }
    }
    if (hasOverlays) {
      const averageLine = overlays?.averageLine;
      const trendLine = overlays?.trendLine;
      if (typeof averageLine !== "undefined" && typeof averageLine !== "boolean") {
        errors.push(`${elemPrefix} chart_overlay_invalid`);
      }
      if (typeof trendLine !== "undefined" && typeof trendLine !== "boolean") {
        errors.push(`${elemPrefix} chart_overlay_invalid`);
      }
      if ((averageLine === true || trendLine === true) && labels.length < 2) {
        errors.push(`${elemPrefix} chart_overlay_invalid`);
      }
      if (strict && overlays) {
        const allowedOverlayFields = new Set(["averageLine", "trendLine"]);
        for (const key of Object.keys(overlays)) {
          if (!allowedOverlayFields.has(key)) {
            errors.push(`${elemPrefix} chart_overlay_invalid`);
          }
        }
      }
    }
    return;
  }

  if (hasOverlays) {
    errors.push(`${elemPrefix} chart_overlay_invalid`);
  }

  if (chartType !== "column") {
    errors.push(`${elemPrefix} chart_type_not_supported (only 'column' and 'line' are supported in v0.1)`);
    return;
  }

  if (!isPlainObject(element.content)) {
    errors.push(`${elemPrefix} chart_data_invalid (content must be an object)`);
    return;
  }
  const content = element.content as Record<string, unknown>;

  if (!Array.isArray(content.dataSeries)) {
    errors.push(`${elemPrefix} chart_data_invalid (dataSeries must be an array)`);
    return;
  }

  if (content.dataSeries.length === 0 || content.dataSeries.length > 2) {
    errors.push(`${elemPrefix} chart_series_limit_exceeded (1-2 series required, got ${content.dataSeries.length})`);
    return;
  }

  let expectedCategories: string[] | null = null;

  content.dataSeries.forEach((rawSeries: unknown, seriesIdx: number) => {
    if (!isPlainObject(rawSeries)) {
      errors.push(`${elemPrefix} chart_data_invalid (series ${seriesIdx + 1} must be an object)`);
      return;
    }

    const series = rawSeries as Record<string, unknown>;

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
    const allowedChartFields = new Set(["type", "region", "content", "chartType", "variant", "z", "title", "overlays"]);
    for (const key of Object.keys(element)) {
      if (!allowedChartFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateListElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[],
  nested: boolean
): void {
  if (!nested && ("x" in element || "y" in element || "w" in element || "h" in element)) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }
  if (typeof element.style !== "undefined" && !["dot", "number", "icon", "none"].includes(String(element.style))) {
    errors.push(`${elemPrefix} invalid_bullet_style`);
  }
  if (!Array.isArray(element.items) || element.items.length === 0) {
    errors.push(`${elemPrefix} list_items_invalid`);
  } else {
    element.items.forEach((item: unknown, idx: number) => {
      if (!isPlainObject(item)) {
        errors.push(`${elemPrefix} list_item_invalid (${idx + 1})`);
        return;
      }
      const text = (item as Record<string, unknown>).text;
      if (typeof text !== "string") {
        errors.push(`${elemPrefix} list_item_invalid (${idx + 1})`);
      }
    });
  }
  if (typeof element.bullet !== "undefined") {
    if (!isPlainObject(element.bullet)) {
      errors.push(`${elemPrefix} list_bullet_invalid`);
    } else {
      const bullet = element.bullet as Record<string, unknown>;
      if (typeof bullet.size !== "undefined" && !["sm", "md"].includes(String(bullet.size))) {
        errors.push(`${elemPrefix} list_bullet_invalid`);
      }
      if (typeof bullet.gap !== "undefined" && typeof bullet.gap !== "number") {
        errors.push(`${elemPrefix} list_bullet_invalid`);
      }
      if (typeof bullet.color !== "undefined" && !["text", "muted", "primary"].includes(String(bullet.color))) {
        errors.push(`${elemPrefix} list_bullet_invalid`);
      }
      if (element.style === "icon" && typeof bullet.icon !== "string") {
        errors.push(`${elemPrefix} icon_not_found`);
      }
      if (element.style === "icon" && typeof bullet.color !== "undefined") {
        if (!["text", "muted"].includes(String(bullet.color))) {
          errors.push(`${elemPrefix} list_icon_style_invalid`);
        }
      }
    }
  } else if (element.style === "icon") {
    errors.push(`${elemPrefix} icon_not_found`);
  }
  if (typeof element.indent !== "undefined") {
    if (!isPlainObject(element.indent)) {
      errors.push(`${elemPrefix} list_indent_invalid`);
    } else {
      const indent = element.indent as Record<string, unknown>;
      if (typeof indent.left !== "undefined" && typeof indent.left !== "number") {
        errors.push(`${elemPrefix} list_indent_invalid`);
      }
      if (typeof indent.hanging !== "undefined" && typeof indent.hanging !== "number") {
        errors.push(`${elemPrefix} list_indent_invalid`);
      }
    }
  }
  if (typeof element.lineGap !== "undefined" && typeof element.lineGap !== "number") {
    errors.push(`${elemPrefix} list_line_gap_invalid`);
  }

  if (strict) {
    const allowedFields = new Set(["type", "region", "style", "bullet", "indent", "lineGap", "items", "z"]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateNodeElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if ("x" in element || "y" in element || "w" in element || "h" in element) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }
  if (typeof element.id !== "string" || element.id.trim().length === 0) {
    errors.push(`${elemPrefix} node_id_invalid`);
  }
  if (element.shape !== "rounded-rect") {
    errors.push(`${elemPrefix} node_shape_invalid`);
  }
  if (typeof element.label !== "string") {
    errors.push(`${elemPrefix} node_label_invalid`);
  }
  if (typeof element.icon !== "undefined" && typeof element.icon !== "string") {
    errors.push(`${elemPrefix} node_icon_invalid`);
  }
  if (typeof element.paddingToken !== "undefined") {
    const paddingToken = element.paddingToken;
    if (typeof paddingToken !== "number" || !Number.isInteger(paddingToken) || paddingToken < 0 || paddingToken > 5) {
      errors.push(`${elemPrefix} node_padding_invalid`);
    }
  }
  if (strict) {
    const allowedFields = new Set([
      "type",
      "id",
      "region",
      "shape",
      "variant",
      "icon",
      "label",
      "paddingToken",
      "z",
    ]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateEdgeElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[],
  nodeIds: Set<string>
): void {
  if ("x" in element || "y" in element || "w" in element || "h" in element) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }
  if (typeof element.startNode !== "string" || element.startNode.trim().length === 0) {
    errors.push(`${elemPrefix} edge_node_not_found`);
  } else if (!nodeIds.has(element.startNode)) {
    errors.push(`${elemPrefix} edge_node_not_found`);
  }
  if (typeof element.endNode !== "string" || element.endNode.trim().length === 0) {
    errors.push(`${elemPrefix} edge_node_not_found`);
  } else if (!nodeIds.has(element.endNode)) {
    errors.push(`${elemPrefix} edge_node_not_found`);
  }
  if (typeof element.arrow !== "undefined" && !["none", "triangle"].includes(String(element.arrow))) {
    errors.push(`${elemPrefix} edge_arrow_invalid`);
  }
  if (
    typeof element.strokeSlot !== "undefined" &&
    !["stroke.thin", "stroke.normal", "stroke.heavy"].includes(String(element.strokeSlot))
  ) {
    errors.push(`${elemPrefix} edge_stroke_invalid`);
  }
  if (strict) {
    const allowedFields = new Set([
      "type",
      "id",
      "region",
      "startNode",
      "endNode",
      "arrow",
      "strokeSlot",
      "variant",
      "z",
    ]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateCardElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if ("x" in element || "y" in element || "w" in element || "h" in element) {
    errors.push(`${elemPrefix} absolute_position_forbidden`);
  }
  if (typeof element.variant !== "undefined" && !["surface", "elevated", "accent"].includes(String(element.variant))) {
    errors.push(`${elemPrefix} style_variant_invalid`);
  }
  if (typeof element.style !== "undefined") {
    if (!isPlainObject(element.style)) {
      errors.push(`${elemPrefix} card_style_invalid`);
    } else {
      const style = element.style as Record<string, unknown>;
      if (
        typeof style.bg !== "undefined" &&
        !["background", "surface", "elevated", "accent"].includes(String(style.bg))
      ) {
        errors.push(`${elemPrefix} card_style_invalid`);
      }
      if (typeof style.border !== "undefined" && !["default", "subtle", "none"].includes(String(style.border))) {
        errors.push(`${elemPrefix} card_style_invalid`);
      }
      if (typeof style.radius !== "undefined" && !["sm", "md", "lg"].includes(String(style.radius))) {
        errors.push(`${elemPrefix} card_style_invalid`);
      }
      if (typeof style.padding !== "undefined" && !["sm", "md", "lg"].includes(String(style.padding))) {
        errors.push(`${elemPrefix} card_style_invalid`);
      }
      if (typeof style.shadow !== "undefined" && !["none", "sm"].includes(String(style.shadow))) {
        errors.push(`${elemPrefix} card_style_invalid`);
      }
      if (typeof style.accent !== "undefined") {
        if (!isPlainObject(style.accent)) {
          errors.push(`${elemPrefix} card_style_invalid`);
        } else {
          const accent = style.accent as Record<string, unknown>;
          if (typeof accent.edge !== "undefined" && !["left", "top", "none"].includes(String(accent.edge))) {
            errors.push(`${elemPrefix} card_style_invalid`);
          }
          if (typeof accent.color !== "undefined" && accent.color !== "accent") {
            errors.push(`${elemPrefix} card_style_invalid`);
          }
          if (typeof accent.width !== "undefined") {
            if (typeof accent.width !== "number" || !Number.isFinite(accent.width) || accent.width <= 0) {
              errors.push(`${elemPrefix} card_style_invalid`);
            }
          }
        }
      }
    }
  }
  if (typeof element.header !== "undefined") {
    if (!isPlainObject(element.header)) {
      errors.push(`${elemPrefix} card_header_invalid`);
    } else {
      const header = element.header as Record<string, unknown>;
      if (typeof header.title !== "string") {
        errors.push(`${elemPrefix} card_header_invalid`);
      }
      if (typeof header.subtitle !== "undefined" && typeof header.subtitle !== "string") {
        errors.push(`${elemPrefix} card_header_invalid`);
      }
      if (typeof header.icon !== "undefined" && typeof header.icon !== "string") {
        errors.push(`${elemPrefix} card_header_invalid`);
      }
    }
  }
  if (!Array.isArray(element.body) || element.body.length === 0) {
    errors.push(`${elemPrefix} card_body_invalid`);
  } else {
    element.body.forEach((item: unknown, idx: number) => {
      const bodyPrefix = `${elemPrefix} Body ${idx + 1}:`;
      if (!isPlainObject(item)) {
        errors.push(`${bodyPrefix} card_body_invalid`);
        return;
      }
      const bodyItem = item as Record<string, unknown>;
      if (bodyItem.type !== "list") {
        errors.push(`${bodyPrefix} card_body_invalid`);
        return;
      }
      validateListElementSchema(bodyItem, bodyPrefix, strict, errors, true);
    });
  }
  if (typeof element.footer !== "undefined") {
    if (!isPlainObject(element.footer)) {
      errors.push(`${elemPrefix} card_footer_invalid`);
    } else {
      const footer = element.footer as Record<string, unknown>;
      if (typeof footer.strip !== "undefined" && typeof footer.strip !== "boolean") {
        errors.push(`${elemPrefix} card_footer_invalid`);
      }
      if (typeof footer.label !== "undefined" && typeof footer.label !== "string") {
        errors.push(`${elemPrefix} card_footer_invalid`);
      }
      if (typeof footer.text !== "undefined" && typeof footer.text !== "string") {
        errors.push(`${elemPrefix} card_footer_invalid`);
      }
    }
  }

  if (strict) {
    const allowedFields = new Set(["type", "region", "variant", "style", "header", "body", "footer", "z"]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
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

  const hasContent = typeof element.content !== "undefined";
  const hasText = typeof element.text !== "undefined";
  if (hasContent && hasText) {
    errors.push(`${elemPrefix} callout_content_invalid`);
  } else if (hasContent) {
    if (!isPlainObject(element.content)) {
      errors.push(`${elemPrefix} callout_content_invalid`);
    } else {
      const content = element.content as Record<string, unknown>;
      if (typeof content.text !== "string") {
        errors.push(`${elemPrefix} callout_content_invalid`);
      }
      if (typeof content.icon !== "undefined" && typeof content.icon !== "string") {
        errors.push(`${elemPrefix} callout_content_invalid`);
      }
      if (strict) {
        const allowedContentFields = new Set(["text", "icon"]);
        for (const key of Object.keys(content)) {
          if (!allowedContentFields.has(key)) {
            errors.push(`${elemPrefix} callout_content_invalid`);
          }
        }
      }
    }
  } else {
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
    const allowedFields = new Set(["type", "id", "region", "anchor", "box", "text", "content", "leader", "variant", "z"]);
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
  if (typeof element.opacity !== "undefined") {
    if (typeof element.opacity !== "number" || element.opacity < 0 || element.opacity > 1) {
      errors.push(`${elemPrefix} image_opacity_invalid`);
    }
  }
  if (typeof element.crop !== "undefined") {
    if (!isPlainObject(element.crop)) {
      errors.push(`${elemPrefix} image_crop_invalid`);
    } else {
      const crop = element.crop as Record<string, unknown>;
      const left = typeof crop.left === "number" ? crop.left : 0;
      const right = typeof crop.right === "number" ? crop.right : 0;
      const top = typeof crop.top === "number" ? crop.top : 0;
      const bottom = typeof crop.bottom === "number" ? crop.bottom : 0;
      const vals = [left, right, top, bottom];
      if (vals.some((value) => value < 0 || value > 1 || !Number.isFinite(value))) {
        errors.push(`${elemPrefix} image_crop_invalid`);
      }
      if (left + right >= 1 || top + bottom >= 1) {
        errors.push(`${elemPrefix} image_crop_invalid`);
      }
    }
  }
  if (typeof element.overlaySurfaceSlot !== "undefined") {
    if (
      typeof element.overlaySurfaceSlot !== "string" ||
      !["surface.background", "surface.surface", "surface.elevated", "surface.accent"].includes(element.overlaySurfaceSlot)
    ) {
      errors.push(`${elemPrefix} image_overlay_invalid`);
    }
  }
  if (typeof element.overlayOpacity !== "undefined") {
    if (typeof element.overlayOpacity !== "number" || element.overlayOpacity < 0 || element.overlayOpacity > 1) {
      errors.push(`${elemPrefix} image_overlay_invalid`);
    }
  }
  if (typeof element.borderRadiusPt !== "undefined") {
    if (typeof element.borderRadiusPt !== "number" || element.borderRadiusPt < 0) {
      errors.push(`${elemPrefix} image_border_radius_invalid`);
    }
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
    const allowedFields = new Set([
      "type",
      "id",
      "region",
      "src",
      "fit",
      "style",
      "variant",
      "opacity",
      "crop",
      "overlaySurfaceSlot",
      "overlayOpacity",
      "borderRadiusPt",
      "z",
    ]);
    for (const key of Object.keys(element)) {
      if (!allowedFields.has(key)) {
        errors.push(`${elemPrefix} Unknown field '${key}'`);
      }
    }
  }
}

function validateIconElementSchema(
  element: Record<string, unknown>,
  elemPrefix: string,
  strict: boolean,
  errors: string[]
): void {
  if (typeof element.name !== "string" || element.name.trim().length === 0) {
    errors.push(`${elemPrefix} icon_invalid`);
  }
  if (typeof element.sizeToken !== "number" || !Number.isInteger(element.sizeToken)) {
    errors.push(`${elemPrefix} icon_invalid`);
  }
  const colorSlot = element.colorSlot;
  if (
    typeof colorSlot !== "string" ||
    !["text.title", "text.subtitle", "text.body", "text.caption"].includes(colorSlot)
  ) {
    errors.push(`${elemPrefix} icon_invalid`);
  }
  if (typeof element.align !== "undefined" && !["left", "center", "right"].includes(String(element.align))) {
    errors.push(`${elemPrefix} icon_invalid`);
  }
  if (
    typeof element.verticalAlign !== "undefined" &&
    !["top", "middle", "bottom"].includes(String(element.verticalAlign))
  ) {
    errors.push(`${elemPrefix} icon_invalid`);
  }
  if (strict) {
    const allowedFields = new Set([
      "type",
      "id",
      "region",
      "name",
      "sizeToken",
      "colorSlot",
      "align",
      "verticalAlign",
      "z",
    ]);
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
    const nodeIds = new Set<string>();
    slide.elements.forEach((rawElement) => {
      if (!rawElement || typeof rawElement !== "object") {
        return;
      }
      const element = rawElement as Record<string, unknown>;
      if (element.type === "node" && typeof element.id === "string" && element.id.trim().length > 0) {
        if (nodeIds.has(element.id)) {
          errors.push(`${prefix} node_id_duplicate (${element.id})`);
        } else {
          nodeIds.add(element.id);
        }
      }
    });
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
      if (
        !["text", "list", "card", "table", "chart", "node", "edge", "callout", "connector", "image", "icon"].includes(
          element.type
        )
      ) {
        errors.push(`${elemPrefix} Unsupported element type '${element.type}'`);
        return;
      }
      if (
        ["text", "table", "chart", "node", "edge", "callout", "connector", "image", "icon"].includes(element.type) &&
        typeof element.variant !== "undefined" &&
        !isVariant(element.variant)
      ) {
        errors.push(`${elemPrefix} style_variant_invalid`);
      }
      if (typeof element.z !== "undefined" && !isInteger(element.z)) {
        errors.push(`${elemPrefix} layer_z_invalid`);
      }
      if (element.type === "text") {
        validateTextElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "list") {
        validateListElementSchema(element, elemPrefix, strict, errors, false);
      }
      if (element.type === "card") {
        validateCardElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "table") {
        validateTableElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "chart") {
        validateChartElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "node") {
        validateNodeElementSchema(element, elemPrefix, strict, errors);
      }
      if (element.type === "edge") {
        validateEdgeElementSchema(element, elemPrefix, strict, errors, nodeIds);
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
      if (element.type === "icon") {
        validateIconElementSchema(element, elemPrefix, strict, errors);
      }
      if (typeof element.region !== "string" || element.region.trim().length === 0) {
        errors.push(`${elemPrefix} Missing or invalid 'region'`);
        return;
      }
      if (!regions[element.region]) {
        errors.push(`${elemPrefix} Region '${element.region}' not found in slide regions`);
      }
      if (element.type === "text" && typeof element.content === "undefined") {
        errors.push(`${elemPrefix} Missing 'content'`);
      }
      if (element.type === "table" && typeof element.content === "undefined") {
        errors.push(`${elemPrefix} Missing 'content'`);
      }
      if (element.type === "chart" && typeof element.content === "undefined" && typeof element.data === "undefined") {
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

