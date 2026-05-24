export const GOOGLE_WORKSPACE_PROVIDER = "google_workspace" as const;

export const GOOGLE_WORKSPACE_REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
  "https://www.googleapis.com/auth/admin.directory.group.readonly",
  "https://www.googleapis.com/auth/admin.reports.audit.readonly",
] as const;

export type GoogleWorkspaceProvider = typeof GOOGLE_WORKSPACE_PROVIDER;
export type GoogleWorkspaceConnectionStatus = "connected" | "not_connected" | "error";
export type GoogleWorkspaceFindingSeverity = "info" | "low" | "medium" | "high" | "critical";
export type GoogleWorkspaceFindingStatus = "open" | "in_review" | "resolved";

export interface GoogleWorkspaceStatusResponse {
  provider: GoogleWorkspaceProvider;
  status: GoogleWorkspaceConnectionStatus;
  connected: boolean;
  configured: boolean;
  missing: string[];
  google_customer_id: string | null;
  last_sync_at: string | null;
  scopes: string[];
  error: string | null;
}

export interface GoogleWorkspaceUser {
  id: string;
  google_user_id: string;
  primary_email: string;
  full_name: string;
  is_admin: boolean;
  is_delegated_admin: boolean;
  is_suspended: boolean;
  org_unit_path: string | null;
  last_login_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoogleWorkspaceGroup {
  id: string;
  google_group_id: string;
  email: string;
  name: string;
  description: string | null;
  direct_members_count: number;
  created_at: string;
  updated_at: string;
}

export interface GoogleWorkspaceFinding {
  id: string;
  provider: GoogleWorkspaceProvider;
  integration_account_id: string;
  finding_type: string;
  severity: GoogleWorkspaceFindingSeverity;
  title: string;
  description: string;
  linked_control_id: string | null;
  source_object_id: string | null;
  status: GoogleWorkspaceFindingStatus;
  created_at: string;
  updated_at: string;
}

export interface GoogleWorkspaceSyncSummary {
  total_users: number;
  total_groups: number;
  admin_users_count: number;
  suspended_users_count: number;
  inactive_users_count: number | null;
  login_activity_available: boolean;
  findings_count: number;
  last_sync_at: string;
}

export interface GoogleWorkspaceSyncResponse {
  status: "synced";
  summary: GoogleWorkspaceSyncSummary;
}

export interface GoogleWorkspaceUsersResponse {
  users: GoogleWorkspaceUser[];
}

export interface GoogleWorkspaceGroupsResponse {
  groups: GoogleWorkspaceGroup[];
}

export interface GoogleWorkspaceFindingsResponse {
  findings: GoogleWorkspaceFinding[];
  derived: GoogleWorkspaceDerivedDashboardData;
}

export interface GoogleWorkspaceDerivedItem {
  id: string;
  title: string;
  severity?: GoogleWorkspaceFindingSeverity;
  status: string;
  linked_finding_id: string | null;
  linked_control_id: string | null;
  description: string;
}

export interface GoogleWorkspaceDerivedDashboardData {
  evidence: GoogleWorkspaceDerivedItem[];
  tests: GoogleWorkspaceDerivedItem[];
  gaps: GoogleWorkspaceDerivedItem[];
  risks: GoogleWorkspaceDerivedItem[];
  tasks: GoogleWorkspaceDerivedItem[];
}
