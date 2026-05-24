import type { AssessmentControl, GeneratedGap, GeneratedRisk, GeneratedTask } from "@/lib/assessment/types";
import type { Control, Gap, Risk, Task } from "@/mocks/types";

export function normalizeControl(c: AssessmentControl): Control {
  return {
    id: c.id,
    name: c.title,
    description: c.description,
    owner: c.owner,
    frameworks: [c.frameworkId],
    testsDone: c.score ?? 0,
    testsTotal: 100,
    status: c.status,
    risk: c.riskLevel,
    evidence: c.evidenceStatus === "verified" ? "Verified" : c.evidenceStatus === "uploaded" ? "Uploaded" : c.evidenceStatus === "partial" ? "Partial" : "Missing",
    domainId: c.domainId,
    domainName: c.domainName,
    frameworkId: c.frameworkId,
    frameworkName: c.frameworkName,
    controlCode: c.controlCode,
    question: c.question,
    category: c.category,
    score: c.score,
    severity: c.severity,
    riskLevel: c.riskLevel,
    weight: c.weight,
    source: c.source,
    appliesTo: c.appliesTo,
    expectedEvidence: c.expectedEvidence,
    evidenceRequirements: c.evidenceRequirements,
    linkedGaps: c.linkedGaps,
    linkedRisks: c.linkedRisks,
    linkedTasks: c.linkedTasks,
  };
}

export function normalizeGap(g: GeneratedGap): Gap {
  return {
    id: g.id,
    title: g.title,
    framework: `ISO 27001:2022`,
    severity: g.severity,
    progress: g.progress,
    status: g.status,
    owner: g.owner,
    linkedControl: g.controlId,
    dueDate: g.dueDate,
    updated: g.dueDate,
    reason: g.reason,
    requiredEvidence: g.requiredEvidence,
    remediationSteps: [],
    frameworkId: g.frameworkId,
    controlId: g.controlId,
    nextAction: g.nextAction,
  };
}

export function normalizeRisk(r: GeneratedRisk): Risk {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    severity: r.severity,
    score: r.score,
    status: r.status === "Monitoring" ? "Monitoring" : r.status === "Accepted" ? "Accepted" : r.status === "In treatment" ? "In treatment" : "Identified",
    owner: r.owner,
    linkedControl: "",
    lastReview: "",
    nextReview: "",
    reason: r.reason,
    impact: r.impact,
    likelihood: r.likelihood,
    treatment: r.treatment,
    frameworks: [r.linkedFrameworkId],
    dueDate: "",
    linkedControlId: r.linkedControlId,
    linkedFrameworkId: r.linkedFrameworkId,
  };
}

export function normalizeTask(t: GeneratedTask): Task {
  return {
    id: t.id,
    title: t.title,
    framework: "ISO 27001:2022",
    priority: t.priority,
    progress: t.progress,
    status: t.status === "To do" ? "Open" : t.status === "Done" ? "Closed" : t.status === "Waiting evidence" ? "Awaiting evidence" : "In progress",
    owner: t.owner,
    linkedControl: "",
    dueDate: t.dueDate,
    updated: t.dueDate,
    summary: t.title,
    checklist: t.checklist.map((c, i) => ({ id: `c${i}`, text: c, done: false })),
    frameworkId: t.frameworkId,
    linkedControlId: t.linkedControlId,
    linkedGapId: t.linkedGapId,
    linkedRiskId: t.linkedRiskId,
  };
}
