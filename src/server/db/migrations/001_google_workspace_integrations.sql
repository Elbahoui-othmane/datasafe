CREATE TABLE IF NOT EXISTS integration_accounts (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_accounts_workspace_provider
  ON integration_accounts (workspace_id, provider);

CREATE TABLE IF NOT EXISTS google_workspace_users (
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
);

CREATE INDEX IF NOT EXISTS idx_google_workspace_users_account
  ON google_workspace_users (integration_account_id);

CREATE TABLE IF NOT EXISTS google_workspace_groups (
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
);

CREATE INDEX IF NOT EXISTS idx_google_workspace_groups_account
  ON google_workspace_groups (integration_account_id);

CREATE TABLE IF NOT EXISTS integration_findings (
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
);

CREATE INDEX IF NOT EXISTS idx_integration_findings_account
  ON integration_findings (integration_account_id);

CREATE TABLE IF NOT EXISTS integration_oauth_states (
  state TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  connected_by_user_id TEXT,
  redirect_after TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
