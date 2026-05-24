import { assessmentDomains, defaultAssessmentSector } from "@/data/assessmentDomains";
import { generateDashboardDataFromAssessments } from "@/lib/assessment/generators";

export const assessmentDashboardData = generateDashboardDataFromAssessments(
  assessmentDomains,
  defaultAssessmentSector,
);
