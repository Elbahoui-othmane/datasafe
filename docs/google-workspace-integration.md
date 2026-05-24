# Google Workspace Integration Setup

This integration is backend-backed. Averonix does not ship with Google credentials and does not pretend Google Workspace is connected. A workspace admin must complete OAuth before identity data can be synced.

## Google Cloud Setup

1. Create or select a Google Cloud project.
2. Enable the Admin SDK API.
3. Configure the OAuth consent screen for your organization.
4. Create an OAuth 2.0 Web Client.
5. Add this authorized redirect URI for local development:

```text
http://localhost:4000/api/integrations/google-workspace/oauth/callback
```

For deployed environments, add the deployed backend callback URL:

```text
https://YOUR_BACKEND_HOST/api/integrations/google-workspace/oauth/callback
```

## Environment Variables

Do not hardcode secrets in source code.

```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/integrations/google-workspace/oauth/callback
GOOGLE_WORKSPACE_SCOPES="https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/admin.directory.group.readonly https://www.googleapis.com/auth/admin.reports.audit.readonly"
INTEGRATION_TOKEN_ENCRYPTION_KEY=replace-with-a-long-random-secret
```

Optional:

```bash
AVERONIX_FRONTEND_BASE_URL=http://localhost:4000
AVERONIX_WORKSPACE_ID=default-workspace
AVERONIX_LOCAL_DB_PATH=.averonix/google-workspace-db.json
```

## Read-Only Scopes

Averonix starts with read-only Google Workspace scopes:

```text
https://www.googleapis.com/auth/admin.directory.user.readonly
https://www.googleapis.com/auth/admin.directory.group.readonly
https://www.googleapis.com/auth/admin.reports.audit.readonly
```

## Database

The SQL schema is in:

```text
src/server/db/migrations/001_google_workspace_integrations.sql
```

The backend repository supports a Cloudflare D1-style binding named `AVERONIX_DB`, `DB`, or `DATABASE`. In local development, when no D1 binding exists, it persists the same integration models to `.averonix/google-workspace-db.json`.

## OAuth Flow

Frontend:

```text
/integrations/google-workspace
```

Backend:

```text
GET  /api/integrations/google-workspace/connect-url
GET  /api/integrations/google-workspace/oauth/callback
GET  /api/integrations/google-workspace/status
POST /api/integrations/google-workspace/sync
POST /api/integrations/google-workspace/disconnect
GET  /api/integrations/google-workspace/users
GET  /api/integrations/google-workspace/groups
GET  /api/integrations/google-workspace/findings
```

Tokens are encrypted with AES-GCM before storage. API responses never return access tokens or refresh tokens.

## Permission Errors

If Google returns a 403 when reading directory data, Averonix shows:

```text
This account does not have permission to read Google Workspace directory data. Use a Google Workspace admin account or ask your administrator.
```

Use a Google Workspace admin account with permission to read Directory and Reports API data.
