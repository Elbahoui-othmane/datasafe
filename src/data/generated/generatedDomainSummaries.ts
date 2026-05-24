import { assessmentDomains, defaultAssessmentSector } from "@/data/assessmentDomains";
import { generateAssessmentSummary } from "@/lib/assessment/generators";

export const assessmentDomainSummaries = assessmentDomains.map((domain) =>
  generateAssessmentSummary(domain, defaultAssessmentSector),
);
