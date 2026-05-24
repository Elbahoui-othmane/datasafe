import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getGoogleWorkspaceRelatedControls,
} from "@/lib/integrations/google-workspace/mapping";
import {
  GOOGLE_WORKSPACE_REQUIRED_SCOPES,
  type GoogleWorkspaceDerivedDashboardData,
  type GoogleWorkspaceFinding,
  type GoogleWorkspaceFindingsResponse,
  type GoogleWorkspaceGroup,
  type GoogleWorkspaceGroupsResponse,
  type GoogleWorkspaceStatusResponse,
  type GoogleWorkspaceSyncResponse,
  type GoogleWorkspaceUser,
  type GoogleWorkspaceUsersResponse,
} from "@/lib/integrations/google-workspace/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  FileCheck2,
  KeyRound,
  Loader2,
  Plug,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Unplug,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const emptyDerived: GoogleWorkspaceDerivedDashboardData = {
  evidence: [],
  tests: [],
  gaps: [],
  risks: [],
  tasks: [],
};

export function GoogleWorkspaceIntegrationPage() {
  const [status, setStatus] = useState<GoogleWorkspaceStatusResponse | null>(null);
  const [users, setUsers] = useState<GoogleWorkspaceUser[]>([]);
  const [groups, setGroups] = useState<GoogleWorkspaceGroup[]>([]);
  const [findings, setFindings] = useState<GoogleWorkspaceFinding[]>([]);
  const [derived, setDerived] = useState<GoogleWorkspaceDerivedDashboardData>(emptyDerived);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"connect" | "sync" | "disconnect" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextStatus = await fetchJson<GoogleWorkspaceStatusResponse>("/api/integrations/google-workspace/status");
      setStatus(nextStatus);

      if (nextStatus.status !== "not_connected") {
        const [usersResponse, groupsResponse, findingsResponse] = await Promise.all([
          fetchJson<GoogleWorkspaceUsersResponse>("/api/integrations/google-workspace/users"),
          fetchJson<GoogleWorkspaceGroupsResponse>("/api/integrations/google-workspace/groups"),
          fetchJson<GoogleWorkspaceFindingsResponse>("/api/integrations/google-workspace/findings"),
        ]);
        setUsers(usersResponse.users);
        setGroups(groupsResponse.groups);
        setFindings(findingsResponse.findings);
        setDerived(findingsResponse.derived);
      } else {
        setUsers([]);
        setGroups([]);
        setFindings([]);
        setDerived(emptyDerived);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Google Workspace integration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    const googleWorkspace = params.get("googleWorkspace");
    if (!message || !googleWorkspace) return;
    if (googleWorkspace === "connected") toast.success(message);
    if (googleWorkspace === "error") toast.error(message);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const adminUsers = useMemo(
    () => users.filter((user) => user.is_admin || user.is_delegated_admin),
    [users],
  );
  const suspendedUsers = useMemo(() => users.filter((user) => user.is_suspended), [users]);
  function isItemConfigured(name: string): boolean {
    return !status?.missing?.includes(name);
  }
  const connected = status?.connected === true;
  const configured = status?.configured !== false;

  async function connect() {
    setAction("connect");
    setError(null);
    try {
      const response = await fetchJson<{ url: string }>("/api/integrations/google-workspace/connect-url");
      window.location.assign(response.url);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Unable to start Google OAuth.");
    } finally {
      setAction(null);
    }
  }

  async function sync() {
    setAction("sync");
    setError(null);
    try {
      const response = await fetchJson<GoogleWorkspaceSyncResponse>("/api/integrations/google-workspace/sync", {
        method: "POST",
      });
      toast.success(`Synced ${response.summary.total_users} users and ${response.summary.total_groups} groups.`);
      await load();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Google Workspace sync failed.");
    } finally {
      setAction(null);
    }
  }

  async function disconnect() {
    setAction("disconnect");
    setError(null);
    try {
      await fetchJson<{ status: string }>("/api/integrations/google-workspace/disconnect", { method: "POST" });
      toast.success("Google Workspace disconnected.");
      await load();
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Unable to disconnect Google Workspace.");
    } finally {
      setAction(null);
    }
  }

  const nav = useNavigate();
  const [scopeDialog, setScopeDialog] = useState(false);
  const [localScopes, setLocalScopes] = useState<string[]>([]);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Integrations", to: "/integrations" }, { label: "Google Workspace" }]}
        title="Google Workspace"
        subtitle="Sync identity data from Google Workspace to support access-control evidence, tests, findings, gaps, risks, and tasks."
        badge={
          <StatusBadge variant={statusVariant(status?.status ?? "Not connected")}>
            {status?.status === "connected" ? "Connected" : status?.status === "error" ? "Error" : "Not connected"}
          </StatusBadge>
        }
        actions={
          <>
            <Button
              className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
              onClick={connect}
              disabled={action !== null}
            >
              {action === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
              {connected ? "Reconnect" : "Connect Google Workspace"}
            </Button>
            <Button
              variant="outline"
              onClick={sync}
              disabled={!connected || action !== null}
              title={!connected ? "Connect Google Workspace first to sync users and groups." : ""}
            >
              {action === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync now
            </Button>
            <Button
              variant="outline"
              onClick={disconnect}
              disabled={!connected || action !== null}
              title={!connected ? "No active Google Workspace connection." : ""}
            >
              {action === "disconnect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
              Disconnect
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-8">
        {(error || status?.error) && (
          <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
            {error ?? status?.error}
          </div>
        )}

        {!configured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <span className="font-medium">OAuth configuration is incomplete.</span> Add the missing server-side credentials first.
            {status?.missing && status.missing.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs text-amber-800">
                {status.missing.map((name) => <li key={name}>{name}</li>)}
              </ul>
            )}
          </div>
        )}

        {!connected && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1"><Unplug className="h-3 w-3" />Sync now disabled — connect first.</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1"><Unplug className="h-3 w-3" />Disconnect disabled — no active connection.</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/api/integrations/google-workspace/oauth/callback`);
            toast.success("Redirect URI copied");
          }}>
            <Copy className="h-3.5 w-3.5" />Copy redirect URI
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
            setLocalScopes(status?.scopes ?? []);
            setScopeDialog(true);
          }}>
            <SlidersHorizontal className="h-3.5 w-3.5" />Configure scope
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => nav({ to: "/controls" })}>
            <ExternalLink className="h-3.5 w-3.5" />View related controls
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Platform configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {([
              ["GOOGLE_CLIENT_ID", "OAuth Client ID from Google Cloud Console"],
              ["GOOGLE_CLIENT_SECRET", "OAuth Client Secret"],
              ["GOOGLE_REDIRECT_URI", "Redirect URI for OAuth callback"],
              ["INTEGRATION_TOKEN_ENCRYPTION_KEY", "Token encryption key for stored credentials"],
              ["GOOGLE_WORKSPACE_SCOPES", "Read-only OAuth scopes (optional)"],
            ] as const).map(([name, desc]) => {
              const present = isItemConfigured(name);
              return (
                <div key={name} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{name}</code>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${present ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {present ? "configured" : "missing"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 text-xs" onClick={() => {
                    navigator.clipboard.writeText(name);
                    toast.success("Copied");
                  }}><Copy className="h-3 w-3" /></Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Redirect URI</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">
              Add this exact URI to your OAuth Web Client in Google Cloud Console:
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2.5 font-mono text-xs">
              <code className="flex-1 break-all">{window.location.origin}/api/integrations/google-workspace/oauth/callback</code>
              <Button variant="ghost" size="sm" className="shrink-0 h-8" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/api/integrations/google-workspace/oauth/callback`);
                toast.success("Redirect URI copied");
              }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Required Google Cloud steps</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Open <span className="font-medium text-foreground">Google Cloud Console</span> and create or select a project.</li>
              <li>Enable the <span className="font-medium text-foreground">Admin SDK API</span> for your project.</li>
              <li>Configure the <span className="font-medium text-foreground">OAuth consent screen</span> (External or Internal).</li>
              <li>Create an <span className="font-medium text-foreground">OAuth Web Client</span> and add the redirect URI:
                <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs font-mono">{window.location.origin}/api/integrations/google-workspace/oauth/callback</code>
              </li>
              <li>Add the following <span className="font-medium text-foreground">read-only scopes</span>:
                <ul className="mt-1 space-y-0.5">
                  {GOOGLE_WORKSPACE_REQUIRED_SCOPES.map((s) => (
                    <li key={s}><code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{s}</code></li>
                  ))}
                </ul>
              </li>
              <li>Set the environment variables listed above in your backend deployment.</li>
            </ol>
          </CardContent>
        </Card>

        <Collapsible className="rounded-lg border border-border">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 [&[data-state=open]>svg]:rotate-180">
            <span>Local testing checklist</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create a Google Cloud project and enable the <span className="font-medium text-foreground">Admin SDK API</span>.</li>
              <li>Configure the <span className="font-medium text-foreground">OAuth consent screen</span> and create an <span className="font-medium text-foreground">OAuth Web Client</span>.</li>
              <li>Add this redirect URI to the OAuth Web Client:
                <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs font-mono">{window.location.origin}/api/integrations/google-workspace/oauth/callback</code>
              </li>
              <li>Set the environment variables in your local <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env</code> file:
                <ul className="mt-1 space-y-0.5">
                  {["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GOOGLE_WORKSPACE_SCOPES", "INTEGRATION_TOKEN_ENCRYPTION_KEY"].map((v) => (
                    <li key={v}><code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{v}</code></li>
                  ))}
                </ul>
              </li>
              <li>Run <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">npm run dev</code> and open <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">/integrations/google-workspace</code>.</li>
              <li>Click <span className="font-medium text-foreground">Connect Google Workspace</span> and complete OAuth with a Google Workspace admin account.</li>
              <li>After the OAuth redirect returns, click <span className="font-medium text-foreground">Sync now</span>.</li>
            </ol>
          </CollapsibleContent>
        </Collapsible>

        <Dialog open={scopeDialog} onOpenChange={setScopeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Configure OAuth scopes</DialogTitle><DialogDescription>Preview only — scope changes require reconnecting via Google OAuth.</DialogDescription></DialogHeader>
            <div className="space-y-2">
              {(status?.scopes ?? GOOGLE_WORKSPACE_REQUIRED_SCOPES).map((scope) => (
                <label key={scope} className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-[var(--primary-ultra-soft)] cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    defaultChecked={localScopes.includes(scope)}
                    onChange={(e) => {
                      setLocalScopes((prev) =>
                        e.target.checked ? [...prev, scope] : prev.filter((s) => s !== scope),
                      );
                    }}
                  />
                  {scope}
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScopeDialog(false)}>Close</Button>
              <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setScopeDialog(false); toast.success("Scope preview updated locally"); }}>Apply preview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {loading ? (
          <Card className="border-border">
            <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Google Workspace integration
            </CardContent>
          </Card>
        ) : connected ? (
          <ConnectedState
            status={status}
            users={users}
            groups={groups}
            adminUsers={adminUsers}
            suspendedUsers={suspendedUsers}
            findings={findings}
            derived={derived}
          />
        ) : (
          <NotConnectedState status={status} onConnect={connect} connecting={action === "connect"} />
        )}
      </div>
    </>
  );
}

function NotConnectedState({
  status,
  onConnect,
  connecting,
}: {
  status: GoogleWorkspaceStatusResponse | null;
  onConnect: () => void;
  connecting: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connect with Google OAuth</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Connect a Google Workspace admin account to sync users, groups, and access evidence.
                </p>
              <Button
                className="mt-5 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                onClick={onConnect}
                disabled={connecting}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                Connect Google Workspace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Required read-only scopes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(status?.scopes ?? []).map((scope) => (
            <div key={scope} className="rounded-md bg-muted px-3 py-2 font-mono text-[11px] text-muted-foreground">
              {scope}
            </div>
          ))}
        </CardContent>
      </Card>

      <InfoSection
        title="What Averonix will check"
        items={[
          "User inventory synced",
          "Admin accounts reviewed",
          "Group membership inventory available",
          "Login activity available where Google permits it",
        ]}
      />
      <InfoSection
        title="Evidence that can be automated"
        items={[
          "User inventory evidence",
          "Admin account inventory",
          "Group inventory evidence",
          "Login activity availability",
        ]}
      />
      <RelatedControls />
    </div>
  );
}

function ConnectedState({
  status,
  users,
  groups,
  adminUsers,
  suspendedUsers,
  findings,
  derived,
}: {
  status: GoogleWorkspaceStatusResponse | null;
  users: GoogleWorkspaceUser[];
  groups: GoogleWorkspaceGroup[];
  adminUsers: GoogleWorkspaceUser[];
  suspendedUsers: GoogleWorkspaceUser[];
  findings: GoogleWorkspaceFinding[];
  derived: GoogleWorkspaceDerivedDashboardData;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Users} label="Users" value={users.length.toString()} hint={status?.google_customer_id ?? "Google customer"} />
        <SummaryCard icon={ShieldCheck} label="Admin users" value={adminUsers.length.toString()} hint={`${suspendedUsers.length} suspended`} />
        <SummaryCard icon={FileCheck2} label="Groups" value={groups.length.toString()} hint="inventory synced" />
        <SummaryCard icon={AlertTriangle} label="Findings" value={findings.length.toString()} hint={status?.last_sync_at ? `Last sync ${formatDate(status.last_sync_at)}` : "Not synced yet"} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No findings have been generated yet. Run Sync now to collect Google Workspace identity evidence.</p>
            ) : findings.map((finding) => (
              <div key={finding.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge variant={severityVariant(finding.severity)}>{finding.severity}</StatusBadge>
                  <StatusBadge variant={statusVariant(finding.status)}>{finding.status}</StatusBadge>
                  <span className="text-[11px] font-mono text-muted-foreground">{finding.finding_type}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">{finding.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Linked control: {finding.linked_control_id ?? "Access Control"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Connected scopes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(status?.scopes ?? []).map((scope) => (
              <div key={scope} className="rounded-md bg-muted px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {scope}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <DerivedPanel title="Evidence collected" items={derived.evidence} />
        <DerivedPanel title="Generated gaps and risks" items={[...derived.gaps, ...derived.risks]} />
        <DerivedPanel title="Recommended tasks" items={derived.tasks} />
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Recent synced users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <Th>User</Th><Th>Admin</Th><Th>Suspended</Th><Th>Org unit</Th><Th>Last login</Th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 8).map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{user.primary_email}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge variant={user.is_admin || user.is_delegated_admin ? "warning" : "muted"}>{user.is_admin || user.is_delegated_admin ? "Yes" : "No"}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge variant={user.is_suspended ? "danger" : "success"}>{user.is_suspended ? "Yes" : "No"}</StatusBadge></td>
                  <td className="px-4 py-3 text-muted-foreground">{user.org_unit_path ?? "/"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.last_login_time ? formatDate(user.last_login_time) : "Not available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          </div>
          <div className="rounded-lg bg-[var(--primary-ultra-soft)] p-2 text-[var(--primary)]">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RelatedControls() {
  return (
    <Card className="border-border xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">Related controls</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {getGoogleWorkspaceRelatedControls().map((control) => (
          <div key={control.id} className="rounded-lg border border-border p-3">
            <div className="text-sm font-semibold">{control.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{control.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DerivedPanel({ title, items }: { title: string; items: GoogleWorkspaceDerivedDashboardData["tasks"] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : items.slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm font-medium">{item.title}</div>
              {item.severity && <StatusBadge variant={severityVariant(item.severity)}>{item.severity}</StatusBadge>}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar value={item.status === "Collected" || item.status === "Passing" ? 100 : item.status === "To do" ? 0 : 35} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{item.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left font-medium">{children}</th>;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const base =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : `Request failed with status ${response.status}`;
    const missingList: string[] = payload?.missing ?? [];
    throw new Error(missingList.length > 0 ? `${base}: ${missingList.join(", ")}` : base);
  }
  return payload as T;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
