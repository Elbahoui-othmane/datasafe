import type {
  AnswerOption,
  AssessmentAnswer,
  AssessmentControl,
  AssessmentResponse,
  CompanySector,
  EvidenceRequirement,
  EvidenceStatus,
  EvidenceType,
  RawAssessmentDomain,
  RawAssessmentQuestion,
  RiskLevel,
  Severity,
} from "./types";
import { calculateControlScore, getControlStatus } from "./scoring";

export const DEFAULT_SECTOR = "saas";

export const DEFAULT_ANSWER_OPTIONS: AnswerOption[] = [
  { value: "implemented", label: "Implemented", score: 100 },
  { value: "mostly_implemented", label: "Mostly implemented", score: 75 },
  { value: "partially_implemented", label: "Partially implemented", score: 50 },
  { value: "planned", label: "Planned", score: 25 },
  { value: "not_implemented", label: "Not implemented", score: 0 },
  { value: "not_applicable", label: "Not applicable", score: null },
];

export const EVIDENCE_STATUS_OPTIONS: { value: EvidenceStatus; label: string }[] = [
  { value: "missing", label: "Missing" },
  { value: "partial", label: "Partial" },
  { value: "uploaded", label: "Uploaded" },
  { value: "verified", label: "Verified" },
];

const OWNER_BY_CATEGORY: Record<string, string> = {
  Governance: "Security Team",
  Compliance: "Compliance Officer",
  "Asset Management": "IT / Engineering",
  "Vendor Security": "Vendor Owner",
  "Data Protection": "Data Owner",
  "Financial Security": "Compliance Officer",
  "Healthcare Security": "Compliance Officer",
  "Infrastructure Security": "IT / Engineering",
  "Access Control": "IT Admin",
  "Incident Response": "Security Team",
  "Business Continuity": "Operations",
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(normalizeText(word)));
}

function asArray(value: string[] | string | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function appliesToSector(question: RawAssessmentQuestion, sector: string) {
  const appliesTo = asArray(question.appliesTo).map((item) =>
    normalizeText(String(item)),
  );

  return (
    appliesTo.length === 0 ||
    appliesTo.includes("all") ||
    appliesTo.includes(normalizeText(sector))
  );
}

export function normalizeSector(sector?: string) {
  return sector || DEFAULT_SECTOR;
}

export function normalizeCompanySectors(
  domain: RawAssessmentDomain,
): CompanySector[] {
  return domain.companySectors.map((sector) => {
    if (typeof sector !== "string") return sector;

    return {
      id: sector,
      name: sector
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      description: `Assessment questions tailored for ${sector.replace(/_/g, " ")} organizations.`,
    };
  });
}

export function getQuestionsForSector(
  domain: RawAssessmentDomain,
  sector = DEFAULT_SECTOR,
): RawAssessmentQuestion[] {
  const sectorId = normalizeSector(sector);
  const coreQuestions = domain.coreQuestions ?? [];
  const sectorQuestions = domain.sectorQuestions;

  let selectedSectorQuestions: RawAssessmentQuestion[] = [];

  if (Array.isArray(sectorQuestions)) {
    selectedSectorQuestions = sectorQuestions.filter((question) =>
      appliesToSector(question, sectorId),
    );
  } else if (sectorQuestions && typeof sectorQuestions === "object") {
    selectedSectorQuestions = sectorQuestions[sectorId] ?? [];
  }

  return [...coreQuestions, ...selectedSectorQuestions];
}

export function normalizeSeverity(severity: string | undefined): Severity {
  const value = normalizeText(severity ?? "");
  if (value.includes("critical")) return "Critical";
  if (value.includes("high")) return "High";
  if (value.includes("medium")) return "Medium";
  return "Low";
}

export function mapSeverityToRiskLevel(severity: string | undefined): RiskLevel {
  return normalizeSeverity(severity);
}

export function inferCategory(question: RawAssessmentQuestion): string {
  const haystack = normalizeText(
    [
      question.question,
      question.helpText,
      question.description,
      ...asArray(question.expectedEvidence),
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (
    includesAny(haystack, [
      "scope",
      "perimetre",
      "context",
      "contexte",
      "interested parties",
      "parties interessees",
      "exclusion",
      "smsi",
      "isms",
    ])
  ) {
    return "Governance";
  }

  if (
    includesAny(haystack, [
      "vendor",
      "supplier",
      "fournisseur",
      "tiers",
      "third party",
      "third-party",
      "outsourced",
      "sous-trait",
      "cloud provider",
    ])
  ) {
    return "Vendor Security";
  }

  if (
    includesAny(haystack, [
      "asset",
      "actif",
      "inventory",
      "inventaire",
      "system",
      "systeme",
      "application",
    ])
  ) {
    return "Asset Management";
  }

  if (
    includesAny(haystack, [
      "data",
      "donnee",
      "personal data",
      "sensitive",
      "sensible",
      "records",
      "enregistrements",
      "client",
    ])
  ) {
    return "Data Protection";
  }

  if (includesAny(haystack, ["payment", "paiement", "financial", "banking", "bancaire"])) {
    return "Financial Security";
  }

  if (includesAny(haystack, ["health", "patient", "medical", "sante"])) {
    return "Healthcare Security";
  }

  if (
    includesAny(haystack, [
      "network",
      "reseau",
      "router",
      "firewall",
      "pare-feu",
      "telecom",
      "infrastructure",
    ])
  ) {
    return "Infrastructure Security";
  }

  if (
    includesAny(haystack, [
      "access",
      "acces",
      "account",
      "compte",
      "user",
      "utilisateur",
      "admin",
      "identity",
      "identite",
      "privileged",
    ])
  ) {
    return "Access Control";
  }

  if (includesAny(haystack, ["incident", "response", "reponse"])) {
    return "Incident Response";
  }

  if (
    includesAny(haystack, [
      "backup",
      "sauvegarde",
      "recovery",
      "reprise",
      "continuity",
      "continuite",
      "pca",
      "pra",
    ])
  ) {
    return "Business Continuity";
  }

  if (includesAny(haystack, ["compliance", "conformite", "obligation", "audit"])) {
    return "Compliance";
  }

  return "Governance";
}

export function inferOwner(category: string): string {
  return OWNER_BY_CATEGORY[category] ?? "Security Team";
}

export function inferEvidenceType(name: string): EvidenceType {
  const text = normalizeText(name);

  if (includesAny(text, ["schema", "diagram", "cartographie", "architecture"])) {
    return "diagram";
  }
  if (includesAny(text, ["inventory", "inventaire", "asset list", "liste"])) {
    return "inventory";
  }
  if (includesAny(text, ["register", "registre", "tracker", "journal"])) {
    return "register";
  }
  if (includesAny(text, ["policy", "politique"])) {
    return "policy";
  }
  if (includesAny(text, ["contract", "contrat", "clause", "dpa", "agreement"])) {
    return "contract";
  }
  if (includesAny(text, ["screenshot", "capture"])) {
    return "screenshot";
  }
  if (includesAny(text, ["configuration", "config", "export", "baseline", "hardening"])) {
    return "configuration_export";
  }
  if (includesAny(text, ["meeting", "notes", "atelier", "comite", "workshop"])) {
    return "meeting_notes";
  }
  if (includesAny(text, ["document", "procedure", "process", "plan"])) {
    return "document";
  }

  return "other";
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

export function inferAggregateEvidenceStatus(
  evidenceRequirements: EvidenceRequirement[],
): EvidenceStatus {
  if (
    evidenceRequirements.length > 0 &&
    evidenceRequirements.every((evidence) => evidence.status === "verified")
  ) {
    return "verified";
  }
  if (evidenceRequirements.some((evidence) => evidence.status === "uploaded")) {
    return "uploaded";
  }
  if (evidenceRequirements.some((evidence) => evidence.status === "partial")) {
    return "partial";
  }
  return "missing";
}

function makeEvidenceRequirements(
  question: RawAssessmentQuestion,
  status: EvidenceStatus,
): EvidenceRequirement[] {
  const evidence = asArray(question.expectedEvidence);

  return evidence.map((name, index) => ({
    id: `${question.id}-${slugify(name) || `evidence-${index + 1}`}`,
    name,
    status,
    required: true,
    type: inferEvidenceType(name),
  }));
}

function defaultAnswerForQuestion(question: RawAssessmentQuestion): AssessmentAnswer {
  const seed = Array.from(question.id).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  const severity = normalizeSeverity(question.severity);

  if (severity === "Critical") {
    if (seed % 5 === 0) return "not_implemented";
    if (seed % 3 === 0) return "planned";
    if (seed % 2 === 0) return "partially_implemented";
    return "mostly_implemented";
  }

  if (severity === "High") {
    if (seed % 7 === 0) return "not_implemented";
    if (seed % 4 === 0) return "planned";
    if (seed % 2 === 0) return "partially_implemented";
    return "mostly_implemented";
  }

  if (seed % 5 === 0) return "partially_implemented";
  if (seed % 3 === 0) return "mostly_implemented";
  return "implemented";
}

function defaultEvidenceStatusForQuestion(
  question: RawAssessmentQuestion,
  answer: AssessmentAnswer,
): EvidenceStatus {
  const seed = Array.from(question.id).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  if (answer === "implemented") return seed % 4 === 0 ? "uploaded" : "verified";
  if (answer === "mostly_implemented") return seed % 3 === 0 ? "partial" : "uploaded";
  if (answer === "partially_implemented") return seed % 2 === 0 ? "partial" : "missing";
  return "missing";
}

export function generateControlTitle(question: RawAssessmentQuestion): string {
  const text = normalizeText(`${question.question} ${question.helpText ?? ""}`);

  if (includesAny(text, ["perimetre", "scope"]) && includesAny(text, ["saas", "production"])) {
    return "Scope SaaS production environment";
  }
  if (includesAny(text, ["perimetre", "scope", "smsi", "isms"])) {
    return "Define ISMS scope";
  }
  if (includesAny(text, ["facteurs internes", "facteurs externes", "context"])) {
    return "Identify security context";
  }
  if (includesAny(text, ["parties interessees", "interested parties"])) {
    return "Identify interested parties";
  }
  if (includesAny(text, ["actif", "asset", "inventaire"])) {
    return "Identify scoped information assets";
  }
  if (includesAny(text, ["fournisseur", "tiers", "third party", "outsourced"])) {
    return "Map third-party dependencies";
  }
  if (includesAny(text, ["risque", "risk"])) {
    return "Assess information security risks";
  }
  if (includesAny(text, ["objectif", "objectives"])) {
    return "Define security objectives";
  }
  if (includesAny(text, ["direction", "leadership", "management"])) {
    return "Assign security leadership";
  }
  if (includesAny(text, ["acces", "access", "compte", "utilisateur", "admin"])) {
    return "Control user access";
  }
  if (includesAny(text, ["incident"])) {
    return "Maintain incident response process";
  }
  if (includesAny(text, ["sauvegarde", "backup", "recovery", "reprise"])) {
    return "Test backup and recovery";
  }
  if (includesAny(text, ["document", "procedure"])) {
    return "Control ISMS documentation";
  }
  if (includesAny(text, ["competence", "sensibilisation", "formation", "training"])) {
    return "Maintain security competence";
  }
  if (includesAny(text, ["journal", "log", "surveillance", "monitor"])) {
    return "Monitor security events";
  }
  if (includesAny(text, ["vulnerabilite", "vulnerability"])) {
    return "Manage technical vulnerabilities";
  }

  const cleaned = question.question
    .replace(/[?]/g, "")
    .replace(/^votre organisation a-t-elle\s+/i, "")
    .replace(/^les?\s+/i, "")
    .replace(/^la\s+/i, "")
    .replace(/^des\s+/i, "")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 7).join(" ");

  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function transformQuestionToControl(
  question: RawAssessmentQuestion,
  domain: RawAssessmentDomain,
  response?: Partial<AssessmentResponse>,
): AssessmentControl {
  const answer = response?.answer ?? defaultAnswerForQuestion(question);
  const requestedEvidenceStatus =
    response?.evidenceStatus ?? defaultEvidenceStatusForQuestion(question, answer);
  const evidenceRequirements = makeEvidenceRequirements(
    question,
    requestedEvidenceStatus,
  );
  const evidenceStatus = inferAggregateEvidenceStatus(evidenceRequirements);
  const severity = normalizeSeverity(question.severity);
  const score = calculateControlScore(
    answer,
    evidenceStatus,
    severity,
    question.weight,
  );
  const category = question.category ?? inferCategory(question);

  const sourceDomainId = question.domainId || domain.domain.id;

  return {
    id: question.id,
    controlCode: question.controlCode || question.id,
    sourceType: "assessment",
    sourceDomainId,
    sourceQuestionId: question.id,
    sourceControlCode: question.controlCode || question.id,
    title: generateControlTitle(question),
    question: question.question,
    description: question.helpText ?? question.description ?? "",
    domainId: question.domainId || domain.domain.id,
    domainName: question.domainName || domain.domain.name,
    frameworkId: "iso-27001",
    frameworkName: "ISO 27001:2022",
    category,
    owner: question.owner ?? inferOwner(category),
    severity,
    riskLevel: mapSeverityToRiskLevel(question.severity),
    weight: question.weight,
    source: question.source,
    appliesTo: asArray(question.appliesTo),
    expectedEvidence: asArray(question.expectedEvidence),
    evidenceRequirements,
    answerOptions: DEFAULT_ANSWER_OPTIONS,
    answer,
    status: getControlStatus(score, severity, answer),
    evidenceStatus,
    score,
    linkedGaps: [],
    linkedRisks: [],
    linkedTasks: [],
  };
}

export function transformDomainToControls(
  domain: RawAssessmentDomain,
  sector = DEFAULT_SECTOR,
  answers: Record<string, Partial<AssessmentResponse>> = {},
): AssessmentControl[] {
  return getQuestionsForSector(domain, sector).map((question) =>
    transformQuestionToControl(question, domain, answers[question.id]),
  );
}
