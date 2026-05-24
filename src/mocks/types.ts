export type RiskLevel = "Critical" | "High" | "Medium" | "Low";
export type Severity = RiskLevel;
export type Status = string;

export interface Owner { id: string; name: string; initials: string; }

export interface Framework {
  id: string; name: string; shortName: string; description: string;
  readiness: number; completed: number; total: number;
  status: "Continue" | "Snooze" | "View requirements";
  category: "All" | "Custom";
}

export interface Control {
  id: string; name: string; description: string; owner: string;
  frameworks: string[]; testsDone: number; testsTotal: number;
  status: "OK" | "Needs attention" | "In progress" | "Failed" | "Not assigned"; risk: RiskLevel;
  evidence: "Ready" | "Partial" | "Missing" | "Verified" | "Uploaded";
  domainId?: string; domainName?: string; frameworkId?: string; frameworkName?: string;
  controlCode?: string; question?: string; category?: string; score?: number | null;
  evidenceStatus?: string; expectedEvidence?: string[];
  evidenceRequirements?: { id: string; name: string; status: string; required: boolean; type: string }[];
  severity?: Severity; riskLevel?: RiskLevel; weight?: number; source?: string; appliesTo?: string[];
  linkedGaps?: string[]; linkedRisks?: string[]; linkedTasks?: string[];
}

export interface Vendor {
  id: string; name: string; category: string; risk: RiskLevel;
  score: number; reviewStatus: string; reviewOwner: string;
  dataAgreement: "Signed" | "Pending" | "Missing";
  lastReview: string; nextReview: string;
  riskReason: string; nextAction: string;
}

export interface DiscoveredVendor {
  id: string; name: string; category: string; source: string;
  accounts: number; suggestedRisk: RiskLevel; date: string;
  state: "Needs review" | "Linked" | "Ignored";
}

export interface SecurityReview {
  id: string; vendorId: string; vendor: string; category: string;
  owner: string; risk: RiskLevel;
  status: "In progress" | "Awaiting evidence" | "Overdue" | "Completed";
  evidence: "Ready" | "Partial" | "Missing" | "Verified";
  dueDate: string; progress: number;
}

export interface Risk {
  id: string; title: string; category: string; severity: Severity;
  score: number; status: "Identified" | "In treatment" | "Monitoring" | "Accepted" | "Closed";
  owner: string; linkedControl: string; lastReview: string; nextReview: string;
  reason: string; impact: string; likelihood: string; treatment: string;
  frameworks: string[]; dueDate: string;
  linkedControlId?: string; linkedFrameworkId?: string;
}

export interface Gap {
  id: string; title: string; framework: string; severity: Severity;
  progress: number; status: "Open" | "In remediation" | "Awaiting evidence" | "Blocked" | "Closed";
  owner: string; linkedControl: string; dueDate: string; updated: string;
  reason: string; requiredEvidence: string[]; remediationSteps: string[];
  frameworkId?: string; controlId?: string; nextAction?: string;
}

export interface Task {
  id: string; title: string; framework: string; priority: Severity;
  progress: number; status: "Open" | "In progress" | "Awaiting evidence" | "Blocked" | "Closed";
  owner: string; linkedControl: string; dueDate: string; updated: string;
  relatedGap?: string; summary: string;
  checklist: { id: string; text: string; done: boolean }[];
  frameworkId?: string; linkedControlId?: string; linkedGapId?: string; linkedRiskId?: string;
}

export interface Report {
  id: string; name: string; type: string;
  status: "Ready" | "Draft" | "Needs update";
  generated: string; owner: string; sections: string[];
}

export interface Integration {
  id: string; name: string; category: string;
  status: "Connected" | "Available"; capabilities: string[];
  lastSync?: string; workspace?: string;
}

export interface Activity { id: string; text: string; time: string; }
