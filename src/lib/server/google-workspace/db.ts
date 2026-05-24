import {
  GOOGLE_WORKSPACE_PROVIDER,
  type GoogleWorkspaceFinding,
  type GoogleWorkspaceGroup,
  type GoogleWorkspaceUser,
} from "@/lib/integrations/google-workspace/types";
import { readEnvBinding, readEnvString } from "./runtime-env";

export interface IntegrationAccountRecord {
  id: string;
  workspace_id: string;
  provider: typeof GOOGLE_WORKSPACE_PROVIDER;
  status: "connected" | "not_connected" | "error";
  google_customer_id: string | null;
  connected_by_user_id: string | null;
  scopes: string[];
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  token_expires_at: string | null;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface OAuthStateRecord {
  state: string;
  workspace_id: string;
  provider: typeof GOOGLE_WORKSPACE_PROVIDER;
  connected_by_user_id: string | null;
  redirect_after: string | null;
  expires_at: string;
  created_at: string;
}

export interface UpsertConnectedAccountInput {
  workspaceId: string;
  connectedByUserId: string | null;
  googleCustomerId: string | null;
  scopes: string[];
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: string | null;
}

export interface GoogleWorkspaceDatabase {
  getAccount(workspaceId: string): Promise<IntegrationAccountRecord | null>;
  upsertConnectedAccount(input: UpsertConnectedAccountInput): Promise<IntegrationAccountRecord>;
  updateAccountTokens(
    accountId: string,
    encryptedAccessToken: string,
    encryptedRefreshToken: string | null,
    tokenExpiresAt: string | null,
  ): Promise<void>;
  updateAccountSync(accountId: string, lastSyncAt: string, googleCustomerId: string | null): Promise<void>;
  markAccountError(accountId: string, message: string): Promise<void>;
  disconnectAccount(workspaceId: string): Promise<void>;
  createOAuthState(state: OAuthStateRecord): Promise<void>;
  consumeOAuthState(state: string): Promise<OAuthStateRecord | null>;
  replaceUsers(account: IntegrationAccountRecord, users: GoogleWorkspaceUser[]): Promise<void>;
  replaceGroups(account: IntegrationAccountRecord, groups: GoogleWorkspaceGroup[]): Promise<void>;
  replaceFindings(account: IntegrationAccountRecord, findings: GoogleWorkspaceFinding[]): Promise<void>;
  listUsers(account: IntegrationAccountRecord): Promise<GoogleWorkspaceUser[]>;
  listGroups(account: IntegrationAccountRecord): Promise<GoogleWorkspaceGroup[]>;
  listFindings(account: IntegrationAccountRecord): Promise<GoogleWorkspaceFinding[]>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface LocalDbShape {
  integration_accounts: StoredIntegrationAccount[];
  google_workspace_users: StoredGoogleWorkspaceUser[];
  google_workspace_groups: StoredGoogleWorkspaceGroup[];
  integration_findings: StoredGoogleWorkspaceFinding[];
  integration_oauth_states: StoredOAuthState[];
}

type StoredIntegrationAccount = Omit<IntegrationAccountRecord, "scopes"> & { scopes: string };
type StoredGoogleWorkspaceUser = GoogleWorkspaceUser & { workspace_id: string; integration_account_id: string };
type StoredGoogleWorkspaceGroup = GoogleWorkspaceGroup & { workspace_id: string; integration_account_id: string };
type StoredGoogleWorkspaceFinding = GoogleWorkspaceFinding & { workspace_id: string };
type StoredOAuthState = OAuthStateRecord;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS integration_accounts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    google_customer_id TEXT,
    connected_by_user_id TEXT,
    scopes TEXT NOT NULL,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    token_expires_at TEXT,
    last_sync_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_accounts_workspace_provider
    ON integration_accounts (workspace_id, provider)`,
  `CREATE TABLE IF NOT EXISTS google_workspace_users (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    integration_account_id TEXT NOT NULL,
    google_user_id TEXT NOT NULL,
    primary_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_admin INTEGER NOT NULL,
    is_delegated_admin INTEGER NOT NULL,
    is_suspended INTEGER NOT NULL,
    org_unit_path TEXT,
    last_login_time TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_google_workspace_users_account
    ON google_workspace_users (integration_account_id)`,
  `CREATE TABLE IF NOT EXISTS google_workspace_groups (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    integration_account_id TEXT NOT NULL,
    google_group_id TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    direct_members_count INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_google_workspace_groups_account
    ON google_workspace_groups (integration_account_id)`,
  `CREATE TABLE IF NOT EXISTS integration_findings (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    integration_account_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    finding_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    linked_control_id TEXT,
    source_object_id TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_integration_findings_account
    ON integration_findings (integration_account_id)`,
  `CREATE TABLE IF NOT EXISTS integration_oauth_states (
    state TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    connected_by_user_id TEXT,
    redirect_after TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
];

let cachedDb: Promise<GoogleWorkspaceDatabase> | null = null;

export function getGoogleWorkspaceDatabase(): Promise<GoogleWorkspaceDatabase> {
  if (!cachedDb) {
    cachedDb = createGoogleWorkspaceDatabase();
  }
  return cachedDb;
}

async function createGoogleWorkspaceDatabase(): Promise<GoogleWorkspaceDatabase> {
  const d1 = readEnvBinding<D1Database>(["AVERONIX_DB", "DB", "DATABASE"]);
  if (d1 && typeof d1.prepare === "function") {
    const db = new D1GoogleWorkspaceDatabase(d1);
    await db.ensureSchema();
    return db;
  }

  return new LocalFileGoogleWorkspaceDatabase(
    readEnvString("AVERONIX_LOCAL_DB_PATH") ?? ".averonix/google-workspace-db.json",
  );
}

class D1GoogleWorkspaceDatabase implements GoogleWorkspaceDatabase {
  constructor(private readonly db: D1Database) {}

  async ensureSchema() {
    for (const statement of SCHEMA_STATEMENTS) {
      await this.db.prepare(statement).run();
    }
  }

  async getAccount(workspaceId: string): Promise<IntegrationAccountRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM integration_accounts WHERE workspace_id = ? AND provider = ? LIMIT 1")
      .bind(workspaceId, GOOGLE_WORKSPACE_PROVIDER)
      .first<StoredIntegrationAccount>();
    return row ? normalizeAccount(row) : null;
  }

  async upsertConnectedAccount(input: UpsertConnectedAccountInput): Promise<IntegrationAccountRecord> {
    const existing = await this.getAccount(input.workspaceId);
    const now = new Date().toISOString();
    const id = existing?.id ?? `int_gw_${crypto.randomUUID()}`;
    await this.db
      .prepare(
        `INSERT INTO integration_accounts (
          id, workspace_id, provider, status, google_customer_id, connected_by_user_id, scopes,
          encrypted_access_token, encrypted_refresh_token, token_expires_at, last_sync_at,
          error_message, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(workspace_id, provider) DO UPDATE SET
          status = excluded.status,
          google_customer_id = excluded.google_customer_id,
          connected_by_user_id = excluded.connected_by_user_id,
          scopes = excluded.scopes,
          encrypted_access_token = excluded.encrypted_access_token,
          encrypted_refresh_token = COALESCE(excluded.encrypted_refresh_token, integration_accounts.encrypted_refresh_token),
          token_expires_at = excluded.token_expires_at,
          error_message = NULL,
          updated_at = excluded.updated_at`,
      )
      .bind(
        id,
        input.workspaceId,
        GOOGLE_WORKSPACE_PROVIDER,
        "connected",
        input.googleCustomerId,
        input.connectedByUserId,
        JSON.stringify(input.scopes),
        input.encryptedAccessToken,
        input.encryptedRefreshToken,
        input.tokenExpiresAt,
        existing?.last_sync_at ?? null,
        null,
        existing?.created_at ?? now,
        now,
      )
      .run();

    const account = await this.getAccount(input.workspaceId);
    if (!account) throw new Error("Failed to persist Google Workspace integration account");
    return account;
  }

  async updateAccountTokens(
    accountId: string,
    encryptedAccessToken: string,
    encryptedRefreshToken: string | null,
    tokenExpiresAt: string | null,
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE integration_accounts
         SET encrypted_access_token = ?,
             encrypted_refresh_token = COALESCE(?, encrypted_refresh_token),
             token_expires_at = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(encryptedAccessToken, encryptedRefreshToken, tokenExpiresAt, new Date().toISOString(), accountId)
      .run();
  }

  async updateAccountSync(accountId: string, lastSyncAt: string, googleCustomerId: string | null): Promise<void> {
    await this.db
      .prepare(
        `UPDATE integration_accounts
         SET status = ?, last_sync_at = ?, google_customer_id = COALESCE(?, google_customer_id), error_message = NULL, updated_at = ?
         WHERE id = ?`,
      )
      .bind("connected", lastSyncAt, googleCustomerId, new Date().toISOString(), accountId)
      .run();
  }

  async markAccountError(accountId: string, message: string): Promise<void> {
    await this.db
      .prepare("UPDATE integration_accounts SET status = ?, error_message = ?, updated_at = ? WHERE id = ?")
      .bind("error", message, new Date().toISOString(), accountId)
      .run();
  }

  async disconnectAccount(workspaceId: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE integration_accounts
         SET status = ?, encrypted_access_token = NULL, encrypted_refresh_token = NULL, token_expires_at = NULL,
             error_message = NULL, updated_at = ?
         WHERE workspace_id = ? AND provider = ?`,
      )
      .bind("not_connected", new Date().toISOString(), workspaceId, GOOGLE_WORKSPACE_PROVIDER)
      .run();
  }

  async createOAuthState(state: OAuthStateRecord): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO integration_oauth_states (
          state, workspace_id, provider, connected_by_user_id, redirect_after, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        state.state,
        state.workspace_id,
        state.provider,
        state.connected_by_user_id,
        state.redirect_after,
        state.expires_at,
        state.created_at,
      )
      .run();
  }

  async consumeOAuthState(state: string): Promise<OAuthStateRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM integration_oauth_states WHERE state = ? LIMIT 1")
      .bind(state)
      .first<OAuthStateRecord>();
    await this.db.prepare("DELETE FROM integration_oauth_states WHERE state = ?").bind(state).run();
    if (!row || new Date(row.expires_at).getTime() < Date.now()) return null;
    return row;
  }

  async replaceUsers(account: IntegrationAccountRecord, users: GoogleWorkspaceUser[]): Promise<void> {
    await this.db.prepare("DELETE FROM google_workspace_users WHERE integration_account_id = ?").bind(account.id).run();
    if (users.length === 0) return;
    await this.db.batch(
      users.map((user) =>
        this.db
          .prepare(
            `INSERT INTO google_workspace_users (
              id, workspace_id, integration_account_id, google_user_id, primary_email, full_name,
              is_admin, is_delegated_admin, is_suspended, org_unit_path, last_login_time, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            user.id,
            account.workspace_id,
            account.id,
            user.google_user_id,
            user.primary_email,
            user.full_name,
            boolToInt(user.is_admin),
            boolToInt(user.is_delegated_admin),
            boolToInt(user.is_suspended),
            user.org_unit_path,
            user.last_login_time,
            user.created_at,
            user.updated_at,
          ),
      ),
    );
  }

  async replaceGroups(account: IntegrationAccountRecord, groups: GoogleWorkspaceGroup[]): Promise<void> {
    await this.db.prepare("DELETE FROM google_workspace_groups WHERE integration_account_id = ?").bind(account.id).run();
    if (groups.length === 0) return;
    await this.db.batch(
      groups.map((group) =>
        this.db
          .prepare(
            `INSERT INTO google_workspace_groups (
              id, workspace_id, integration_account_id, google_group_id, email, name, description,
              direct_members_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            group.id,
            account.workspace_id,
            account.id,
            group.google_group_id,
            group.email,
            group.name,
            group.description,
            group.direct_members_count,
            group.created_at,
            group.updated_at,
          ),
      ),
    );
  }

  async replaceFindings(account: IntegrationAccountRecord, findings: GoogleWorkspaceFinding[]): Promise<void> {
    await this.db.prepare("DELETE FROM integration_findings WHERE integration_account_id = ?").bind(account.id).run();
    if (findings.length === 0) return;
    await this.db.batch(
      findings.map((finding) =>
        this.db
          .prepare(
            `INSERT INTO integration_findings (
              id, workspace_id, integration_account_id, provider, finding_type, severity, title,
              description, linked_control_id, source_object_id, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            finding.id,
            account.workspace_id,
            account.id,
            finding.provider,
            finding.finding_type,
            finding.severity,
            finding.title,
            finding.description,
            finding.linked_control_id,
            finding.source_object_id,
            finding.status,
            finding.created_at,
            finding.updated_at,
          ),
      ),
    );
  }

  async listUsers(account: IntegrationAccountRecord): Promise<GoogleWorkspaceUser[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM google_workspace_users WHERE integration_account_id = ? ORDER BY primary_email")
      .bind(account.id)
      .all<StoredGoogleWorkspaceUser>();
    return results.map(normalizeUser);
  }

  async listGroups(account: IntegrationAccountRecord): Promise<GoogleWorkspaceGroup[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM google_workspace_groups WHERE integration_account_id = ? ORDER BY email")
      .bind(account.id)
      .all<StoredGoogleWorkspaceGroup>();
    return results.map(normalizeGroup);
  }

  async listFindings(account: IntegrationAccountRecord): Promise<GoogleWorkspaceFinding[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM integration_findings WHERE integration_account_id = ? ORDER BY severity DESC, created_at DESC")
      .bind(account.id)
      .all<StoredGoogleWorkspaceFinding>();
    return results.map(normalizeFinding);
  }
}

class LocalFileGoogleWorkspaceDatabase implements GoogleWorkspaceDatabase {
  constructor(private readonly path: string) {}

  async getAccount(workspaceId: string): Promise<IntegrationAccountRecord | null> {
    const data = await this.read();
    const account = data.integration_accounts.find(
      (item) => item.workspace_id === workspaceId && item.provider === GOOGLE_WORKSPACE_PROVIDER,
    );
    return account ? normalizeAccount(account) : null;
  }

  async upsertConnectedAccount(input: UpsertConnectedAccountInput): Promise<IntegrationAccountRecord> {
    const data = await this.read();
    const now = new Date().toISOString();
    const existingIndex = data.integration_accounts.findIndex(
      (item) => item.workspace_id === input.workspaceId && item.provider === GOOGLE_WORKSPACE_PROVIDER,
    );
    const existing = existingIndex >= 0 ? data.integration_accounts[existingIndex] : null;
    const stored: StoredIntegrationAccount = {
      id: existing?.id ?? `int_gw_${crypto.randomUUID()}`,
      workspace_id: input.workspaceId,
      provider: GOOGLE_WORKSPACE_PROVIDER,
      status: "connected",
      google_customer_id: input.googleCustomerId,
      connected_by_user_id: input.connectedByUserId,
      scopes: JSON.stringify(input.scopes),
      encrypted_access_token: input.encryptedAccessToken,
      encrypted_refresh_token: input.encryptedRefreshToken ?? existing?.encrypted_refresh_token ?? null,
      token_expires_at: input.tokenExpiresAt,
      last_sync_at: existing?.last_sync_at ?? null,
      error_message: null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    if (existingIndex >= 0) data.integration_accounts[existingIndex] = stored;
    else data.integration_accounts.push(stored);
    await this.write(data);
    return normalizeAccount(stored);
  }

  async updateAccountTokens(
    accountId: string,
    encryptedAccessToken: string,
    encryptedRefreshToken: string | null,
    tokenExpiresAt: string | null,
  ): Promise<void> {
    await this.mutate((data) => {
      const account = data.integration_accounts.find((item) => item.id === accountId);
      if (!account) return;
      account.encrypted_access_token = encryptedAccessToken;
      if (encryptedRefreshToken) account.encrypted_refresh_token = encryptedRefreshToken;
      account.token_expires_at = tokenExpiresAt;
      account.updated_at = new Date().toISOString();
    });
  }

  async updateAccountSync(accountId: string, lastSyncAt: string, googleCustomerId: string | null): Promise<void> {
    await this.mutate((data) => {
      const account = data.integration_accounts.find((item) => item.id === accountId);
      if (!account) return;
      account.status = "connected";
      account.last_sync_at = lastSyncAt;
      account.google_customer_id = googleCustomerId ?? account.google_customer_id;
      account.error_message = null;
      account.updated_at = new Date().toISOString();
    });
  }

  async markAccountError(accountId: string, message: string): Promise<void> {
    await this.mutate((data) => {
      const account = data.integration_accounts.find((item) => item.id === accountId);
      if (!account) return;
      account.status = "error";
      account.error_message = message;
      account.updated_at = new Date().toISOString();
    });
  }

  async disconnectAccount(workspaceId: string): Promise<void> {
    await this.mutate((data) => {
      const account = data.integration_accounts.find(
        (item) => item.workspace_id === workspaceId && item.provider === GOOGLE_WORKSPACE_PROVIDER,
      );
      if (!account) return;
      account.status = "not_connected";
      account.encrypted_access_token = null;
      account.encrypted_refresh_token = null;
      account.token_expires_at = null;
      account.error_message = null;
      account.updated_at = new Date().toISOString();
    });
  }

  async createOAuthState(state: OAuthStateRecord): Promise<void> {
    await this.mutate((data) => {
      data.integration_oauth_states.push(state);
    });
  }

  async consumeOAuthState(state: string): Promise<OAuthStateRecord | null> {
    const data = await this.read();
    const existing = data.integration_oauth_states.find((item) => item.state === state) ?? null;
    data.integration_oauth_states = data.integration_oauth_states.filter((item) => item.state !== state);
    await this.write(data);
    if (!existing || new Date(existing.expires_at).getTime() < Date.now()) return null;
    return existing;
  }

  async replaceUsers(account: IntegrationAccountRecord, users: GoogleWorkspaceUser[]): Promise<void> {
    await this.mutate((data) => {
      data.google_workspace_users = data.google_workspace_users.filter(
        (item) => item.integration_account_id !== account.id,
      );
      data.google_workspace_users.push(
        ...users.map((user) => ({ ...user, workspace_id: account.workspace_id, integration_account_id: account.id })),
      );
    });
  }

  async replaceGroups(account: IntegrationAccountRecord, groups: GoogleWorkspaceGroup[]): Promise<void> {
    await this.mutate((data) => {
      data.google_workspace_groups = data.google_workspace_groups.filter(
        (item) => item.integration_account_id !== account.id,
      );
      data.google_workspace_groups.push(
        ...groups.map((group) => ({ ...group, workspace_id: account.workspace_id, integration_account_id: account.id })),
      );
    });
  }

  async replaceFindings(account: IntegrationAccountRecord, findings: GoogleWorkspaceFinding[]): Promise<void> {
    await this.mutate((data) => {
      data.integration_findings = data.integration_findings.filter(
        (item) => item.integration_account_id !== account.id,
      );
      data.integration_findings.push(...findings.map((finding) => ({ ...finding, workspace_id: account.workspace_id })));
    });
  }

  async listUsers(account: IntegrationAccountRecord): Promise<GoogleWorkspaceUser[]> {
    const data = await this.read();
    return data.google_workspace_users
      .filter((item) => item.integration_account_id === account.id)
      .sort((a, b) => a.primary_email.localeCompare(b.primary_email))
      .map(normalizeUser);
  }

  async listGroups(account: IntegrationAccountRecord): Promise<GoogleWorkspaceGroup[]> {
    const data = await this.read();
    return data.google_workspace_groups
      .filter((item) => item.integration_account_id === account.id)
      .sort((a, b) => a.email.localeCompare(b.email))
      .map(normalizeGroup);
  }

  async listFindings(account: IntegrationAccountRecord): Promise<GoogleWorkspaceFinding[]> {
    const data = await this.read();
    return data.integration_findings
      .filter((item) => item.integration_account_id === account.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(normalizeFinding);
  }

  private async mutate(fn: (data: LocalDbShape) => void): Promise<void> {
    const data = await this.read();
    fn(data);
    await this.write(data);
  }

  private async read(): Promise<LocalDbShape> {
    const fs = await import("node:fs/promises");
    try {
      const raw = await fs.readFile(this.path, "utf-8");
      return JSON.parse(raw) as LocalDbShape;
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return emptyDb();
      }
      throw error;
    }
  }

  private async write(data: LocalDbShape): Promise<void> {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }
}

function normalizeAccount(row: StoredIntegrationAccount): IntegrationAccountRecord {
  return {
    ...row,
    provider: GOOGLE_WORKSPACE_PROVIDER,
    status: normalizeStatus(row.status),
    scopes: parseScopes(row.scopes),
  };
}

function normalizeUser(row: StoredGoogleWorkspaceUser): GoogleWorkspaceUser {
  return {
    id: row.id,
    google_user_id: row.google_user_id,
    primary_email: row.primary_email,
    full_name: row.full_name,
    is_admin: Boolean(row.is_admin),
    is_delegated_admin: Boolean(row.is_delegated_admin),
    is_suspended: Boolean(row.is_suspended),
    org_unit_path: row.org_unit_path,
    last_login_time: row.last_login_time,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeGroup(row: StoredGoogleWorkspaceGroup): GoogleWorkspaceGroup {
  return {
    id: row.id,
    google_group_id: row.google_group_id,
    email: row.email,
    name: row.name,
    description: row.description,
    direct_members_count: Number(row.direct_members_count ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeFinding(row: StoredGoogleWorkspaceFinding): GoogleWorkspaceFinding {
  return {
    id: row.id,
    provider: GOOGLE_WORKSPACE_PROVIDER,
    integration_account_id: row.integration_account_id,
    finding_type: row.finding_type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    linked_control_id: row.linked_control_id,
    source_object_id: row.source_object_id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeStatus(value: string): IntegrationAccountRecord["status"] {
  if (value === "connected" || value === "error" || value === "not_connected") return value;
  return "not_connected";
}

function parseScopes(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value.split(/\s+/).filter(Boolean);
  }
}

function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

function emptyDb(): LocalDbShape {
  return {
    integration_accounts: [],
    google_workspace_users: [],
    google_workspace_groups: [],
    integration_findings: [],
    integration_oauth_states: [],
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return !!error && typeof error === "object" && "code" in error;
}
