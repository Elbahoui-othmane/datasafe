import {
  GOOGLE_WORKSPACE_PROVIDER,
  type GoogleWorkspaceStatusResponse,
  type GoogleWorkspaceSyncResponse,
} from "@/lib/integrations/google-workspace/types";
import { deriveGoogleWorkspaceDashboardData } from "@/lib/integrations/google-workspace/mapping";
import {
  getConnectedByUserId,
  getGoogleWorkspaceConfig,
  getGoogleWorkspaceConfigStatus,
  getWorkspaceId,
  GoogleWorkspaceConfigError,
  type GoogleWorkspaceConfig,
} from "./config";
import { createSecureState, decryptSecret, encryptSecret } from "./crypto";
import {
  getGoogleWorkspaceDatabase,
  type GoogleWorkspaceDatabase,
  type IntegrationAccountRecord,
} from "./db";
import {
  buildGoogleAuthorizationUrl,
  exchangeAuthorizationCode,
  fetchGoogleCustomerHint,
  fetchGoogleDirectorySnapshot,
  GoogleWorkspaceApiError,
  permissionMessage,
  refreshAccessToken,
  revokeGoogleToken,
} from "./google-api";
import { countInactiveUsers, generateGoogleWorkspaceFindings } from "./findings";

export async function handleConnectUrl(request: Request): Promise<Response> {
  const config = getGoogleWorkspaceConfig(request);
  const db = await getGoogleWorkspaceDatabase();
  const state = createSecureState();
  const now = new Date();
  const redirectAfter = new URL(request.url).searchParams.get("redirect_after") ?? "/integrations/google-workspace";

  await db.createOAuthState({
    state,
    workspace_id: config.workspaceId,
    provider: GOOGLE_WORKSPACE_PROVIDER,
    connected_by_user_id: getConnectedByUserId(request),
    redirect_after: redirectAfter,
    expires_at: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    created_at: now.toISOString(),
  });

  return json({ url: buildGoogleAuthorizationUrl(config, state) });
}

export async function withGoogleWorkspaceApiErrors(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof GoogleWorkspaceConfigError) {
      return json(
        {
          error: error.message,
          missing: error.missing,
        },
        { status: 400 },
      );
    }
    if (error instanceof GoogleWorkspaceApiError) {
      return json({ error: normalizeErrorMessage(error) }, { status: error.status });
    }
    return json({ error: normalizeErrorMessage(error) }, { status: 500 });
  }
}

export async function handleOAuthCallback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const config = getGoogleWorkspaceConfig(request);
  const db = await getGoogleWorkspaceDatabase();
  const redirectBase = `${config.frontendBaseUrl}/integrations/google-workspace`;

  if (oauthError) {
    return redirectWithStatus(redirectBase, "error", oauthError);
  }

  if (!state || !code) {
    return redirectWithStatus(redirectBase, "error", "Missing OAuth code or state.");
  }

  const oauthState = await db.consumeOAuthState(state);
  if (!oauthState) {
    return redirectWithStatus(redirectBase, "error", "OAuth state expired. Please start the connection again.");
  }

  try {
    const tokens = await exchangeAuthorizationCode(config, code);
    const encryptedAccessToken = await encryptSecret(tokens.access_token, config.tokenEncryptionKey);
    const encryptedRefreshToken = tokens.refresh_token
      ? await encryptSecret(tokens.refresh_token, config.tokenEncryptionKey)
      : null;
    const tokenExpiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;
    const scopes = tokens.scope ? tokens.scope.split(/\s+/).filter(Boolean) : config.scopes;
    const googleCustomerId = await fetchGoogleCustomerHint(tokens.access_token);

    await db.upsertConnectedAccount({
      workspaceId: oauthState.workspace_id,
      connectedByUserId: oauthState.connected_by_user_id,
      googleCustomerId,
      scopes,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
    });

    return redirectWithStatus(redirectBase, "connected", "Google Workspace connected. Run sync to collect evidence.");
  } catch (error) {
    const message = normalizeErrorMessage(error);
    const existingAccount = await db.getAccount(oauthState.workspace_id);
    if (existingAccount) await db.markAccountError(existingAccount.id, message);
    return redirectWithStatus(redirectBase, "error", message);
  }
}

export async function handleStatus(request: Request): Promise<Response> {
  const configStatus = getGoogleWorkspaceConfigStatus();
  const db = await getGoogleWorkspaceDatabase();
  const account = await db.getAccount(getWorkspaceId(request));

  return json(statusResponse(account, configStatus.configured, configStatus.missing, configStatus.scopes));
}

export async function handleDisconnect(request: Request): Promise<Response> {
  const workspaceId = getWorkspaceId(request);
  const config = tryGetConfig(request);
  const db = await getGoogleWorkspaceDatabase();
  const account = await db.getAccount(workspaceId);

  if (account && config) {
    const refreshToken = await decryptSecret(account.encrypted_refresh_token, config.tokenEncryptionKey);
    const accessToken = await decryptSecret(account.encrypted_access_token, config.tokenEncryptionKey);
    const tokenToRevoke = refreshToken ?? accessToken;
    if (tokenToRevoke) {
      try {
        await revokeGoogleToken(tokenToRevoke);
      } catch {
        // Revoke is best-effort; the local integration must still be disconnected.
      }
    }
  }

  await db.disconnectAccount(workspaceId);
  return json({ status: "not_connected" });
}

export async function handleSync(request: Request): Promise<Response> {
  const config = getGoogleWorkspaceConfig(request);
  const db = await getGoogleWorkspaceDatabase();
  const account = await requireConnectedAccount(db, config.workspaceId);

  try {
    const accessToken = await getValidAccessToken(config, db, account);
    const snapshot = await fetchGoogleDirectorySnapshot(accessToken);
    const refreshedAccount = (await db.getAccount(config.workspaceId)) ?? account;
    const findings = generateGoogleWorkspaceFindings({
      account: refreshedAccount,
      users: snapshot.users,
      groups: snapshot.groups,
      loginActivityAvailable: snapshot.loginActivityAvailable,
      loginActivityError: snapshot.loginActivityError,
    });
    const lastSyncAt = new Date().toISOString();

    await db.replaceUsers(refreshedAccount, snapshot.users);
    await db.replaceGroups(refreshedAccount, snapshot.groups);
    await db.replaceFindings(refreshedAccount, findings);
    await db.updateAccountSync(refreshedAccount.id, lastSyncAt, snapshot.googleCustomerId);

    const summary: GoogleWorkspaceSyncResponse["summary"] = {
      total_users: snapshot.users.length,
      total_groups: snapshot.groups.length,
      admin_users_count: snapshot.users.filter((user) => user.is_admin || user.is_delegated_admin).length,
      suspended_users_count: snapshot.users.filter((user) => user.is_suspended).length,
      inactive_users_count: countInactiveUsers(snapshot.users),
      login_activity_available: snapshot.loginActivityAvailable,
      findings_count: findings.length,
      last_sync_at: lastSyncAt,
    };

    return json({ status: "synced", summary } satisfies GoogleWorkspaceSyncResponse);
  } catch (error) {
    const message = normalizeErrorMessage(error);
    await db.markAccountError(account.id, message);
    return json({ error: message }, { status: error instanceof GoogleWorkspaceApiError ? error.status : 500 });
  }
}

export async function handleUsers(request: Request): Promise<Response> {
  const db = await getGoogleWorkspaceDatabase();
  const account = await requireReadableAccount(db, getWorkspaceId(request));
  return json({ users: await db.listUsers(account) });
}

export async function handleGroups(request: Request): Promise<Response> {
  const db = await getGoogleWorkspaceDatabase();
  const account = await requireReadableAccount(db, getWorkspaceId(request));
  return json({ groups: await db.listGroups(account) });
}

export async function handleFindings(request: Request): Promise<Response> {
  const db = await getGoogleWorkspaceDatabase();
  const account = await requireReadableAccount(db, getWorkspaceId(request));
  const findings = await db.listFindings(account);
  return json({ findings, derived: deriveGoogleWorkspaceDashboardData(findings) });
}

async function getValidAccessToken(
  config: GoogleWorkspaceConfig,
  db: GoogleWorkspaceDatabase,
  account: IntegrationAccountRecord,
): Promise<string> {
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
  const accessToken = await decryptSecret(account.encrypted_access_token, config.tokenEncryptionKey);
  if (accessToken && expiresAt > Date.now() + 60_000) return accessToken;

  const refreshToken = await decryptSecret(account.encrypted_refresh_token, config.tokenEncryptionKey);
  if (!refreshToken) {
    throw new Error("Google Workspace refresh token is missing. Reconnect with admin consent.");
  }

  const tokens = await refreshAccessToken(config, refreshToken);
  const encryptedAccessToken = await encryptSecret(tokens.access_token, config.tokenEncryptionKey);
  const encryptedRefreshToken = tokens.refresh_token
    ? await encryptSecret(tokens.refresh_token, config.tokenEncryptionKey)
    : null;
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;
  await db.updateAccountTokens(account.id, encryptedAccessToken, encryptedRefreshToken, tokenExpiresAt);
  return tokens.access_token;
}

async function requireConnectedAccount(
  db: GoogleWorkspaceDatabase,
  workspaceId: string,
): Promise<IntegrationAccountRecord> {
  const account = await db.getAccount(workspaceId);
  if (!account || account.status !== "connected" || !account.encrypted_refresh_token) {
    throw new Response(JSON.stringify({ error: "Google Workspace is not connected." }), {
      status: 409,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return account;
}

async function requireReadableAccount(
  db: GoogleWorkspaceDatabase,
  workspaceId: string,
): Promise<IntegrationAccountRecord> {
  const account = await db.getAccount(workspaceId);
  if (!account || account.status === "not_connected") {
    throw new Response(JSON.stringify({ error: "Google Workspace is not connected." }), {
      status: 409,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return account;
}

function statusResponse(
  account: IntegrationAccountRecord | null,
  configured: boolean,
  missing: string[],
  defaultScopes: string[],
): GoogleWorkspaceStatusResponse {
  return {
    provider: GOOGLE_WORKSPACE_PROVIDER,
    status: account?.status ?? "not_connected",
    connected: account?.status === "connected",
    configured,
    missing,
    google_customer_id: account?.google_customer_id ?? null,
    last_sync_at: account?.last_sync_at ?? null,
    scopes: account?.scopes?.length ? account.scopes : defaultScopes,
    error: account?.error_message ?? null,
  };
}

function tryGetConfig(request: Request): GoogleWorkspaceConfig | null {
  try {
    return getGoogleWorkspaceConfig(request);
  } catch (error) {
    if (error instanceof GoogleWorkspaceConfigError) return null;
    throw error;
  }
}

function redirectWithStatus(base: string, status: string, message: string): Response {
  const url = new URL(base);
  url.searchParams.set("googleWorkspace", status);
  url.searchParams.set("message", message);
  return Response.redirect(url.toString(), 302);
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof GoogleWorkspaceApiError && error.status === 403) return permissionMessage();
  if (error instanceof GoogleWorkspaceApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Google Workspace integration failed.";
}

function json(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}
