import {
  GOOGLE_WORKSPACE_PROVIDER,
  type GoogleWorkspaceFinding,
  type GoogleWorkspaceGroup,
  type GoogleWorkspaceUser,
} from "@/lib/integrations/google-workspace/types";
import type { IntegrationAccountRecord } from "./db";

const ACCESS_CONTROL_ID = "iso-27001-access-control";
const INACTIVE_DAYS = 90;

export interface FindingInput {
  account: IntegrationAccountRecord;
  users: GoogleWorkspaceUser[];
  groups: GoogleWorkspaceGroup[];
  loginActivityAvailable: boolean;
  loginActivityError: string | null;
}

export function generateGoogleWorkspaceFindings({
  account,
  users,
  groups,
  loginActivityAvailable,
  loginActivityError,
}: FindingInput): GoogleWorkspaceFinding[] {
  const now = new Date().toISOString();
  const findings: GoogleWorkspaceFinding[] = [];
  const adminUsers = users.filter((user) => user.is_admin || user.is_delegated_admin);
  const suspendedUsers = users.filter((user) => user.is_suspended);

  if (users.length > 0) {
    findings.push(createFinding(account, now, {
      type: "evidence",
      severity: "info",
      title: "Admin accounts inventory available",
      description: `${users.length} Google Workspace users synced, including ${adminUsers.length} administrator account${adminUsers.length === 1 ? "" : "s"}.`,
      sourceObjectId: account.google_customer_id,
    }));
  }

  if (suspendedUsers.length > 0) {
    findings.push(createFinding(account, now, {
      type: "user_lifecycle",
      severity: "medium",
      title: "Suspended users exist",
      description: `${suspendedUsers.length} suspended Google Workspace user${suspendedUsers.length === 1 ? "" : "s"} should be reviewed for access removal evidence.`,
      sourceObjectId: suspendedUsers[0]?.google_user_id ?? null,
    }));
  }

  if (adminUsers.length > 0) {
    findings.push(createFinding(account, now, {
      type: "privileged_access",
      severity: "high",
      title: "Admin users require review",
      description: `${adminUsers.length} Google Workspace administrator account${adminUsers.length === 1 ? "" : "s"} require privileged access review evidence.`,
      sourceObjectId: adminUsers[0]?.google_user_id ?? null,
    }));
  }

  if (!loginActivityAvailable) {
    findings.push(createFinding(account, now, {
      type: "evidence_gap",
      severity: "medium",
      title: "Login activity not available",
      description: loginActivityError ?? "Averonix could not read Google Workspace login activity for access-control evidence.",
      sourceObjectId: account.google_customer_id,
    }));
  }

  if (groups.length > 0) {
    findings.push(createFinding(account, now, {
      type: "access_review",
      severity: "medium",
      title: "Groups require review",
      description: `${groups.length} Google Workspace group${groups.length === 1 ? "" : "s"} synced and ready for access review.`,
      sourceObjectId: groups[0]?.google_group_id ?? null,
    }));
  }

  return findings;
}

export function countInactiveUsers(users: GoogleWorkspaceUser[]): number | null {
  const usersWithLoginData = users.filter((user) => user.last_login_time);
  if (usersWithLoginData.length === 0) return null;

  const cutoff = Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000;
  return usersWithLoginData.filter((user) => new Date(user.last_login_time!).getTime() < cutoff).length;
}

function createFinding(
  account: IntegrationAccountRecord,
  now: string,
  input: {
    type: string;
    severity: GoogleWorkspaceFinding["severity"];
    title: string;
    description: string;
    sourceObjectId: string | null | undefined;
  },
): GoogleWorkspaceFinding {
  return {
    id: `gw_find_${input.type}_${account.id}`,
    provider: GOOGLE_WORKSPACE_PROVIDER,
    integration_account_id: account.id,
    finding_type: input.type,
    severity: input.severity,
    title: input.title,
    description: input.description,
    linked_control_id: ACCESS_CONTROL_ID,
    source_object_id: input.sourceObjectId ?? null,
    status: "open",
    created_at: now,
    updated_at: now,
  };
}
