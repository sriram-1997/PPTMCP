import type { BBox, ChartElement, PreparedChartElement } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";

const CHART_MAX_CATEGORIES = 25;
const CHART_LONG_LABEL_THRESHOLD = 18;
const CHART_MIN_WIDTH_FOR_LONG_LABELS_INCHES = 6;

export function prepareChartElement(args: {
  slideIndex: number;
  elementIndex: number;
  element: ChartElement;
  bbox: BBox;
  z: number;
  order: number;
  id: string;
  allowDenseCharts: boolean;
  warnings: string[];
  hardErrors: string[];
}): PreparedChartElement {
  const content = args.element.content;

  if (args.bbox.width <= 0 || args.bbox.height <= 0) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: chart_data_invalid (chart region has non-positive size)`
    );
  }

  const categories = content.dataSeries[0]?.data.map((point) => point[0]) ?? [];
  const seriesData = content.dataSeries.map((series) => ({
    name: series.name,
    values: series.data.map((point) => point[1]),
  }));

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

  return {
    kind: "chart",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant: args.element.variant,
    bbox: args.bbox,
    chartType: content.chartType,
    title: content.title,
    categories,
    seriesData,
  };
}

export function renderChartElement(slide: any, element: PreparedChartElement, theme: ConcreteTheme): void {
  const chartData = element.seriesData.map((series) => ({
    name: series.name,
    labels: element.categories,
    values: series.values,
  }));
  const defaults = resolveElementStyleDefaults({ type: "chart", variant: element.variant }, theme);
  const chartFill = defaults.boxStyle?.fill ?? theme.chart.chartAreaFill;

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

