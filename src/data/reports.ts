import { reports as mockReports } from "@/mocks/data";
import { isoReadinessReport } from "./generatedAssessmentData";

export const reports = mockReports.map((report) =>
  report.id === "rep-iso"
    ? {
        ...report,
        status: "Ready" as const,
        generated: "May 23, 2026",
        sections: [
          `Domain score summary (${isoReadinessReport.domainScores.length} domains)`,
          `${isoReadinessReport.controlsCompleted}/${isoReadinessReport.controlsTotal} controls completed`,
          `${isoReadinessReport.openGaps} open gaps`,
          `${isoReadinessReport.criticalRisks} critical risks`,
          `${isoReadinessReport.recommendedTasks.length} recommended tasks`,
        ],
      }
    : report,
);

export { isoReadinessReport };
