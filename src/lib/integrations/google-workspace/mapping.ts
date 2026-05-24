import type {
  GoogleWorkspaceDerivedDashboardData,
  GoogleWorkspaceDerivedItem,
  GoogleWorkspaceFinding,
} from "./types";

const ACCESS_CONTROL_ID = "iso-27001-access-control";

export function getGoogleWorkspaceRelatedControls(): GoogleWorkspaceDerivedItem[] {
  return [
    {
      id: "gw-control-access-control",
      title: "Access control",
      status: "Mapped",
      linked_finding_id: null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Uses synced Google Workspace users and groups as access-control evidence.",
    },
    {
      id: "gw-control-user-lifecycle",
      title: "User lifecycle management",
      status: "Mapped",
      linked_finding_id: null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Checks suspended and inactive users for joiner, mover, and leaver review.",
    },
    {
      id: "gw-control-privileged-access",
      title: "Privileged access management",
      status: "Mapped",
      linked_finding_id: null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Identifies administrator accounts that require periodic review.",
    },
    {
      id: "gw-control-access-review",
      title: "Access review evidence",
      status: "Mapped",
      linked_finding_id: null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Uses user and group inventories to support access review evidence.",
    },
  ];
}

export function deriveGoogleWorkspaceDashboardData(
  findings: GoogleWorkspaceFinding[],
): GoogleWorkspaceDerivedDashboardData {
  return {
    evidence: buildEvidence(findings),
    tests: buildTests(findings),
    gaps: buildGaps(findings),
    risks: buildRisks(findings),
    tasks: buildTasks(findings),
  };
}

function buildEvidence(findings: GoogleWorkspaceFinding[]): GoogleWorkspaceDerivedItem[] {
  const evidenceFinding = findings.find((finding) => finding.finding_type === "evidence");
  const groupFinding = findings.find((finding) => finding.finding_type === "access_review");

  return [
    {
      id: "gw-evidence-user-inventory",
      title: "Google Workspace user inventory",
      status: evidenceFinding ? "Collected" : "Missing",
      linked_finding_id: evidenceFinding?.id ?? null,
      linked_control_id: evidenceFinding?.linked_control_id ?? ACCESS_CONTROL_ID,
      description: evidenceFinding?.description ?? "Connect and sync Google Workspace to collect user inventory evidence.",
    },
    {
      id: "gw-evidence-group-inventory",
      title: "Google Workspace group inventory",
      status: groupFinding ? "Collected" : "Missing",
      linked_finding_id: groupFinding?.id ?? null,
      linked_control_id: groupFinding?.linked_control_id ?? ACCESS_CONTROL_ID,
      description: groupFinding?.description ?? "Sync groups to collect access review evidence.",
    },
  ];
}

function buildTests(findings: GoogleWorkspaceFinding[]): GoogleWorkspaceDerivedItem[] {
  const hasInventory = findings.some((finding) => finding.finding_type === "evidence");
  const hasGroups = findings.some((finding) => finding.finding_type === "access_review");
  const hasLoginGap = findings.some((finding) => finding.finding_type === "evidence_gap");
  const hasPrivileged = findings.some((finding) => finding.finding_type === "privileged_access");

  return [
    {
      id: "gw-test-user-inventory",
      title: "User inventory synced",
      status: hasInventory ? "Passing" : "Not run",
      linked_finding_id: findings.find((finding) => finding.finding_type === "evidence")?.id ?? null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Verifies that Google Workspace users have been synced.",
    },
    {
      id: "gw-test-admin-review",
      title: "Admin accounts reviewed",
      status: hasPrivileged ? "Needs review" : "Not run",
      linked_finding_id: findings.find((finding) => finding.finding_type === "privileged_access")?.id ?? null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Flags admin accounts that require review evidence.",
    },
    {
      id: "gw-test-group-inventory",
      title: "Group membership inventory available",
      status: hasGroups ? "Needs review" : "Not run",
      linked_finding_id: findings.find((finding) => finding.finding_type === "access_review")?.id ?? null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Verifies that groups are available for access review.",
    },
    {
      id: "gw-test-login-activity",
      title: "Login activity available",
      status: hasLoginGap ? "Failing" : hasInventory ? "Passing" : "Not run",
      linked_finding_id: findings.find((finding) => finding.finding_type === "evidence_gap")?.id ?? null,
      linked_control_id: ACCESS_CONTROL_ID,
      description: "Checks whether Google Workspace login activity can support access evidence.",
    },
  ];
}

function buildGaps(findings: GoogleWorkspaceFinding[]): GoogleWorkspaceDerivedItem[] {
  return findings
    .filter((finding) => ["privileged_access", "evidence_gap", "user_lifecycle", "access_review"].includes(finding.finding_type))
    .map((finding) => ({
      id: `gw-gap-${finding.id}`,
      title: gapTitleForFinding(finding),
      severity: finding.severity,
      status: "Open",
      linked_finding_id: finding.id,
      linked_control_id: finding.linked_control_id,
      description: finding.description,
    }));
}

function buildRisks(findings: GoogleWorkspaceFinding[]): GoogleWorkspaceDerivedItem[] {
  return findings
    .filter((finding) => ["privileged_access", "user_lifecycle", "access_review"].includes(finding.finding_type))
    .map((finding) => ({
      id: `gw-risk-${finding.id}`,
      title: riskTitleForFinding(finding),
      severity: finding.severity,
      status: "Identified",
      linked_finding_id: finding.id,
      linked_control_id: finding.linked_control_id,
      description: finding.description,
    }));
}

function buildTasks(findings: GoogleWorkspaceFinding[]): GoogleWorkspaceDerivedItem[] {
  return findings
    .filter((finding) => finding.severity !== "info")
    .map((finding) => ({
      id: `gw-task-${finding.id}`,
      title: taskTitleForFinding(finding),
      severity: finding.severity,
      status: "To do",
      linked_finding_id: finding.id,
      linked_control_id: finding.linked_control_id,
      description: finding.description,
    }));
}

function gapTitleForFinding(finding: GoogleWorkspaceFinding): string {
  if (finding.finding_type === "privileged_access") return "Missing admin access review evidence";
  if (finding.finding_type === "user_lifecycle") return "Inactive or suspended users not reviewed";
  if (finding.finding_type === "access_review") return "Groups not reviewed";
  return "Missing user inventory evidence";
}

function riskTitleForFinding(finding: GoogleWorkspaceFinding): string {
  if (finding.finding_type === "privileged_access") return "Privileged account exposure";
  if (finding.finding_type === "user_lifecycle") return "Unmanaged user lifecycle";
  return "Excessive access risk";
}

function taskTitleForFinding(finding: GoogleWorkspaceFinding): string {
  if (finding.finding_type === "privileged_access") return "Review admin accounts";
  if (finding.finding_type === "user_lifecycle") return "Review inactive or suspended users";
  if (finding.finding_type === "access_review") return "Review group memberships";
  if (finding.finding_type === "evidence_gap") return "Enable or verify login activity evidence";
  return "Export user inventory evidence";
}
