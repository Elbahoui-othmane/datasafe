import type {
  Framework, Control, Vendor, DiscoveredVendor, SecurityReview,
  Risk, Gap, Task, Report, Integration, Activity, Owner,
} from "./types";

export const workspace = { name: "Averonix Corp." };
export const currentUser = { name: "Averonix Admin", initials: "AC" };

export const owners: Owner[] = [
  { id: "sarah-chen", name: "Sarah Chen", initials: "SC" },
  { id: "michael-lee", name: "Michael Lee", initials: "ML" },
  { id: "priya-nair", name: "Priya Nair", initials: "PN" },
  { id: "laura-patel", name: "Laura Patel", initials: "LP" },
  { id: "david-kim", name: "David Kim", initials: "DK" },
  { id: "james-wilson", name: "James Wilson", initials: "JW" },
  { id: "tom-black", name: "Tom Black", initials: "TB" },
  { id: "rachel-green", name: "Rachel Green", initials: "RG" },
];

export const frameworks: Framework[] = [
  { id: "iso-27001", name: "ISO 27001:2022", shortName: "ISO 27001", description: "International standard for information security management systems.", readiness: 68, completed: 72, total: 106, status: "Continue", category: "All" },
  { id: "nist-csf", name: "NIST Cybersecurity Framework", shortName: "NIST CSF", description: "Voluntary framework to help organizations manage and reduce cybersecurity risk.", readiness: 54, completed: 46, total: 85, status: "View requirements", category: "All" },
  { id: "gdpr", name: "GDPR", shortName: "GDPR", description: "European regulation on data privacy and protection for individuals within the EU.", readiness: 41, completed: 31, total: 76, status: "Snooze", category: "All" },
  { id: "law-09-08", name: "Moroccan Law 09-08", shortName: "Law 09-08", description: "Moroccan data protection law governing the processing of personal data by organizations.", readiness: 35, completed: 18, total: 51, status: "Continue", category: "All" },
  { id: "soc-2", name: "SOC 2", shortName: "SOC 2", description: "Framework for managing security, availability, processing integrity, confidentiality, and privacy.", readiness: 47, completed: 61, total: 130, status: "Snooze", category: "All" },
  { id: "iso-27701", name: "ISO 27701", shortName: "ISO 27701", description: "Privacy information management system extension to ISO 27001 for PII protection.", readiness: 59, completed: 39, total: 66, status: "Snooze", category: "All" },
  { id: "ai-act", name: "AI Act", shortName: "AI Act", description: "EU regulation for trustworthy AI systems and risk-based requirements.", readiness: 22, completed: 11, total: 50, status: "Snooze", category: "All" },
  { id: "pci-dss", name: "PCI-DSS 4.0", shortName: "PCI-DSS", description: "Payment card industry standard for securing cardholder data and payment systems.", readiness: 12, completed: 32, total: 261, status: "Snooze", category: "All" },
];

export const controls: Control[] = [
  { id: "CT-001", name: "Encryption of Data in Transit", description: "Ensure all data transmitted across networks uses strong TLS encryption and modern cipher suites.", owner: "Jane Nguyen", frameworks: ["iso-27001", "soc-2"], testsDone: 36, testsTotal: 50, status: "OK", risk: "High", evidence: "Ready" },
  { id: "CT-002", name: "Access Reviews", description: "Conduct quarterly reviews of user access rights across all production systems.", owner: "Michael Chen", frameworks: ["iso-27001", "soc-2"], testsDone: 28, testsTotal: 40, status: "Needs attention", risk: "Medium", evidence: "Partial" },
  { id: "CT-003", name: "Asset Inventory Labels", description: "All hardware and software assets are labeled and tracked in the inventory system.", owner: "David Patel", frameworks: ["iso-27001"], testsDone: 18, testsTotal: 25, status: "OK", risk: "Low", evidence: "Verified" },
  { id: "CT-004", name: "Use of Portable Media", description: "Policy and controls for removable media usage on corporate devices.", owner: "Sarah Johnson", frameworks: ["soc-2", "nist-csf"], testsDone: 12, testsTotal: 20, status: "Needs attention", risk: "Medium", evidence: "Missing" },
  { id: "CT-005", name: "Maintenance of Assets", description: "Scheduled maintenance and patching of production assets.", owner: "Robert Kim", frameworks: ["iso-27001"], testsDone: 24, testsTotal: 35, status: "OK", risk: "Medium", evidence: "Ready" },
  { id: "CT-006", name: "Password Management", description: "Enforce password complexity, rotation, and storage best-practices across all systems.", owner: "Emily Davis", frameworks: ["iso-27001", "soc-2"], testsDone: 30, testsTotal: 45, status: "OK", risk: "High", evidence: "Ready" },
  { id: "CT-007", name: "Data Backup and Recovery", description: "Backup integrity tests and recovery rehearsals for critical systems.", owner: "James Wilson", frameworks: ["iso-27001", "nist-csf"], testsDone: 22, testsTotal: 30, status: "OK", risk: "Medium", evidence: "Partial" },
];

export const vendors: Vendor[] = [
  { id: "aws", name: "AWS", category: "Cloud infrastructure", risk: "Critical", score: 92, reviewStatus: "In progress", reviewOwner: "Sarah Chen", dataAgreement: "Signed", lastReview: "May 12, 2025", nextReview: "May 12, 2026", riskReason: "Critical infrastructure with broad access to production data.", nextAction: "Complete remediation evidence." },
  { id: "google-workspace", name: "Google Workspace", category: "Productivity", risk: "High", score: 58, reviewStatus: "Up to date", reviewOwner: "Michael Lee", dataAgreement: "Signed", lastReview: "Apr 18, 2025", nextReview: "Apr 18, 2026", riskReason: "Holds employee email and documents.", nextAction: "Schedule annual review." },
  { id: "github", name: "GitHub", category: "Development", risk: "Medium", score: 62, reviewStatus: "Needs review", reviewOwner: "Priya Nair", dataAgreement: "Signed", lastReview: "Mar 30, 2025", nextReview: "Jun 30, 2025", riskReason: "Source code repository with deploy keys.", nextAction: "Run security questionnaire." },
  { id: "cloudflare", name: "Cloudflare", category: "Infrastructure", risk: "Medium", score: 48, reviewStatus: "Up to date", reviewOwner: "Alex Rivera", dataAgreement: "Signed", lastReview: "Apr 5, 2025", nextReview: "Apr 5, 2026", riskReason: "DNS and WAF in front of production.", nextAction: "Monitor." },
  { id: "stripe", name: "Stripe", category: "Payments", risk: "High", score: 76, reviewStatus: "In progress", reviewOwner: "Emily Zhao", dataAgreement: "Signed", lastReview: "May 2, 2025", nextReview: "Jul 2, 2025", riskReason: "Processes cardholder data.", nextAction: "Validate PCI scope." },
  { id: "atlassian", name: "Atlassian", category: "Collaboration", risk: "Medium", score: 44, reviewStatus: "Up to date", reviewOwner: "David Kim", dataAgreement: "Signed", lastReview: "Mar 15, 2025", nextReview: "Mar 15, 2026", riskReason: "Hosts engineering tickets and confluence.", nextAction: "Routine." },
  { id: "okta", name: "Okta", category: "Identity & Access", risk: "High", score: 78, reviewStatus: "Awaiting evidence", reviewOwner: "James Wilson", dataAgreement: "Signed", lastReview: "May 10, 2025", nextReview: "May 24, 2025", riskReason: "Single sign-on for all corporate apps.", nextAction: "Request SOC 2 report." },
  { id: "slack", name: "Slack", category: "Communication", risk: "Low", score: 28, reviewStatus: "Up to date", reviewOwner: "Laura Patel", dataAgreement: "Signed", lastReview: "Feb 28, 2025", nextReview: "Feb 28, 2026", riskReason: "Daily internal communication.", nextAction: "Monitor." },
  { id: "notion", name: "Notion", category: "Collaboration", risk: "Low", score: 32, reviewStatus: "Needs review", reviewOwner: "Tom Black", dataAgreement: "Pending", lastReview: "Jan 20, 2025", nextReview: "Jun 20, 2025", riskReason: "Internal wiki, no customer data.", nextAction: "Sign DPA." },
  { id: "microsoft-365", name: "Microsoft 365", category: "Productivity", risk: "Medium", score: 50, reviewStatus: "Up to date", reviewOwner: "Rachel Green", dataAgreement: "Signed", lastReview: "Mar 22, 2025", nextReview: "Mar 22, 2026", riskReason: "Email and productivity for finance team.", nextAction: "Monitor." },
];

export const discoveredVendors: DiscoveredVendor[] = [
  { id: "mongodb", name: "MongoDB", category: "Data storage", source: "Google Workspace", accounts: 3, suggestedRisk: "High", date: "May 12, 2023", state: "Needs review" },
  { id: "d-notion", name: "Notion", category: "Collaboration", source: "Google Workspace", accounts: 2, suggestedRisk: "Medium", date: "May 12, 2023", state: "Needs review" },
  { id: "figma", name: "Figma", category: "Design", source: "Google Workspace", accounts: 2, suggestedRisk: "Medium", date: "May 11, 2023", state: "Needs review" },
  { id: "airtable", name: "Airtable", category: "Collaboration", source: "Google Workspace", accounts: 1, suggestedRisk: "Medium", date: "May 11, 2023", state: "Linked" },
  { id: "d-cloudflare", name: "Cloudflare", category: "Infrastructure", source: "Microsoft 365", accounts: 1, suggestedRisk: "High", date: "May 10, 2023", state: "Linked" },
  { id: "linear", name: "Linear", category: "Project management", source: "Google Workspace", accounts: 1, suggestedRisk: "Low", date: "May 10, 2023", state: "Ignored" },
  { id: "d-stripe", name: "Stripe", category: "Payments", source: "Google Workspace", accounts: 1, suggestedRisk: "High", date: "May 9, 2023", state: "Needs review" },
  { id: "vercel", name: "Vercel", category: "Development", source: "GitHub", accounts: 1, suggestedRisk: "Medium", date: "May 9, 2023", state: "Needs review" },
];

export const securityReviews: SecurityReview[] = [
  { id: "rev-aws", vendorId: "aws", vendor: "AWS", category: "Cloud Infrastructure", owner: "Sarah Chen", risk: "Critical", status: "In progress", evidence: "Partial", dueDate: "May 16, 2025", progress: 68 },
  { id: "rev-okta", vendorId: "okta", vendor: "Okta", category: "Identity & Access", owner: "James Wilson", risk: "High", status: "Awaiting evidence", evidence: "Missing", dueDate: "May 12, 2025", progress: 35 },
  { id: "rev-github", vendorId: "github", vendor: "GitHub", category: "Development", owner: "Priya Nair", risk: "Medium", status: "In progress", evidence: "Partial", dueDate: "May 20, 2025", progress: 57 },
  { id: "rev-gws", vendorId: "google-workspace", vendor: "Google Workspace", category: "Productivity", owner: "Michael Lee", risk: "High", status: "In progress", evidence: "Ready", dueDate: "May 18, 2025", progress: 82 },
  { id: "rev-cf", vendorId: "cloudflare", vendor: "Cloudflare", category: "Infrastructure", owner: "Alex Rivera", risk: "Medium", status: "Awaiting evidence", evidence: "Missing", dueDate: "May 23, 2025", progress: 28 },
  { id: "rev-stripe", vendorId: "stripe", vendor: "Stripe", category: "Payments", owner: "Emily Zhao", risk: "High", status: "In progress", evidence: "Partial", dueDate: "May 21, 2025", progress: 64 },
  { id: "rev-atlassian", vendorId: "atlassian", vendor: "Atlassian", category: "Collaboration", owner: "David Kim", risk: "Medium", status: "Completed", evidence: "Verified", dueDate: "May 6, 2025", progress: 100 },
  { id: "rev-notion", vendorId: "notion", vendor: "Notion", category: "Collaboration", owner: "Lauren Patel", risk: "Low", status: "In progress", evidence: "Ready", dueDate: "May 30, 2025", progress: 21 },
];

export const risks: Risk[] = [
  { id: "R-001", title: "Admin MFA not enforced", category: "Access", severity: "Critical", score: 92, status: "In treatment", owner: "Sarah Chen", linkedControl: "MFA for admin accounts", lastReview: "May 1, 2025", nextReview: "Jun 1, 2025", reason: "Admin accounts lack mandatory multi-factor authentication.", impact: "Account takeover could expose production data.", likelihood: "High", treatment: "Roll out hardware token MFA across all admin accounts.", frameworks: ["iso-27001", "soc-2"], dueDate: "Jun 15, 2025" },
  { id: "R-002", title: "Vendor review overdue for AWS", category: "Third Party", severity: "High", score: 78, status: "In treatment", owner: "Michael Lee", linkedControl: "Vendor assessments", lastReview: "Apr 20, 2025", nextReview: "Jun 1, 2025", reason: "Annual review for AWS is past due.", impact: "Unverified vendor posture.", likelihood: "Medium", treatment: "Schedule and complete review by end of quarter.", frameworks: ["nist-csf"], dueDate: "Jun 10, 2025" },
  { id: "R-003", title: "Incident response plan outdated", category: "Operations", severity: "High", score: 71, status: "In treatment", owner: "Priya Nair", linkedControl: "Incident response plan", lastReview: "Mar 10, 2025", nextReview: "Jul 10, 2025", reason: "IR plan not updated since reorg.", impact: "Slower incident handling.", likelihood: "Medium", treatment: "Rewrite playbook with new on-call rotation.", frameworks: ["iso-27001"], dueDate: "Jul 1, 2025" },
  { id: "R-004", title: "Sensitive data retention gap", category: "Privacy", severity: "High", score: 69, status: "Identified", owner: "Laura Patel", linkedControl: "Data retention policy", lastReview: "Apr 1, 2025", nextReview: "Jul 1, 2025", reason: "No automatic deletion of customer PII after 24 months.", impact: "GDPR exposure.", likelihood: "Medium", treatment: "Implement retention job in warehouse.", frameworks: ["gdpr"], dueDate: "Aug 1, 2025" },
  { id: "R-005", title: "Excessive privileged access", category: "Access", severity: "Medium", score: 62, status: "In treatment", owner: "Aria Ramos", linkedControl: "Access reviews", lastReview: "Apr 12, 2025", nextReview: "Jul 12, 2025", reason: "Too many users with prod admin role.", impact: "Increased blast radius.", likelihood: "Medium", treatment: "Quarterly access review.", frameworks: ["iso-27001"], dueDate: "Jul 30, 2025" },
  { id: "R-006", title: "Endpoint coverage incomplete", category: "Security", severity: "Medium", score: 55, status: "Identified", owner: "David Kim", linkedControl: "Endpoint protection", lastReview: "Apr 15, 2025", nextReview: "Jul 15, 2025", reason: "EDR not deployed on contractor laptops.", impact: "Blind spot for threats.", likelihood: "Medium", treatment: "Mandatory MDM enrollment.", frameworks: ["nist-csf"], dueDate: "Aug 15, 2025" },
  { id: "R-007", title: "Backup recovery testing overdue", category: "Operations", severity: "Medium", score: 52, status: "In treatment", owner: "James Wilson", linkedControl: "Backup & recovery", lastReview: "Mar 5, 2025", nextReview: "Jun 5, 2025", reason: "No restore test in 6 months.", impact: "Unverified RTO.", likelihood: "Low", treatment: "Schedule quarterly restore drill.", frameworks: ["iso-27001"], dueDate: "Jun 30, 2025" },
  { id: "R-008", title: "Missing asset inventory evidence", category: "Asset Mgmt", severity: "Low", score: 34, status: "Identified", owner: "Tom Black", linkedControl: "Asset inventory", lastReview: "Feb 22, 2025", nextReview: "Aug 22, 2025", reason: "Quarterly screenshots missing.", impact: "Audit finding.", likelihood: "Low", treatment: "Automate inventory export.", frameworks: ["iso-27001"], dueDate: "Sep 1, 2025" },
  { id: "R-009", title: "Unpatched critical vulnerabilities", category: "Security", severity: "Low", score: 28, status: "Monitoring", owner: "Rachel Green", linkedControl: "Vulnerability mgmt", lastReview: "May 5, 2025", nextReview: "Jun 5, 2025", reason: "Two unpatched CVEs in staging.", impact: "Limited.", likelihood: "Low", treatment: "Patch in next maintenance window.", frameworks: ["nist-csf"], dueDate: "Jun 20, 2025" },
];

export const gaps: Gap[] = [
  { id: "G-001", title: "Missing MFA evidence for admin accounts", framework: "ISO 27001", severity: "Critical", progress: 18, status: "In remediation", owner: "Sarah Chen", linkedControl: "MFA for admin accounts", dueDate: "Jun 15, 2025", updated: "May 10, 2025", reason: "No screenshots demonstrating MFA enforcement on admin accounts.", requiredEvidence: ["MFA enrollment screenshot", "Identity provider configuration export"], remediationSteps: ["Audit admin accounts", "Enroll all admins in MFA", "Collect screenshots"] },
  { id: "G-002", title: "Vendor review overdue for AWS", framework: "NIST CSF", severity: "High", progress: 35, status: "Awaiting evidence", owner: "Michael Lee", linkedControl: "Vendor assessments", dueDate: "Jun 10, 2025", updated: "May 8, 2025", reason: "Annual AWS review past due.", requiredEvidence: ["AWS SOC 2 Type II", "Service review notes"], remediationSteps: ["Request latest SOC 2", "Complete questionnaire", "Sign off"] },
  { id: "G-003", title: "Incident response playbook not approved", framework: "ISO 27001", severity: "High", progress: 40, status: "Open", owner: "Priya Nair", linkedControl: "Incident response plan", dueDate: "Jul 1, 2025", updated: "Apr 30, 2025", reason: "Playbook draft missing executive sign-off.", requiredEvidence: ["Signed IR plan"], remediationSteps: ["Finalize draft", "Route for approval", "Publish"] },
  { id: "G-004", title: "Access review not completed", framework: "NIST CSF", severity: "High", progress: 60, status: "In remediation", owner: "Laura Patel", linkedControl: "Access reviews", dueDate: "Jun 20, 2025", updated: "May 9, 2025", reason: "Q2 access review still in progress.", requiredEvidence: ["Reviewer attestations"], remediationSteps: ["Complete review", "File attestations"] },
  { id: "G-005", title: "Data retention policy gap", framework: "ISO 27001", severity: "Medium", progress: 25, status: "Open", owner: "Ari Ramos", linkedControl: "Data retention policy", dueDate: "Aug 1, 2025", updated: "May 1, 2025", reason: "No documented retention schedule for analytics data.", requiredEvidence: ["Retention schedule document"], remediationSteps: ["Define schedule", "Get legal approval"] },
  { id: "G-006", title: "Backup testing evidence missing", framework: "NIST CSF", severity: "Medium", progress: 10, status: "Blocked", owner: "David Kim", linkedControl: "Backup & recovery", dueDate: "Jun 30, 2025", updated: "Apr 28, 2025", reason: "No restore drill performed this quarter.", requiredEvidence: ["Restore test log"], remediationSteps: ["Schedule restore drill", "Document results"] },
  { id: "G-007", title: "Asset inventory classification incomplete", framework: "NIST CSF", severity: "Low", progress: 50, status: "Closed", owner: "Tom Black", linkedControl: "Asset inventory", dueDate: "May 5, 2025", updated: "May 5, 2025", reason: "Classification labels missing on 12 assets.", requiredEvidence: ["Inventory export"], remediationSteps: ["Label assets", "Export inventory"] },
];

export const tasks: Task[] = [
  { id: "T-001", title: "Enable MFA for admin accounts", framework: "ISO 27001", priority: "Critical", progress: 65, status: "In progress", owner: "Sarah Chen", linkedControl: "MFA for admin accounts", dueDate: "Jun 15, 2025", updated: "May 10, 2025", relatedGap: "G-001", summary: "Roll out hardware-token MFA to all admin accounts and collect evidence.", checklist: [{ id: "c1", text: "Audit all admin accounts", done: true }, { id: "c2", text: "Distribute hardware tokens", done: true }, { id: "c3", text: "Enroll all admins in MFA", done: false }, { id: "c4", text: "Collect MFA screenshots", done: false }] },
  { id: "T-002", title: "Review AWS vendor security posture", framework: "NIST CSF", priority: "High", progress: 35, status: "Awaiting evidence", owner: "Michael Lee", linkedControl: "Vendor assessments", dueDate: "Jun 10, 2025", updated: "May 8, 2025", relatedGap: "G-002", summary: "Complete AWS annual vendor review.", checklist: [{ id: "c1", text: "Request SOC 2 report", done: true }, { id: "c2", text: "Complete questionnaire", done: false }, { id: "c3", text: "Sign off review", done: false }] },
  { id: "T-003", title: "Finalize incident response playbook", framework: "ISO 27001", priority: "High", progress: 42, status: "Open", owner: "Priya Nair", linkedControl: "Incident response plan", dueDate: "Jul 1, 2025", updated: "Apr 30, 2025", relatedGap: "G-003", summary: "Finalize and publish the IR playbook.", checklist: [{ id: "c1", text: "Draft new playbook", done: true }, { id: "c2", text: "Route for executive approval", done: false }, { id: "c3", text: "Publish to runbook library", done: false }] },
  { id: "T-004", title: "Complete quarterly access review", framework: "NIST CSF", priority: "High", progress: 60, status: "In progress", owner: "Laura Patel", linkedControl: "Access reviews", dueDate: "Jun 20, 2025", updated: "May 9, 2025", relatedGap: "G-004", summary: "Finish Q2 access review.", checklist: [{ id: "c1", text: "Generate access report", done: true }, { id: "c2", text: "Send to reviewers", done: true }, { id: "c3", text: "Collect attestations", done: false }] },
  { id: "T-005", title: "Update data retention policy", framework: "ISO 27001", priority: "Medium", progress: 22, status: "Open", owner: "Ari Ramos", linkedControl: "Data retention policy", dueDate: "Aug 1, 2025", updated: "May 1, 2025", relatedGap: "G-005", summary: "Document and approve retention schedule.", checklist: [{ id: "c1", text: "Draft retention schedule", done: true }, { id: "c2", text: "Legal review", done: false }] },
  { id: "T-006", title: "Validate backup testing evidence", framework: "NIST CSF", priority: "Medium", progress: 10, status: "Blocked", owner: "David Kim", linkedControl: "Backup & recovery", dueDate: "Jun 30, 2025", updated: "Apr 28, 2025", relatedGap: "G-006", summary: "Run restore drill and log results.", checklist: [{ id: "c1", text: "Schedule drill", done: false }, { id: "c2", text: "Run restore", done: false }] },
  { id: "T-007", title: "Close asset inventory classification task", framework: "NIST CSF", priority: "Low", progress: 100, status: "Closed", owner: "Tom Black", linkedControl: "Asset inventory", dueDate: "May 5, 2025", updated: "May 5, 2025", relatedGap: "G-007", summary: "Final labels applied and inventory exported.", checklist: [{ id: "c1", text: "Apply labels", done: true }, { id: "c2", text: "Export inventory", done: true }] },
];

export const reports: Report[] = [
  { id: "rep-exec", name: "Executive Summary", type: "Executive", status: "Ready", generated: "May 12, 2026", owner: "Security Team", sections: ["Readiness score", "Critical risks", "Top vendors", "Recommended actions"] },
  { id: "rep-iso", name: "ISO 27001 Readiness Report", type: "Framework", status: "Ready", generated: "May 2026", owner: "Security Team", sections: ["Readiness score", "Completed controls", "Open gaps", "High-risk vendors", "Recommended actions"] },
  { id: "rep-vendor", name: "Vendor Risk Summary", type: "Vendor", status: "Draft", generated: "May 8, 2026", owner: "Security Team", sections: ["Vendor inventory", "Risk distribution", "Open reviews"] },
  { id: "rep-gap", name: "Gap Remediation Report", type: "Gap", status: "Needs update", generated: "Apr 30, 2026", owner: "Security Team", sections: ["Open gaps", "In remediation", "Closed this quarter"] },
  { id: "rep-risk", name: "Risk Overview Report", type: "Risk", status: "Ready", generated: "May 5, 2026", owner: "Security Team", sections: ["Risk exposure", "Top risks", "Treatment progress"] },
];

export const integrations: Integration[] = [
  { id: "google-workspace", name: "Google Workspace", category: "Identity providers", status: "Available", capabilities: ["Access", "Discovery", "Users"] },
  { id: "github", name: "GitHub", category: "Version control", status: "Connected", capabilities: ["Code", "Security", "Repository controls"], lastSync: "1 hour ago", workspace: "averonix-org" },
  { id: "aws", name: "AWS", category: "Cloud providers", status: "Available", capabilities: ["Cloud inventory", "IAM", "Encryption checks"] },
  { id: "microsoft-365", name: "Microsoft 365", category: "Productivity", status: "Available", capabilities: ["Identity", "Email", "Productivity"] },
  { id: "slack", name: "Slack", category: "Communication", status: "Available", capabilities: ["Communication", "Vendor discovery"] },
  { id: "cloudflare", name: "Cloudflare", category: "Security tools", status: "Available", capabilities: ["DNS", "WAF", "Edge security"] },
];

export const activities: Activity[] = [
  { id: "a1", text: "Evidence uploaded for ISO 27001:2022", time: "2h ago" },
  { id: "a2", text: "Control updated: A.12.6.1", time: "4h ago" },
  { id: "a3", text: "Gap closed for GDPR – DSR-01", time: "Yesterday" },
  { id: "a4", text: "Security review completed for Atlassian", time: "2d ago" },
  { id: "a5", text: "Vendor added: Notion", time: "3d ago" },
];

export const evidenceGaps = { critical: 12, high: 18, medium: 37, low: 9 };
