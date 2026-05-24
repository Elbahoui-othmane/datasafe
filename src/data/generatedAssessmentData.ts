import { assessmentDomains, defaultAssessmentSector } from "./assessmentDomains";
import {
  generateAssessmentSummary,
  generateDashboardDataFromAssessments,
} from "@/lib/assessment/generators";
import type { Control, Gap, Risk, Task } from "@/mocks/types";
import type {
  AssessmentControl,
  GeneratedGap,
  GeneratedRisk,
  GeneratedTask,
  Severity,
} from "@/lib/assessment/types";

export const assessmentDashboardData = generateDashboardDataFromAssessments(
  assessmentDomains,
  defaultAssessmentSector,
);

export const assessmentDomainSummaries = assessmentDomains.map((domain) =>
  generateAssessmentSummary(domain, defaultAssessmentSector),
);

function evidenceLabel(status: AssessmentControl["evidenceStatus"]): Control["evidence"] {
  if (status === "verified") return "Verified";
  if (status === "uploaded") return "Uploaded";
  if (status === "partial") return "Partial";
  return "Missing";
}

function taskStatus(status: GeneratedTask["status"]): Task["status"] {
  if (status === "Done") return "Closed";
  if (status === "Waiting evidence") return "Awaiting evidence";
  if (status === "In progress") return "In progress";
  return "Open";
}

function frameworkLabel(frameworkId: string) {
  return frameworkId === "iso-27001" ? "ISO 27001" : frameworkId;
}

function dueDateForSeverity(severity: Severity) {
  if (severity === "Critical") return "Jun 06, 2026";
  if (severity === "High") return "Jun 22, 2026";
  if (severity === "Medium") return "Jul 07, 2026";
  return "Jul 22, 2026";
}

export function toDashboardControl(control: AssessmentControl): Control {
  const testsTotal = Math.max(3, control.expectedEvidence.length + 2);
  const testsDone =
    control.score === null
      ? testsTotal
      : Math.round((control.score / 100) * testsTotal);

  return {
    id: control.id,
    name: control.title,
    description: control.description,
    owner: control.owner,
    frameworks: [control.frameworkId],
    testsDone,
    testsTotal,
    status: control.status,
    risk: control.riskLevel,
    evidence: evidenceLabel(control.evidenceStatus),
    domainId: control.domainId,
    domainName: control.domainName,
    frameworkId: control.frameworkId,
    frameworkName: control.frameworkName,
    controlCode: control.controlCode,
    question: control.question,
    category: control.category,
    score: control.score,
    evidenceStatus: control.evidenceStatus,
    expectedEvidence: control.expectedEvidence,
    evidenceRequirements: control.evidenceRequirements,
    severity: control.severity,
    riskLevel: control.riskLevel,
    weight: control.weight,
    source: control.source,
    appliesTo: control.appliesTo,
    linkedGaps: control.linkedGaps,
    linkedRisks: control.linkedRisks,
    linkedTasks: control.linkedTasks,
  };
}

export function toDashboardGap(gap: GeneratedGap): Gap {
  const control = assessmentDashboardData.controls.find(
    (item) => item.id === gap.controlId,
  );

  return {
    id: gap.id,
    title: gap.title,
    framework: "ISO 27001",
    frameworkId: gap.frameworkId,
    controlId: gap.controlId,
    severity: gap.severity,
    progress: gap.progress,
    status: gap.status,
    owner: gap.owner,
    linkedControl: control?.title ?? gap.controlId,
    dueDate: gap.dueDate,
    updated: "May 23, 2026",
    reason: gap.reason,
    requiredEvidence: gap.requiredEvidence,
    remediationSteps: [
      gap.nextAction,
      "Assign evidence owner",
      "Upload evidence to the control record",
      "Review readiness score",
    ],
    nextAction: gap.nextAction,
  };
}

export function toDashboardRisk(risk: GeneratedRisk): Risk {
  const control = assessmentDashboardData.controls.find(
    (item) => item.id === risk.linkedControlId,
  );

  return {
    id: risk.id,
    title: risk.title,
    category: risk.category,
    severity: risk.severity,
    score: risk.score,
    status: risk.status,
    owner: risk.owner,
    linkedControl: control?.title ?? risk.linkedControlId,
    linkedControlId: risk.linkedControlId,
    linkedFrameworkId: risk.linkedFrameworkId,
    lastReview: "May 23, 2026",
    nextReview: dueDateForSeverity(risk.severity),
    reason: risk.reason,
    impact: risk.impact,
    likelihood: risk.likelihood,
    treatment: risk.treatment,
    frameworks: [risk.linkedFrameworkId],
    dueDate: dueDateForSeverity(risk.severity),
  };
}

export function toDashboardTask(task: GeneratedTask): Task {
  const control = assessmentDashboardData.controls.find(
    (item) => item.id === task.linkedControlId,
  );

  return {
    id: task.id,
    title: task.title,
    framework: frameworkLabel(task.frameworkId),
    frameworkId: task.frameworkId,
    priority: task.priority,
    progress: task.progress,
    status: taskStatus(task.status),
    owner: task.owner,
    linkedControl: control?.title ?? task.linkedControlId,
    linkedControlId: task.linkedControlId,
    linkedGapId: task.linkedGapId,
    linkedRiskId: task.linkedRiskId,
    dueDate: task.dueDate,
    updated: "May 23, 2026",
    relatedGap: task.linkedGapId,
    summary: `Complete remediation work for ${control?.title ?? task.linkedControlId}.`,
    checklist: task.checklist.map((text, index) => ({
      id: `${task.id}-c${index + 1}`,
      text,
      done: index < Math.floor(task.checklist.length * (task.progress / 100)),
    })),
  };
}

export const generatedControls = assessmentDashboardData.controls.map(toDashboardControl);
export const generatedGaps = assessmentDashboardData.gaps.map(toDashboardGap);
export const generatedRisks = assessmentDashboardData.risks.map(toDashboardRisk);
export const generatedTasks = assessmentDashboardData.tasks.map(toDashboardTask);

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
  openGaps: generatedGaps.filter((gap) => gap.status !== "Closed").length,
  criticalRisks: generatedRisks.filter((risk) => risk.severity === "Critical").length,
  recommendedTasks: generatedTasks
    .filter((task) => task.status !== "Closed")
    .slice(0, 8),
};
