import type {
  AssessmentAnswer,
  AssessmentControl,
  AssessmentResponse,
  GeneratedDashboardData,
  GeneratedGap,
  GeneratedRisk,
  GeneratedTask,
  RawAssessmentDomain,
  Severity,
} from "./types";
import {
  DEFAULT_SECTOR,
  normalizeText,
  transformDomainToControls,
} from "./transform";

const BASE_DATE = new Date(Date.UTC(2026, 4, 23));

function addDays(days: number) {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isWeakAnswer(answer: AssessmentAnswer) {
  return (
    answer === "planned" ||
    answer === "partially_implemented" ||
    answer === "not_implemented"
  );
}

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function mentionsAny(control: AssessmentControl, terms: string[]) {
  const text = normalizeText(
    `${control.title} ${control.question} ${control.description} ${control.expectedEvidence.join(" ")}`,
  );
  return terms.some((term) => text.includes(normalizeText(term)));
}

function titleForGap(control: AssessmentControl) {
  if (
    control.evidenceStatus === "missing" ||
    control.evidenceStatus === "partial"
  ) {
    if (mentionsAny(control, ["perimetre", "scope", "smsi", "isms"])) {
      return "Missing evidence for ISMS scope definition";
    }
    if (mentionsAny(control, ["actif", "asset", "inventory", "inventaire"])) {
      return "Incomplete information asset inventory";
    }
    if (mentionsAny(control, ["third party", "tiers", "fournisseur"])) {
      return "Third-party dependencies not documented";
    }
    return `Missing evidence for ${lowerFirst(control.title)}`;
  }

  return `Incomplete ${lowerFirst(control.title)}`;
}

function nextActionForControl(control: AssessmentControl) {
  if (mentionsAny(control, ["perimetre", "scope", "smsi", "isms"])) {
    return "Create and approve an ISMS scope statement";
  }
  if (mentionsAny(control, ["actif", "asset", "inventory", "inventaire"])) {
    return "Build and validate the information asset inventory";
  }
  if (mentionsAny(control, ["third party", "tiers", "fournisseur"])) {
    return "Document third-party dependencies and review ownership";
  }
  if (mentionsAny(control, ["access", "acces", "admin", "compte"])) {
    return "Review access control records and collect evidence";
  }
  if (mentionsAny(control, ["incident"])) {
    return "Update the incident process and collect approval evidence";
  }
  if (mentionsAny(control, ["backup", "sauvegarde", "recovery"])) {
    return "Run a recovery test and attach the test record";
  }
  return `Collect evidence and remediate ${lowerFirst(control.title)}`;
}

function progressFromScore(score: number | null) {
  if (score === null) return 100;
  if (score < 35) return 15;
  if (score < 60) return 45;
  if (score < 85) return 72;
  return 100;
}

export function generateGapFromControl(
  control: AssessmentControl,
  answer = control.answer,
): GeneratedGap | null {
  const score = control.score ?? 100;
  const evidenceMissing = control.evidenceStatus === "missing";
  const evidencePartial = control.evidenceStatus === "partial";
  const evidenceWeak = evidenceMissing || evidencePartial;

  // Only generate a gap when the control truly needs attention.
  // Do not generate gaps for low/medium severity controls that are mostly implemented with evidence.
  const shouldGenerate =
    (control.severity === "Critical" && (score < 85 || evidenceMissing)) ||
    (control.severity === "High" && isWeakAnswer(answer)) ||
    (answer === "not_implemented") ||
    (answer === "planned" && (control.severity === "Critical" || control.severity === "High")) ||
    (answer === "partially_implemented" && evidenceMissing) ||
    (evidenceMissing && (control.severity === "Critical" || control.severity === "High"));

  if (!shouldGenerate || answer === "not_applicable") return null;

  let status: GeneratedGap["status"] = "Closed";
  if (score < 35) status = "Open";
  else if (score < 60) status = "In remediation";
  else if (score >= 60 && evidenceWeak) status = "Awaiting evidence";

  return {
    id: `GAP-${control.id}`,
    sourceType: "assessment",
    sourceDomainId: control.sourceDomainId,
    sourceQuestionId: control.sourceQuestionId,
    sourceControlCode: control.sourceControlCode,
    title: titleForGap(control),
    frameworkId: "iso-27001",
    controlId: control.id,
    severity: control.severity,
    status,
    owner: control.owner,
    progress: progressFromScore(control.score),
    reason:
      evidenceWeak
        ? `${control.title} has incomplete evidence for ISO 27001 readiness.`
        : `${control.title} is not fully implemented for the selected sector.`,
    requiredEvidence: control.expectedEvidence,
    nextAction: nextActionForControl(control),
    dueDate:
      control.severity === "Critical"
        ? addDays(14)
        : control.severity === "High"
          ? addDays(30)
          : addDays(45),
  };
}

function riskTitleForControl(control: AssessmentControl) {
  if (mentionsAny(control, ["perimetre", "scope", "smsi", "isms"])) {
    return "Undefined ISMS scope";
  }
  if (mentionsAny(control, ["critical asset", "actifs critiques", "asset", "actif"])) {
    return "Unknown critical assets";
  }
  if (mentionsAny(control, ["third party", "tiers", "fournisseur"])) {
    return "Unmapped third-party dependencies";
  }
  if (mentionsAny(control, ["sensitive", "sensible", "personal data", "donnee"])) {
    return "Sensitive data locations not identified";
  }
  return `${control.title} exposure`;
}

function riskScore(severity: Severity, score: number | null) {
  if (severity === "Critical") return score !== null && score < 35 ? 94 : 86;
  if (severity === "High") return 78;
  if (severity === "Medium") return 58;
  return 34;
}

export function generateRiskFromControl(
  control: AssessmentControl,
  answer = control.answer,
): GeneratedRisk | null {
  const score = control.score ?? 100;
  const weakAnswer = isWeakAnswer(answer);
  const criticalAreas = mentionsAny(control, [
    "third party", "tiers", "fournisseur",
    "critical asset", "actifs critiques",
    "sensitive", "sensible", "personal data", "donnee",
    "access", "acces", "compte", "admin", "incident",
    "scope", "perimetre", "smsi", "isms",
  ]);
  const shouldGenerate =
    (control.severity === "Critical" && score < 60) ||
    (control.severity === "Critical" && weakAnswer) ||
    (control.severity === "High" && score < 35) ||
    (criticalAreas && weakAnswer);

  if (!shouldGenerate || answer === "not_applicable") return null;

  return {
    id: `RSK-${control.id}`,
    sourceType: "assessment",
    sourceDomainId: control.sourceDomainId,
    sourceQuestionId: control.sourceQuestionId,
    sourceControlCode: control.sourceControlCode,
    title: riskTitleForControl(control),
    category: control.category,
    severity: control.severity,
    score: riskScore(control.severity, control.score),
    status: control.severity === "Critical" ? "In treatment" : "Identified",
    owner: control.owner,
    impact:
      control.severity === "Critical"
        ? "Severe"
        : control.severity === "High"
          ? "Major"
          : "Moderate",
    likelihood: score < 35 ? "Likely" : "Possible",
    reason: `${control.title} is weak enough to expose ${lowerFirst(control.category)} risk.`,
    linkedControlId: control.id,
    linkedFrameworkId: "iso-27001",
    treatment: "Mitigate",
  };
}

function taskTitleForControl(control: AssessmentControl) {
  if (mentionsAny(control, ["perimetre", "scope", "smsi", "isms"])) {
    return "Create and approve ISMS scope statement";
  }
  if (mentionsAny(control, ["asset", "actif", "inventory", "inventaire"])) {
    return "Build information asset inventory";
  }
  if (mentionsAny(control, ["third party", "tiers", "fournisseur"])) {
    return "Map third-party dependencies";
  }
  if (
    control.evidenceStatus === "missing" ||
    control.evidenceStatus === "partial"
  ) {
    return `Collect evidence for ${lowerFirst(control.title)}`;
  }
  return `Remediate ${lowerFirst(control.title)}`;
}

function checklistForControl(control: AssessmentControl) {
  if (mentionsAny(control, ["perimetre", "scope", "smsi", "isms"])) {
    return [
      "List included systems and services",
      "Identify exclusions and justification",
      "Draft scope statement",
      "Review with management",
      "Mark evidence as uploaded",
    ];
  }
  if (mentionsAny(control, ["asset", "actif", "inventory", "inventaire"])) {
    return [
      "Export current asset list",
      "Assign owners for critical assets",
      "Classify information assets",
      "Review inventory with IT",
      "Attach inventory evidence",
    ];
  }
  if (mentionsAny(control, ["third party", "tiers", "fournisseur"])) {
    return [
      "List third-party services",
      "Map data and access dependencies",
      "Confirm vendor owners",
      "Record security review status",
      "Upload dependency evidence",
    ];
  }
  if (mentionsAny(control, ["access", "acces", "admin", "compte"])) {
    return [
      "Export access records",
      "Review privileged users",
      "Remediate excessive permissions",
      "Collect reviewer sign-off",
      "Update evidence status",
    ];
  }
  return [
    "Confirm control owner",
    "Document current implementation",
    "Remediate missing steps",
    "Collect required evidence",
    "Review and close",
  ];
}

export function generateTaskFromGap(
  gap: GeneratedGap,
  control?: AssessmentControl,
  risk?: GeneratedRisk,
): GeneratedTask {
  const title = control ? taskTitleForControl(control) : gap.nextAction;
  const status: GeneratedTask["status"] =
    gap.status === "Closed"
      ? "Done"
      : gap.status === "Awaiting evidence"
        ? "Waiting evidence"
        : gap.status === "In remediation"
          ? "In progress"
          : "To do";

  return {
    id: `TSK-${gap.controlId}`,
    sourceType: "assessment",
    sourceDomainId: gap.sourceDomainId,
    sourceQuestionId: gap.sourceQuestionId,
    sourceControlCode: gap.sourceControlCode,
    title,
    priority: risk?.severity ?? gap.severity,
    status,
    owner: gap.owner,
    progress: gap.progress,
    linkedControlId: gap.controlId,
    linkedGapId: gap.id,
    linkedRiskId: risk?.id,
    frameworkId: "iso-27001",
    dueDate: gap.dueDate,
    checklist: control ? checklistForControl(control) : [gap.nextAction],
  };
}

export function generateDashboardDataFromAssessment(
  domain: RawAssessmentDomain,
  sector = DEFAULT_SECTOR,
  answers: Record<string, Partial<AssessmentResponse>> = {},
): GeneratedDashboardData {
  const controls = transformDomainToControls(domain, sector, answers);
  const gaps = controls
    .map((control) => generateGapFromControl(control))
    .filter((gap): gap is GeneratedGap => Boolean(gap));
  const risks = controls
    .map((control) => generateRiskFromControl(control))
    .filter((risk): risk is GeneratedRisk => Boolean(risk));
  // Group gaps by domain to reduce duplicate tasks
  const domainGapMap = new Map<string, GeneratedGap[]>();
  for (const gap of gaps) {
    const key = gap.sourceDomainId;
    if (!domainGapMap.has(key)) domainGapMap.set(key, []);
    domainGapMap.get(key)!.push(gap);
  }

  const tasks: GeneratedTask[] = [];
  for (const [, domainGaps] of domainGapMap) {
    // Use the first gap as primary, merge others into its checklist
    const primary = domainGaps[0];
    const control = controls.find((item) => item.id === primary.controlId);
    const risk = risks.find((item) => item.linkedControlId === primary.controlId);
    const task = generateTaskFromGap(primary, control, risk);
    // Append checklist items from related gaps
    for (const other of domainGaps.slice(1)) {
      const otherControl = controls.find((item) => item.id === other.controlId);
      if (otherControl) {
        task.checklist.push(
          ...checklistForControl(otherControl).filter(
            (item) => !task.checklist.includes(item),
          ),
        );
      }
    }
    tasks.push(task);
  }

  const controlsWithLinks = controls.map((control) => ({
    ...control,
    linkedGaps: gaps
      .filter((gap) => gap.controlId === control.id)
      .map((gap) => gap.id),
    linkedRisks: risks
      .filter((risk) => risk.linkedControlId === control.id)
      .map((risk) => risk.id),
    linkedTasks: tasks
      .filter((task) => task.linkedControlId === control.id)
      .map((task) => task.id),
  }));

  return {
    controls: controlsWithLinks,
    gaps,
    risks,
    tasks,
  };
}

export function generateDashboardDataFromAssessments(
  domains: RawAssessmentDomain[],
  sector = DEFAULT_SECTOR,
  answers: Record<string, Partial<AssessmentResponse>> = {},
): GeneratedDashboardData {
  return domains.reduce<GeneratedDashboardData>(
    (acc, domain) => {
      const data = generateDashboardDataFromAssessment(domain, sector, answers);
      acc.controls.push(...data.controls);
      acc.gaps.push(...data.gaps);
      acc.risks.push(...data.risks);
      acc.tasks.push(...data.tasks);
      return acc;
    },
    { controls: [], gaps: [], risks: [], tasks: [] },
  );
}

export function generateAssessmentSummary(
  domain: RawAssessmentDomain,
  sector = DEFAULT_SECTOR,
) {
  const data = generateDashboardDataFromAssessment(domain, sector);
  const scoredControls = data.controls.filter((control) => control.score !== null);
  const readiness = scoredControls.length
    ? Math.round(
        scoredControls.reduce((sum, control) => sum + (control.score ?? 0), 0) /
          scoredControls.length,
      )
    : 0;

  return {
    domain: domain.domain,
    sector,
    readiness,
    totalControls: data.controls.length,
    openGaps: data.gaps.filter((gap) => gap.status !== "Closed").length,
    linkedRisks: data.risks.length,
    controls: data.controls,
    gaps: data.gaps,
    risks: data.risks,
    tasks: data.tasks,
  };
}
