import type {
  GoogleWorkspaceGroup,
  GoogleWorkspaceUser,
} from "@/lib/integrations/google-workspace/types";
import type { GoogleWorkspaceConfig } from "./config";

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface GoogleDirectorySnapshot {
  users: GoogleWorkspaceUser[];
  groups: GoogleWorkspaceGroup[];
  googleCustomerId: string | null;
  loginActivityAvailable: boolean;
  adminActivityAvailable: boolean;
  loginActivityError: string | null;
}

interface GoogleUserResource {
  id?: string;
  primaryEmail?: string;
  name?: { fullName?: string };
  isAdmin?: boolean;
  isDelegatedAdmin?: boolean;
  suspended?: boolean;
  orgUnitPath?: string;
  lastLoginTime?: string;
  creationTime?: string;
  customerId?: string;
}

interface GoogleGroupResource {
  id?: string;
  email?: string;
  name?: string;
  description?: string;
  directMembersCount?: string;
}

interface GoogleActivityResource {
  id?: { customerId?: string };
}

export class GoogleWorkspaceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly googleError?: unknown,
  ) {
    super(message);
  }
}

export function buildGoogleAuthorizationUrl(config: GoogleWorkspaceConfig, state: string): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeAuthorizationCode(
  config: GoogleWorkspaceConfig,
  code: string,
): Promise<GoogleTokenResponse> {
  return tokenRequest({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });
}

export async function refreshAccessToken(
  config: GoogleWorkspaceConfig,
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  return tokenRequest({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function revokeGoogleToken(token: string): Promise<void> {
  const response = await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  });

  if (!response.ok && response.status !== 400) {
    throw new GoogleWorkspaceApiError("Google token revoke failed", response.status, await safeJson(response));
  }
}

export async function fetchGoogleDirectorySnapshot(accessToken: string): Promise<GoogleDirectorySnapshot> {
  const users = await fetchAllUsers(accessToken);
  const googleCustomerId = users.find((user) => user.customerId)?.customerId ?? null;
  const groups = await fetchAllGroups(accessToken);
  const [loginActivity, adminActivity] = await Promise.all([
    fetchAuditActivity(accessToken, "login", googleCustomerId),
    fetchAuditActivity(accessToken, "admin", googleCustomerId),
  ]);
  const now = new Date().toISOString();

  return {
    users: users.map((user) => normalizeUser(user, now)),
    groups: groups.map((group) => normalizeGroup(group, now)),
    googleCustomerId: googleCustomerId ?? loginActivity.googleCustomerId,
    loginActivityAvailable: loginActivity.available,
    adminActivityAvailable: adminActivity.available,
    loginActivityError: loginActivity.error,
  };
}

export async function fetchGoogleCustomerHint(accessToken: string): Promise<string | null> {
  const url = new URL("https://admin.googleapis.com/admin/directory/v1/users");
  url.searchParams.set("customer", "my_customer");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("projection", "basic");

  try {
    const payload = await googleApiGet(accessToken, url);
    const users = Array.isArray(payload.users) ? (payload.users as GoogleUserResource[]) : [];
    return users[0]?.customerId ?? null;
  } catch (error) {
    if (error instanceof GoogleWorkspaceApiError && error.status === 403) return null;
    throw error;
  }
}

async function tokenRequest(params: Record<string, string>): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    throw new GoogleWorkspaceApiError("Google OAuth token exchange failed", response.status, payload);
  }

  if (!isRecord(payload) || typeof payload.access_token !== "string") {
    throw new GoogleWorkspaceApiError("Google OAuth response did not include an access token", response.status, payload);
  }

  return payload as unknown as GoogleTokenResponse;
}

async function fetchAllUsers(accessToken: string): Promise<GoogleUserResource[]> {
  const users: GoogleUserResource[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://admin.googleapis.com/admin/directory/v1/users");
    url.searchParams.set("customer", "my_customer");
    url.searchParams.set("maxResults", "200");
    url.searchParams.set("projection", "full");
    url.searchParams.set("orderBy", "email");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const payload = await googleApiGet(accessToken, url);
    if (Array.isArray(payload.users)) users.push(...(payload.users as GoogleUserResource[]));
    pageToken = typeof payload.nextPageToken === "string" ? payload.nextPageToken : undefined;
  } while (pageToken);

  return users;
}

async function fetchAllGroups(accessToken: string): Promise<GoogleGroupResource[]> {
  const groups: GoogleGroupResource[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://admin.googleapis.com/admin/directory/v1/groups");
    url.searchParams.set("customer", "my_customer");
    url.searchParams.set("maxResults", "200");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const payload = await googleApiGet(accessToken, url);
    if (Array.isArray(payload.groups)) groups.push(...(payload.groups as GoogleGroupResource[]));
    pageToken = typeof payload.nextPageToken === "string" ? payload.nextPageToken : undefined;
  } while (pageToken);

  return groups;
}

async function fetchAuditActivity(
  accessToken: string,
  applicationName: "login" | "admin",
  googleCustomerId: string | null,
): Promise<{ available: boolean; googleCustomerId: string | null; error: string | null }> {
  const url = new URL(`https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/${applicationName}`);
  url.searchParams.set("maxResults", "25");
  if (googleCustomerId) url.searchParams.set("customerId", googleCustomerId);

  try {
    const payload = await googleApiGet(accessToken, url);
    const activities = Array.isArray(payload.items) ? (payload.items as GoogleActivityResource[]) : [];
    const activityCustomerId = activities.find((item) => item.id?.customerId)?.id?.customerId ?? null;
    return { available: true, googleCustomerId: activityCustomerId, error: null };
  } catch (error) {
    if (error instanceof GoogleWorkspaceApiError) {
      return {
        available: false,
        googleCustomerId: null,
        error: error.status === 403 ? permissionMessage() : error.message,
      };
    }
    throw error;
  }
}

async function googleApiGet(accessToken: string, url: URL): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });
  const payload = await safeJson(response);

  if (!response.ok) {
    const message = response.status === 403 ? permissionMessage() : googleErrorMessage(payload, response.status);
    throw new GoogleWorkspaceApiError(message, response.status, payload);
  }

  return isRecord(payload) ? payload : {};
}

function normalizeUser(user: GoogleUserResource, now: string): GoogleWorkspaceUser {
  const googleUserId = user.id ?? user.primaryEmail ?? crypto.randomUUID();
  return {
    id: `gw_user_${googleUserId}`,
    google_user_id: googleUserId,
    primary_email: user.primaryEmail ?? "unknown-user",
    full_name: user.name?.fullName ?? user.primaryEmail ?? "Unknown user",
    is_admin: Boolean(user.isAdmin),
    is_delegated_admin: Boolean(user.isDelegatedAdmin),
    is_suspended: Boolean(user.suspended),
    org_unit_path: user.orgUnitPath ?? null,
    last_login_time: normalizeLastLogin(user.lastLoginTime),
    created_at: user.creationTime ?? now,
    updated_at: now,
  };
}

function normalizeGroup(group: GoogleGroupResource, now: string): GoogleWorkspaceGroup {
  const googleGroupId = group.id ?? group.email ?? crypto.randomUUID();
  return {
    id: `gw_group_${googleGroupId}`,
    google_group_id: googleGroupId,
    email: group.email ?? "unknown-group",
    name: group.name ?? group.email ?? "Unknown group",
    description: group.description ?? null,
    direct_members_count: Number(group.directMembersCount ?? 0),
    created_at: now,
    updated_at: now,
  };
}

function normalizeLastLogin(value: string | undefined): string | null {
  if (!value || value.startsWith("1970-01-01")) return null;
  return value;
}

function googleErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const error = payload.error;
    if (isRecord(error) && typeof error.message === "string") return error.message;
    if (typeof payload.error_description === "string") return payload.error_description;
  }
  return `Google API request failed with status ${status}`;
}

export function permissionMessage(): string {
  return "This account does not have permission to read Google Workspace directory data. Use a Google Workspace admin account or ask your administrator.";
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
