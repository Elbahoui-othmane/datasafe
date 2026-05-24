import type {
  AssessmentAnswer,
  ControlStatus,
  EvidenceStatus,
} from "./types";

export const IMPLEMENTATION_SCORES: Record<AssessmentAnswer, number | null> = {
  implemented: 100,
  mostly_implemented: 75,
  partially_implemented: 50,
  planned: 25,
  not_implemented: 0,
  not_applicable: null,
};

export const EVIDENCE_SCORES: Record<EvidenceStatus, number> = {
  verified: 100,
  uploaded: 80,
  partial: 50,
  missing: 0,
};

export function calculateControlScore(
  answer: AssessmentAnswer | undefined,
  evidenceStatus: EvidenceStatus,
  severity: string,
  weight: number,
): number | null {
  const implementationScore = answer ? IMPLEMENTATION_SCORES[answer] : 0;
  if (implementationScore === null) return null;

  const evidenceScore = EVIDENCE_SCORES[evidenceStatus];
  const score = implementationScore * 0.7 + evidenceScore * 0.3;

  void severity;
  void weight;

  return Math.round(score);
}

export function getControlStatus(
  score: number | null,
  severity?: string,
  answer?: AssessmentAnswer,
): ControlStatus {
  if (severity?.toLowerCase() === "critical" && answer === "not_implemented") {
    return "Failed";
  }

  if (score === null) return "OK";
  if (score >= 85) return "OK";
  if (score >= 60) return "Needs attention";
  if (score >= 35) return "In progress";
  return "Failed";
}
