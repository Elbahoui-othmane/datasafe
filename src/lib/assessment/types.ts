export type AssessmentAnswer =
  | "implemented"
  | "mostly_implemented"
  | "partially_implemented"
  | "planned"
  | "not_implemented"
  | "not_applicable";

export type EvidenceStatus = "missing" | "partial" | "uploaded" | "verified";
export type ControlStatus = "OK" | "Needs attention" | "In progress" | "Failed";
export type RiskLevel = "Critical" | "High" | "Medium" | "Low";
export type Severity = RiskLevel;

export type EvidenceType =
  | "document"
  | "diagram"
  | "inventory"
  | "register"
  | "policy"
  | "contract"
  | "screenshot"
  | "configuration_export"
  | "meeting_notes"
  | "other";

export interface AnswerOption {
  value: AssessmentAnswer;
  label: string;
  score: number | null;
}

export interface EvidenceOption {
  value: EvidenceStatus;
  label: string;
  score: number;
}

export interface CompanySector {
  id: string;
  name: string;
  description: string;
}

export interface AssessmentDomain {
  id: string;
  code?: string;
  name: string;
  shortName: string;
  description: string;
  frameworkFocus?: string;
  sourceNote?: string;
  defaultSource?: string;
  weight?: number;
}

export interface RawAssessmentQuestion {
  id: string;
  domainId: string;
  domainName: string;
  controlCode: string;
  question: string;
  helpText?: string;
  description?: string;
  expectedEvidence: string[] | string;
  severity: string;
  weight: number;
  appliesTo: string[] | string;
  source: string;
  answerScaleRef?: string;
  category?: string;
  owner?: string;
  frameworkId?: string;
  frameworkName?: string;
  riskLevel?: string;
}

export interface SelectionLogic {
  type?: string;
  defaultSector?: string;
  rules?: {
    condition: string;
    includeSectorQuestions: boolean;
    includeCoreQuestions: boolean;
    excludeCategories?: string[];
  }[];
  description?: string;
  expectedQuestionCountPerCompany?: number;
  pseudoCode?: string;
}

export interface RawAssessmentDomain {
  domain: AssessmentDomain;
  companySectors: Array<CompanySector | string>;
  questionSchema?: Record<string, unknown>;
  coreQuestions: RawAssessmentQuestion[];
  sectorQuestions:
    | RawAssessmentQuestion[]
    | Record<string, RawAssessmentQuestion[]>
    | undefined;
  selectionLogic?: SelectionLogic;
}

export interface EvidenceRequirement {
  id: string;
  name: string;
  status: EvidenceStatus;
  required: boolean;
  type: EvidenceType;
}

export interface AssessmentResponse {
  answer: AssessmentAnswer;
  evidenceStatus: EvidenceStatus;
}

export interface SourceInfo {
  sourceType: "assessment";
  sourceDomainId: string;
  sourceQuestionId: string;
  sourceControlCode: string;
}

export interface AssessmentControl extends SourceInfo {
  id: string;
  controlCode: string;
  title: string;
  question: string;
  description: string;
  domainId: string;
  domainName: string;
  frameworkId: "iso-27001";
  frameworkName: "ISO 27001:2022";
  category: string;
  owner: string;
  severity: Severity;
  riskLevel: RiskLevel;
  weight: number;
  source: string;
  appliesTo: string[];
  expectedEvidence: string[];
  evidenceRequirements: EvidenceRequirement[];
  answerOptions: AnswerOption[];
  answer: AssessmentAnswer;
  status: ControlStatus;
  evidenceStatus: EvidenceStatus;
  score: number | null;
  linkedGaps: string[];
  linkedRisks: string[];
  linkedTasks: string[];
}

export interface GeneratedGap extends SourceInfo {
  id: string;
  title: string;
  frameworkId: "iso-27001";
  controlId: string;
  severity: Severity;
  status: "Open" | "In remediation" | "Awaiting evidence" | "Closed";
  owner: string;
  progress: number;
  reason: string;
  requiredEvidence: string[];
  nextAction: string;
  dueDate: string;
}

export interface GeneratedRisk extends SourceInfo {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  score: number;
  status: "Identified" | "In treatment" | "Monitoring" | "Accepted";
  owner: string;
  impact: string;
  likelihood: string;
  reason: string;
  linkedControlId: string;
  linkedFrameworkId: "iso-27001";
  treatment: string;
}

export interface GeneratedTask extends SourceInfo {
  id: string;
  title: string;
  priority: Severity;
  status: "To do" | "In progress" | "Waiting evidence" | "Done";
  owner: string;
  progress: number;
  linkedControlId: string;
  linkedGapId?: string;
  linkedRiskId?: string;
  frameworkId: "iso-27001";
  dueDate: string;
  checklist: string[];
}

export interface GeneratedDashboardData {
  controls: AssessmentControl[];
  gaps: GeneratedGap[];
  risks: GeneratedRisk[];
  tasks: GeneratedTask[];
}
