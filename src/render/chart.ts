import type { BBox, ChartElement, PreparedChartElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import type { PreparedChartOverlayLine } from "./types.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { lineRectFromPoints } from "./connector.js";
import { ptToIn } from "./utils/units.js";

const CHART_MAX_CATEGORIES = 25;
const CHART_LONG_LABEL_THRESHOLD = 18;
const CHART_MIN_WIDTH_FOR_LONG_LABELS_INCHES = 6;
const GEOM_ROUND_FACTOR = 10000;

function roundGeom(value: number): number {
  return Math.round(value * GEOM_ROUND_FACTOR) / GEOM_ROUND_FACTOR;
}

function roundPoint(point: { x: number; y: number }): { x: number; y: number } {
  return { x: roundGeom(point.x), y: roundGeom(point.y) };
}

function resolvePlotArea(bbox: BBox, theme: ConcreteTheme): BBox {
  const left = ptToIn(theme.spaceScale[4] ?? theme.spaceScale[3] ?? 12);
  const right = ptToIn(theme.spaceScale[2] ?? theme.spaceScale[1] ?? 6);
  const top = ptToIn(theme.spaceScale[2] ?? theme.spaceScale[1] ?? 6);
  const bottom = ptToIn(theme.spaceScale[4] ?? theme.spaceScale[3] ?? 12);
  const width = bbox.width - left - right;
  const height = bbox.height - top - bottom;
  return {
    x: bbox.x + left,
    y: bbox.y + top,
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

function clipLineToRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
  rect: BBox
): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
  const x0 = start.x;
  const y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  const dx = x1 - x0;
  const dy = y1 - y0;

  let t0 = 0;
  let t1 = 1;

  const clip = (p: number, q: number) => {
    if (Math.abs(p) < 1e-9) {
      if (q < 0) {
        return false;
      }
      return true;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }
    return true;
  };

  if (
    !clip(-dx, x0 - rect.x) ||
    !clip(dx, rect.x + rect.width - x0) ||
    !clip(-dy, y0 - rect.y) ||
    !clip(dy, rect.y + rect.height - y0)
  ) {
    return null;
  }

  const clippedStart = { x: x0 + t0 * dx, y: y0 + t0 * dy };
  const clippedEnd = { x: x0 + t1 * dx, y: y0 + t1 * dy };
  return { start: clippedStart, end: clippedEnd };
}

export function prepareChartElement(args: {
  slideIndex: number;
  elementIndex: number;
  element: ChartElement;
  bbox: BBox;
  z: number;
  order: number;
  id: string;
  theme: ConcreteTheme;
  allowDenseCharts: boolean;
  warnings: string[];
  hardErrors: string[];
}): PreparedChartElement {
  if (args.bbox.width <= 0 || args.bbox.height <= 0) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (chart region has non-positive size)`
    );
  }

  const resolvedChartType = args.element.chartType ?? args.element.content?.chartType ?? "";
  let categories: string[] = [];
  let seriesData: { name: string; values: number[] }[] = [];
  let title: string | undefined = args.element.title ?? args.element.content?.title;
  let options: PreparedChartElement["options"] | undefined;
  let overlays: PreparedChartOverlayLine[] | undefined;

  if (resolvedChartType === "line") {
    const data = args.element.data;
    if (!data || !Array.isArray(data.labels)) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (labels must be an array)`
      );
    } else {
      categories = data.labels.map((label) => String(label));
    }
    if (!data || !Array.isArray(data.series) || data.series.length === 0) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_no_series`
      );
    } else {
      data.series.forEach((series) => {
        const values = Array.isArray(series.values) ? series.values : [];
        if (values.length !== categories.length) {
          args.hardErrors.push(
            `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_length_mismatch`
          );
        }
        const numericValues: number[] = [];
        values.forEach((value) => {
          if (typeof value !== "number" || !Number.isFinite(value)) {
            args.hardErrors.push(
              `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_invalid_value`
            );
          } else {
            numericValues.push(value);
          }
        });
        seriesData.push({ name: series.name ?? "", values: numericValues });
      });
    }

    options = {
      showGrid: args.element.options?.showGrid === true,
      showMarkers: args.element.options?.showMarkers === true,
      smooth: args.element.options?.smooth === true,
      yAxisZero: args.element.options?.yAxisZero === true,
    };

    if (args.element.overlays && (args.element.overlays.averageLine || args.element.overlays.trendLine)) {
      if (categories.length < 2) {
        args.hardErrors.push(
          `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
        );
      } else {
        const values = seriesData.flatMap((series) => series.values);
        if (values.length < 2) {
          args.hardErrors.push(
            `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
          );
        } else {
          let minVal = Math.min(...values);
          let maxVal = Math.max(...values);
          if (options?.yAxisZero === true) {
            minVal = Math.min(0, minVal);
            maxVal = Math.max(0, maxVal);
          }
          if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) {
            args.hardErrors.push(
              `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
            );
          } else {
            if (minVal === maxVal) {
              maxVal = minVal + 1;
            }
            const plotArea = resolvePlotArea(args.bbox, args.theme);
            if (plotArea.width <= 0 || plotArea.height <= 0) {
              args.hardErrors.push(
                `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
              );
            } else {
              const range = maxVal - minVal;
              const xForIndex = (index: number) => {
                if (categories.length <= 1) {
                  return plotArea.x + plotArea.width / 2;
                }
                return plotArea.x + (plotArea.width * index) / (categories.length - 1);
              };
              const yForValue = (value: number) => {
                const t = (value - minVal) / range;
                return plotArea.y + plotArea.height * (1 - t);
              };

              const overlayLines: PreparedChartOverlayLine[] = [];

              if (args.element.overlays.averageLine) {
                const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
                const y = yForValue(mean);
                const clipped = clipLineToRect(
                  { x: plotArea.x, y },
                  { x: plotArea.x + plotArea.width, y },
                  plotArea
                );
                if (clipped) {
                  overlayLines.push({
                    kind: "average",
                    start: roundPoint(clipped.start),
                    end: roundPoint(clipped.end),
                    style: {
                      color: args.theme.colors.primary,
                      widthPt: args.theme.strokeScale.thin,
                      dash: "solid",
                    },
                  });
                }
              }

              if (args.element.overlays.trendLine) {
                let sumX = 0;
                let sumY = 0;
                let sumXY = 0;
                let sumX2 = 0;
                let n = 0;
                seriesData.forEach((series) => {
                  series.values.forEach((value, idx) => {
                    const x = idx;
                    const y = value;
                    if (!Number.isFinite(y)) {
                      return;
                    }
                    sumX += x;
                    sumY += y;
                    sumXY += x * y;
                    sumX2 += x * x;
                    n += 1;
                  });
                });
                const denom = n * sumX2 - sumX * sumX;
                if (n < 2 || Math.abs(denom) < 1e-9) {
                  args.hardErrors.push(
                    `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
                  );
                } else {
                  const slope = (n * sumXY - sumX * sumY) / denom;
                  const intercept = (sumY - slope * sumX) / n;
                  const y0 = slope * 0 + intercept;
                  const yN = slope * (categories.length - 1) + intercept;
                  const start = { x: xForIndex(0), y: yForValue(y0) };
                  const end = { x: xForIndex(categories.length - 1), y: yForValue(yN) };
                  const clipped = clipLineToRect(start, end, plotArea);
                  if (clipped) {
                    overlayLines.push({
                      kind: "trend",
                      start: roundPoint(clipped.start),
                      end: roundPoint(clipped.end),
                      style: {
                        color: args.theme.colors.accent,
                        widthPt: args.theme.strokeScale.thin,
                        dash: "dash",
                      },
                    });
                  }
                }
              }

              overlays = overlayLines.length > 0 ? overlayLines : undefined;
            }
          }
        }
      }
    }
  } else {
    const content = args.element.content;
    if (!content) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (content missing)`
      );
    } else {
      categories = content.dataSeries[0]?.data.map((point) => point[0]) ?? [];
      seriesData = content.dataSeries.map((series) => ({
        name: series.name,
        values: series.data.map((point) => point[1]),
      }));
    }
  }

  if (resolvedChartType !== "line") {
    if (args.element.overlays) {
      args.hardErrors.push(
        `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_overlay_invalid`
      );
    }
    if (categories.length > CHART_MAX_CATEGORIES) {
      const message = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (category count ${categories.length} exceeds ${CHART_MAX_CATEGORIES})`;
      if (args.allowDenseCharts) {
        args.warnings.push(message);
      } else {
        args.hardErrors.push(message);
      }
    }

    const hasLongLabel = categories.some((label) => label.length > CHART_LONG_LABEL_THRESHOLD);
    if (hasLongLabel && args.bbox.width < CHART_MIN_WIDTH_FOR_LONG_LABELS_INCHES) {
      const message = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (long category labels require chart width >= ${CHART_MIN_WIDTH_FOR_LONG_LABELS_INCHES}in)`;
      if (args.allowDenseCharts) {
        args.warnings.push(message);
      } else {
        args.hardErrors.push(message);
      }
    }
  }

  return {
    kind: "chart",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant: args.element.variant,
    bbox: args.bbox,
    chartType: resolvedChartType,
    title,
    categories,
    seriesData,
    options,
    overlays,
  };
}

export function renderChartElement(slide: any, shapeType: any, element: PreparedChartElement, theme: ConcreteTheme): void {
  const chartData = element.seriesData.map((series) => ({
    name: series.name,
    labels: element.categories,
    values: series.values,
  }));
  const defaults = resolveElementStyleDefaults({ type: "chart", variant: element.variant }, theme);
  const chartFill = defaults.boxStyle?.fill ?? theme.chart.chartAreaFill;
  if (element.chartType === "line") {
    const showGrid = element.options?.showGrid === true;
    const showMarkers = element.options?.showMarkers === true;
    slide.addChart("line", chartData, {
      x: element.bbox.x,
      y: element.bbox.y,
      w: element.bbox.width,
      h: element.bbox.height,
      chartColors: theme.chart.palette,
      catAxisLabelColor: theme.chart.textColor,
      valAxisLabelColor: theme.chart.textColor,
      catAxisLineColor: theme.chart.axisColor,
      valAxisLineColor: theme.chart.axisColor,
      legendColor: theme.chart.textColor,
      valGridLine: showGrid ? { color: theme.chart.gridlineColor, style: "solid", size: 1 } : undefined,
      chartArea: { fill: { color: chartFill } },
      plotArea: { fill: { color: chartFill } },
      title: element.title || "",
      showLegend: element.seriesData.length > 1,
      legendPos: "b",
      lineSmooth: element.options?.smooth === true,
      lineDataSymbol: showMarkers ? "circle" : "none",
      valAxisMinVal: element.options?.yAxisZero === true ? 0 : undefined,
    });
  } else {
    slide.addChart("bar", chartData, {
      x: element.bbox.x,
      y: element.bbox.y,
      w: element.bbox.width,
      h: element.bbox.height,
      barDir: "col",
      chartColors: theme.chart.palette,
      catAxisLabelColor: theme.chart.textColor,
      valAxisLabelColor: theme.chart.textColor,
      catAxisLineColor: theme.chart.axisColor,
      valAxisLineColor: theme.chart.axisColor,
      legendColor: theme.chart.textColor,
      valGridLine: { color: theme.chart.gridlineColor, style: "solid", size: 1 },
      chartArea: { fill: { color: chartFill } },
      plotArea: { fill: { color: chartFill } },
      title: element.title || "",
      showLegend: element.seriesData.length > 1,
      legendPos: "b",
    });
  }

  if (element.overlays && element.overlays.length > 0) {
    element.overlays.forEach((overlay) => {
      const rect = lineRectFromPoints(overlay.start, overlay.end);
      slide.addShape(shapeType.line, {
        x: rect.rect.x,
        y: rect.rect.y,
        w: rect.rect.width,
        h: rect.rect.height,
        flipV: rect.flipV,
        flipH: rect.flipH,
        line: {
          color: overlay.style.color,
          width: overlay.style.widthPt,
          dash: overlay.style.dash === "dash" ? "dash" : "solid",
        },
      });
    });
  }
}

