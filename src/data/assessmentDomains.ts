import d1 from "./assessments/raw/averonix_d1_assessment.json";
import d2 from "./assessments/raw/averonix_d2_assessment.json";
import d3 from "./assessments/raw/averonix_d3_assessment.json";
import d4 from "./assessments/raw/averonix_d4_assessment.json";
import d5 from "./assessments/raw/averonix_d5_assessment.json";
import d6 from "./assessments/raw/averonix_d6_assessment.json";
import d7 from "./assessments/raw/averonix_d7_assessment.json";
import d8 from "./assessments/raw/averonix_d8_assessment.json";
import d9 from "./assessments/raw/averonix_d9_assessment.json";
import type { RawAssessmentDomain } from "@/lib/assessment/types";

export const assessmentDomains = [
  d1,
  d2,
  d3,
  d4,
  d5,
  d6,
  d7,
  d8,
  d9,
] as RawAssessmentDomain[];

export const defaultAssessmentSector = "saas";

export const iso27001AssessmentDomains = assessmentDomains;
