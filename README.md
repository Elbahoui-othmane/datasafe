# Averonix — Google Workspace IdP Integration

## Prerequisites

- A **Google Workspace** account with **Admin SDK** access
- A **Google Cloud Console** project with the Admin SDK API enabled
- Permission to create **OAuth 2.0 credentials** in the Google Cloud Console

## Google Cloud Console Setup

### 1. Create or select a project

Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project or select an existing one.

### 2. Enable the required APIs

Navigate to **APIs & Services > Library** and enable:

| API | Purpose |
|-----|---------|
| Admin SDK API | Read users, groups, and organization units |
| Google Reports API | Read login activity for evidence |

### 3. Configure the OAuth consent screen

Go to **APIs & Services > OAuth consent screen**, select **External** user type, and fill in:

- **App name**: `Averonix`
- **User support email**: your email
- **Developer contact info**: your email

Under **Scopes**, add these three:

```
https://www.googleapis.com/auth/admin.directory.user.readonly
https://www.googleapis.com/auth/admin.directory.group.readonly
https://www.googleapis.com/auth/admin.reports.audit.readonly
```

Under **Test users**, add the Google Workspace admin email you will use to connect.

### 4. Create OAuth 2.0 credentials

Go to **APIs & Services > Credentials**, click **Create Credentials > OAuth client ID**, choose **Web application**, and set:

- **Authorized JavaScript origins**: `http://localhost:3000` (dev) + your production URL
- **Authorized redirect URIs**: `http://localhost:3000/api/integrations/google-workspace/oauth/callback` (dev) + your production callback URL

Save and note the **Client ID** and **Client Secret**.

### 5. Generate an encryption key

Run this command to generate a 32-byte hex key:

```bash
openssl rand -hex 32
```

Save this value as `INTEGRATION_TOKEN_ENCRYPTION_KEY`.

## Local Environment Setup

### 1. Create `.env`

```bash
cp .env.example .env
```

### 2. Fill in the values

```ini
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
INTEGRATION_TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
AVERONIX_LOCAL_DB_PATH=.averonix/google-workspace-db.json
```

### 3. Verify the configuration

```bash
npx tsc --noEmit
```

No type errors should appear.

### 4. Start the dev server

```bash
npm run dev
```

Navigate to **Integrations > Google Workspace** in the sidebar (or `/integrations/google-workspace`) to use the connect UI.

## Env Validation Checklist

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `GOOGLE_CLIENT_ID` | Yes | — | From OAuth 2.0 credentials |
| `GOOGLE_CLIENT_SECRET` | Yes | — | From OAuth 2.0 credentials |
| `INTEGRATION_TOKEN_ENCRYPTION_KEY` | Yes | — | 32-byte hex key |
| `GOOGLE_REDIRECT_URI` | No | Auto-derived | Must match Cloud Console |
| `AVERONIX_FRONTEND_BASE_URL` | No | Request origin | Post-OAuth redirect |
| `AVERONIX_WORKSPACE_ID` | No | `default-workspace` | Multi-tenant support |
| `AVERONIX_CONNECTED_BY_USER_ID` | No | `null` | Audit trail |
| `GOOGLE_WORKSPACE_SCOPES` | No | (3 default scopes) | Custom scopes override |
| `AVERONIX_DB` | No (pick one) | — | D1 binding name |
| `AVERONIX_LOCAL_DB_PATH` | No (pick one) | `.averonix/google-workspace-db.json` | File-based storage |

> **Note**: Either `AVERONIX_DB` (Cloudflare D1) or `AVERONIX_LOCAL_DB_PATH` (local JSON file) must be usable. For local dev, the file-based option is sufficient.

## Common OAuth Errors

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `redirect_uri_mismatch` | Redirect URI in Cloud Console does not match `GOOGLE_REDIRECT_URI` | Update the Authorized Redirect URIs in your OAuth client |
| `invalid_client` | Client ID or secret is wrong | Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| `access_denied` | User is not a test user or consent screen not published | Add the email to Test users or publish the app |
| `403 — not authorized` | Google Workspace admin account not used | Use a super admin account |
| `invalid_grant` | Refresh token expired or revoked | Reconnect the integration |
| Token decryption fails | `INTEGRATION_TOKEN_ENCRYPTION_KEY` changed after tokens were stored | Use the original key or disconnect and reconnect |

## Architecture

```
┌─────────────────────┐       ┌──────────────────────────────┐
│   Frontend Route     │──────▶│   /integrations/google-      │
│   (integrations.     │       │   workspace                  │
│    google-workspace) │       └──────────────────────────────┘
└─────────────────────┘                      │
                                             ▼
┌─────────────────────┐       ┌──────────────────────────────┐
│   Server API Routes  │◀──────│   OAuth Callback + Sync      │
│   (not yet built)    │       └──────────────────────────────┘
└─────────────────────┘                      │
                                             ▼
┌─────────────────────┐       ┌──────────────────────────────┐
│   Google APIs        │◀──────│   Admin SDK / Reports API    │
│   (external)         │       └──────────────────────────────┘
└─────────────────────┘
```

## Missing Backend API Routes

The following server-side API routes need to be implemented for the full OAuth flow to work:

- `POST /api/integrations/google-workspace/oauth/authorize` — Generate OAuth URL
- `GET /api/integrations/google-workspace/oauth/callback` — Handle OAuth callback, exchange code for tokens
- `GET /api/integrations/google-workspace/status` — Return connection status
- `POST /api/integrations/google-workspace/sync` — Trigger a full sync
- `POST /api/integrations/google-workspace/disconnect` — Disconnect and clear tokens
- `GET /api/integrations/google-workspace/users` — List synced users
- `GET /api/integrations/google-workspace/groups` — List synced groups
- `GET /api/integrations/google-workspace/findings` — List derived findings
"# datasafe" 
"# datasafe" 
