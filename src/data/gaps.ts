import { gaps as mockGaps } from "@/mocks/data";
import { generatedGaps } from "./generatedAssessmentData";
import type { Severity } from "@/mocks/types";

export const assessmentGaps = generatedGaps;
export const gaps = [...mockGaps, ...assessmentGaps];

export const evidenceGaps = gaps.reduce(
  (acc, gap) => {
    const key = gap.severity.toLowerCase() as Lowercase<Severity>;
    acc[key] += 1;
    return acc;
  },
  { critical: 0, high: 0, medium: 0, low: 0 },
);
