import { frameworks as mockFrameworks } from "@/mocks/data";
import {
  assessmentDashboardData,
  isoAssessmentReadiness,
} from "./generatedAssessmentData";

const isoCompleted = assessmentDashboardData.controls.filter(
  (control) => control.status === "OK",
).length;
const isoTotal = assessmentDashboardData.controls.length;

export const frameworks = mockFrameworks.map((framework) =>
  framework.id === "iso-27001"
    ? {
        ...framework,
        readiness: isoAssessmentReadiness,
        completed: isoCompleted,
        total: isoTotal,
        status: "Continue" as const,
      }
    : framework,
);
