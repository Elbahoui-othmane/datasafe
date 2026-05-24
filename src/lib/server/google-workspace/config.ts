import {
  GOOGLE_WORKSPACE_PROVIDER,
  GOOGLE_WORKSPACE_REQUIRED_SCOPES,
} from "@/lib/integrations/google-workspace/types";
import { readEnvString } from "./runtime-env";

export interface GoogleWorkspaceConfig {
  provider: typeof GOOGLE_WORKSPACE_PROVIDER;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  tokenEncryptionKey: string;
  frontendBaseUrl: string;
  workspaceId: string;
}

export interface GoogleWorkspaceConfigStatus {
  configured: boolean;
  missing: string[];
  scopes: string[];
}

export function getGoogleWorkspaceConfig(request: Request): GoogleWorkspaceConfig {
  const missing: string[] = [];
  const clientId = requiredEnv("GOOGLE_CLIENT_ID", missing);
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET", missing);
  const tokenEncryptionKey = requiredEnv("INTEGRATION_TOKEN_ENCRYPTION_KEY", missing);
  const requestUrl = new URL(request.url);
  const redirectUri =
    readEnvString("GOOGLE_REDIRECT_URI") ??
    `${requestUrl.origin}/api/integrations/google-workspace/oauth/callback`;
  const frontendBaseUrl =
    readEnvString("AVERONIX_FRONTEND_BASE_URL") ??
    requestUrl.origin;

  if (missing.length > 0) {
    throw new GoogleWorkspaceConfigError(missing);
  }

  return {
    provider: GOOGLE_WORKSPACE_PROVIDER,
    clientId,
    clientSecret,
    redirectUri,
    scopes: getGoogleWorkspaceScopes(),
    tokenEncryptionKey,
    frontendBaseUrl,
    workspaceId: getWorkspaceId(request),
  };
}

export function getGoogleWorkspaceConfigStatus(): GoogleWorkspaceConfigStatus {
  const missing = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "INTEGRATION_TOKEN_ENCRYPTION_KEY"].filter(
    (name) => !readEnvString(name),
  );

  return {
    configured: missing.length === 0,
    missing,
    scopes: getGoogleWorkspaceScopes(),
  };
}

export function getWorkspaceId(request: Request): string {
  return (
    request.headers.get("x-averonix-workspace-id") ??
    readEnvString("AVERONIX_WORKSPACE_ID") ??
    "default-workspace"
  );
}

export function getConnectedByUserId(request: Request): string | null {
  return request.headers.get("x-averonix-user-id") ?? readEnvString("AVERONIX_CONNECTED_BY_USER_ID") ?? null;
}

export class GoogleWorkspaceConfigError extends Error {
  constructor(readonly missing: string[]) {
    super(`Google Workspace integration is missing configuration: ${missing.join(", ")}`);
  }
}

function getGoogleWorkspaceScopes(): string[] {
  const configured = readEnvString("GOOGLE_WORKSPACE_SCOPES");
  if (!configured) return [...GOOGLE_WORKSPACE_REQUIRED_SCOPES];
  return configured
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function requiredEnv(name: string, missing: string[]): string {
  const value = readEnvString(name);
  if (!value) {
    missing.push(name);
    return "";
  }
  return value;
}
