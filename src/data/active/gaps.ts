import { isAssessmentMode } from "@/config/dataSource";
import { generatedGaps } from "@/data/generated/generatedGaps";
import { mockGaps, mockEvidenceGaps } from "@/data/mock/mockGaps";
import { normalizeGap } from "./normalize";

const normalized = generatedGaps.map(normalizeGap);
export const gaps = isAssessmentMode() ? normalized : mockGaps;
export const evidenceGaps = isAssessmentMode()
  ? normalized.reduce(
      (acc, gap) => {
        const key = gap.severity.toLowerCase() as Lowercase<typeof gap.severity>;
        acc[key] += 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 },
    )
  : mockEvidenceGaps;
export const assessmentGaps = generatedGaps;
