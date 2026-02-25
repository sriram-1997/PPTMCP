import type { BBox } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { EPSILON_INCHES, ptToIn, roundInches } from "./utils/units.js";

export type FlowKind = "chevron" | "card";

export interface FlowStep {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

export interface FlowLayout {
  steps: FlowStep[];
  gapX: number;
  stepW: number;
  stepH: number;
  contentBox: BBox;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

export function computeFlowLayout(args: {
  region: BBox;
  count: number;
  orientation?: "horizontal";
  kind: FlowKind;
  layoutProfile?: "flow.chevron" | "flow.card";
  theme: ConcreteTheme;
}): FlowLayout {
  const count = Math.max(1, Math.floor(args.count));
  const orientation = args.orientation ?? "horizontal";
  if (orientation !== "horizontal") {
    throw new Error("flow_orientation_invalid");
  }

  const region = args.region;
  const profileKey =
    args.layoutProfile ?? (args.kind === "chevron" ? "flow.chevron" : "flow.card");

  let gapX = 0;
  let stepW = 0;
  let stepH = 0;
  let overlapX = 0;

  if (profileKey === "flow.chevron") {
    const profile = args.theme.flowProfiles.flowChevron;
    const overlapRatio = profile.overlapRatio;
    const denom = count - (count - 1) * overlapRatio;
    if (denom <= 0) {
      throw new Error("flow_overlap_invalid");
    }
    stepW = region.width / denom;
    overlapX = stepW * overlapRatio;
    gapX = -overlapX;
    const unclampedH = region.height * profile.stepHeightRatio;
    stepH = clamp(unclampedH, 0, region.height);
  } else {
    const profile = args.theme.flowProfiles.flowCard;
    const arrowSizeIn = ptToIn(profile.connectorArrowSizePt);
    const gapRaw = Math.max(profile.gapXIn, arrowSizeIn + EPSILON_INCHES);
    const maxGap = 0.12 * (region.width / count);
    gapX = clamp(gapRaw, 0.03, maxGap);
    const availableW = region.width - (count - 1) * gapX;
    stepW = availableW / count;
    const unclampedH = region.height * profile.stepHeightRatio;
    stepH = clamp(unclampedH, profile.minStepHIn, region.height);
  }

  const stepY = region.y + (region.height - stepH) / 2;

  const steps: FlowStep[] = [];
  for (let i = 0; i < count; i += 1) {
    const stepX = profileKey === "flow.chevron" ? region.x + i * (stepW - overlapX) : region.x + i * (stepW + gapX);
    steps.push({
      x: roundInches(stepX),
      y: roundInches(stepY),
      width: roundInches(stepW),
      height: roundInches(stepH),
      index: i,
    });
  }

  let content: BBox = { x: region.x, y: region.y, width: 0, height: 0 };
  if (steps.length > 0) {
    const first = steps[0];
    const last = steps[steps.length - 1];
    content = {
      x: first.x,
      y: first.y,
      width: roundInches(last.x + last.width - first.x),
      height: roundInches(stepH),
    };
  }

  return {
    steps,
    gapX: roundInches(gapX),
    stepW: roundInches(stepW),
    stepH: roundInches(stepH),
    contentBox: content,
  };
}
