import { generatedFrameworks, isoAssessmentReadiness } from "./generatedFrameworks";
import { assessmentDashboardData } from "./generatedDashboardData";
import { assessmentDomainSummaries } from "./generatedDomainSummaries";
import { generatedGaps } from "./generatedGaps";
import { generatedRisks } from "./generatedRisks";
import { generatedTasks } from "./generatedTasks";

const completedControls = assessmentDashboardData.controls.filter(
  (c) => c.status === "OK",
);
const openGaps = generatedGaps.filter((g) => g.status !== "Closed").length;
const criticalRisks = generatedRisks.filter((r) => r.severity === "Critical").length;

export const isoReadinessReport = {
  readiness: isoAssessmentReadiness,
  domainScores: assessmentDomainSummaries.map((summary) => ({
    id: summary.domain.id,
    name: summary.domain.name,
    shortName: summary.domain.shortName,
    score: summary.readiness,
    controls: summary.totalControls,
    openGaps: summary.openGaps,
    risks: summary.linkedRisks,
  })),
  controlsCompleted: completedControls.length,
  controlsTotal: assessmentDashboardData.controls.length,
  openGaps,
  criticalRisks,
  recommendedTasks: generatedTasks
    .filter((task) => task.status !== "Done")
    .slice(0, 8),
};

export const generatedReports = [
  {
    id: "rep-iso",
    name: "ISO 27001 Readiness Report",
    type: "Framework" as const,
    status: "Ready" as const,
    generated: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    owner: "Averonix",
    sections: [
      `Domain score summary (${isoReadinessReport.domainScores.length} domains)`,
      `${isoReadinessReport.controlsCompleted}/${isoReadinessReport.controlsTotal} controls completed`,
      `${openGaps} open gaps`,
      `${criticalRisks} critical risks`,
      `${isoReadinessReport.recommendedTasks.length} recommended tasks`,
    ],
  },
];
