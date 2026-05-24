// Extra mock data used by redesigned pages.

export interface Policy {
  id: string; name: string; owner: string; version: string;
  status: "Published" | "In review" | "Draft"; updated: string;
}

export const policies: Policy[] = [
  { id: "POL-001", name: "Access Control Policy", owner: "Sarah Chen", version: "v3.2", status: "Published", updated: "Apr 28, 2026" },
  { id: "POL-002", name: "Incident Response Policy", owner: "Priya Nair", version: "v2.1", status: "Published", updated: "Apr 12, 2026" },
  { id: "POL-003", name: "Data Retention Policy", owner: "Laura Patel", version: "v1.4", status: "In review", updated: "May 06, 2026" },
  { id: "POL-004", name: "Password Policy", owner: "Michael Lee", version: "v4.0", status: "Published", updated: "Mar 30, 2026" },
  { id: "POL-005", name: "Vendor Security Policy", owner: "Rachel Green", version: "v2.0", status: "Published", updated: "Apr 02, 2026" },
  { id: "POL-006", name: "Acceptable Use Policy", owner: "Tom Black", version: "v1.9", status: "Draft", updated: "May 14, 2026" },
];

export interface TestRow {
  id: string; name: string; source: string; framework: string;
  status: "Passing" | "Failing" | "Upcoming"; lastRun: string; linkedControl: string;
  category: "Identity" | "Cloud" | "Encryption" | "Access" | "Vulnerabilities";
}

export const tests: TestRow[] = [
  { id: "TS-001", name: "MFA enforced on admin accounts", source: "Google Workspace", framework: "ISO 27001", status: "Failing", lastRun: "12m ago", linkedControl: "MFA for admin accounts", category: "Identity" },
  { id: "TS-002", name: "S3 buckets are not public", source: "AWS", framework: "SOC 2", status: "Passing", lastRun: "1h ago", linkedControl: "Cloud storage hardening", category: "Cloud" },
  { id: "TS-003", name: "TLS 1.2+ on all endpoints", source: "Cloudflare", framework: "ISO 27001", status: "Passing", lastRun: "30m ago", linkedControl: "Encryption in transit", category: "Encryption" },
  { id: "TS-004", name: "EBS volumes encrypted at rest", source: "AWS", framework: "SOC 2", status: "Passing", lastRun: "2h ago", linkedControl: "Encryption at rest", category: "Encryption" },
  { id: "TS-005", name: "Quarterly access review attestations", source: "Okta", framework: "NIST CSF", status: "Failing", lastRun: "4h ago", linkedControl: "Access reviews", category: "Access" },
  { id: "TS-006", name: "Critical CVE remediation SLA", source: "GitHub", framework: "NIST CSF", status: "Failing", lastRun: "6h ago", linkedControl: "Vulnerability mgmt", category: "Vulnerabilities" },
  { id: "TS-007", name: "SSO enforced on critical apps", source: "Okta", framework: "ISO 27001", status: "Passing", lastRun: "1h ago", linkedControl: "SSO enforcement", category: "Identity" },
  { id: "TS-008", name: "Root account MFA enabled", source: "AWS", framework: "PCI-DSS", status: "Passing", lastRun: "3h ago", linkedControl: "Root account protection", category: "Identity" },
  { id: "TS-009", name: "GuardDuty enabled in all regions", source: "AWS", framework: "SOC 2", status: "Upcoming", lastRun: "Scheduled", linkedControl: "Threat detection", category: "Cloud" },
  { id: "TS-010", name: "Code scanning enabled on repos", source: "GitHub", framework: "ISO 27001", status: "Passing", lastRun: "20m ago", linkedControl: "Secure SDLC", category: "Vulnerabilities" },
];

export const scheduledReports = [
  { id: "sch-1", name: "Weekly Executive Summary", cadence: "Every Monday, 09:00", next: "May 26, 2026", recipients: 4 },
  { id: "sch-2", name: "Monthly Vendor Risk", cadence: "1st of month, 08:00", next: "Jun 01, 2026", recipients: 6 },
  { id: "sch-3", name: "Quarterly Board Pack", cadence: "Quarterly", next: "Jul 01, 2026", recipients: 3 },
];

// 5×5 risk matrix counts indexed [impact 0..4][likelihood 0..4]
// impact: 0=Insignificant..4=Severe, likelihood: 0=Rare..4=Almost certain
export const riskMatrix: number[][] = [
  [3, 4, 2, 1, 0],
  [5, 7, 6, 3, 1],
  [4, 9, 12, 6, 2],
  [2, 5, 8, 11, 4],
  [1, 2, 4, 7, 8],
];

export const riskDrivers = [
  { label: "Admin access", count: 14, level: "Critical" as const },
  { label: "Vendor exposure", count: 11, level: "High" as const },
  { label: "Missing evidence", count: 19, level: "High" as const },
  { label: "Vulnerability backlog", count: 8, level: "Medium" as const },
  { label: "Data retention", count: 6, level: "Medium" as const },
  { label: "Endpoint coverage", count: 5, level: "Low" as const },
];

export const extendedIntegrations = [
  // cloud
  { id: "aws", name: "AWS", category: "Cloud providers", status: "Available" as const, capabilities: ["Cloud inventory", "IAM", "Encryption"], powers: ["Evidence", "Tests"] },
  { id: "azure", name: "Microsoft Azure", category: "Cloud providers", status: "Available" as const, capabilities: ["Resources", "AAD", "Defender"], powers: ["Evidence", "Tests"] },
  { id: "gcp", name: "Google Cloud", category: "Cloud providers", status: "Available" as const, capabilities: ["Projects", "IAM", "Logging"], powers: ["Evidence", "Tests"] },
  // identity
  { id: "google-workspace", name: "Google Workspace", category: "Identity providers", status: "Available" as const, capabilities: ["Users", "Access", "Discovery"], powers: ["Evidence", "Discovery"] },
  { id: "microsoft-365", name: "Microsoft 365", category: "Identity providers", status: "Available" as const, capabilities: ["Identity", "Email"], powers: ["Evidence", "Discovery"] },
  { id: "okta", name: "Okta", category: "Identity providers", status: "Available" as const, capabilities: ["SSO", "MFA", "Access"], powers: ["Evidence", "Tests"] },
  // VCS
  { id: "github", name: "GitHub", category: "Version control", status: "Connected" as const, capabilities: ["Code", "Security", "Repos"], lastSync: "1h ago", workspace: "averonix-org", powers: ["Evidence", "Tests"] },
  { id: "gitlab", name: "GitLab", category: "Version control", status: "Available" as const, capabilities: ["Code", "Pipelines"], powers: ["Evidence", "Tests"] },
  // productivity
  { id: "slack", name: "Slack", category: "Productivity", status: "Available" as const, capabilities: ["Notifications", "Discovery"], powers: ["Discovery"] },
  { id: "notion", name: "Notion", category: "Productivity", status: "Available" as const, capabilities: ["Docs", "Policies"], powers: ["Evidence"] },
  // infra
  { id: "cloudflare", name: "Cloudflare", category: "Infrastructure", status: "Available" as const, capabilities: ["DNS", "WAF", "Edge"], powers: ["Tests"] },
  { id: "vercel", name: "Vercel", category: "Infrastructure", status: "Available" as const, capabilities: ["Hosting", "Edge"], powers: ["Vendor inventory"] },
];

export const recommendedIntegrations = ["okta", "aws", "slack"];
