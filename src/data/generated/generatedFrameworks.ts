import { assessmentDashboardData } from "./generatedDashboardData";
import { assessmentDomainSummaries } from "./generatedDomainSummaries";

const scoredControls = assessmentDashboardData.controls.filter(
  (control) => control.score !== null,
);
const completedControls = assessmentDashboardData.controls.filter(
  (control) => control.status === "OK",
);

export const isoAssessmentReadiness = scoredControls.length
  ? Math.round(
      scoredControls.reduce((sum, control) => sum + (control.score ?? 0), 0) /
        scoredControls.length,
    )
  : 0;

export const generatedFrameworks = [
  {
    id: "iso-27001",
    name: "ISO 27001:2022",
    shortName: "ISO 27001",
    description:
      "International standard for information security management systems (ISMS).",
    readiness: isoAssessmentReadiness,
    completed: completedControls.length,
    total: assessmentDashboardData.controls.length,
    status: "Continue" as const,
    category: "All" as const,
  },
];
