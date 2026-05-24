import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/averonix/StatusBadge";
import { isAssessmentMode } from "@/config/dataSource";
import { useState } from "react";
import { Plus, Building2, Users, Calculator, Shield, Bell, Palette, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Averonix" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [implWeight, setImplWeight] = useState(70);
  const [density, setDensity] = useState("comfortable");
  const [sidebarMode, setSidebarMode] = useState("expanded");
  const [memberDialog, setMemberDialog] = useState(false);

  const assessment = isAssessmentMode();

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure workspace, scoring, users, vendor rules, notifications and appearance." />
      <div className="p-8 space-y-5 max-w-5xl">
        {/* Workspace */}
        <Section icon={Building2} title="Workspace profile" description="Identity and locale for this Averonix workspace.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Workspace name" defaultValue={assessment ? "Your Workspace" : "Averonix Corp."} />
            <Field label="Region" defaultValue="EU-West" />
            <Field label="Time zone" defaultValue="UTC+01:00 Casablanca" />
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <div className="text-sm font-medium">Demo mode</div>
                <div className="text-xs text-muted-foreground">Use sample data and disable external syncs.</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => toast.success("Saved locally")} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"><Save className="h-4 w-4" />Save changes</Button>
          </div>
        </Section>

        {/* Users */}
        <Section icon={Users} title="Users and roles" description="Manage who can access this workspace."
          action={<Button variant="outline" size="sm" onClick={() => setMemberDialog(true)}><Plus className="h-3.5 w-3.5" />Add member</Button>}>
          {assessment ? (
            <div className="rounded-md border border-border p-4 text-sm text-muted-foreground text-center">
              No workspace users configured yet. Add members to collaborate.
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { id: "1", name: "Sarah Chen", initials: "SC", role: "Admin" },
                { id: "2", name: "Michael Lee", initials: "ML", role: "Security reviewer" },
                { id: "3", name: "Priya Nair", initials: "PN", role: "Auditor" },
                { id: "4", name: "David Kim", initials: "DK", role: "Security reviewer" },
                { id: "5", name: "Laura Patel", initials: "LP", role: "Viewer" },
                { id: "6", name: "James Wilson", initials: "JW", role: "Auditor" },
              ].map((u) => {
                const rc: Record<string, "primary" | "info" | "warning" | "muted"> = {
                  Admin: "primary", "Security reviewer": "info", Auditor: "warning", Viewer: "muted",
                };
                return (
                  <div key={u.id} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-semibold">{u.initials}</div>
                    <div className="flex-1 text-sm font-medium">{u.name}</div>
                    <StatusBadge variant={rc[u.role] ?? "muted"}>{u.role}</StatusBadge>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Scoring */}
        <Section icon={Calculator} title="Scoring engine" description="How readiness, risk, and vendor scores are calculated.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2"><Label>Control implementation weight</Label><span className="font-semibold tabular-nums">{implWeight}%</span></div>
              <Slider value={[implWeight]} onValueChange={(v) => setImplWeight(v[0])} max={100} step={5} />
              <div className="text-xs text-muted-foreground mt-1">Evidence confidence weight: {100 - implWeight}%</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm">Critical failure override</span><Switch defaultChecked />
              </div>
              <RowLabeled label="Risk scoring model" value="Impact × Likelihood" />
              <RowLabeled label="Vendor scoring model" value="Sensitivity + Access + Criticality + Maturity" />
            </div>
          </div>
        </Section>

        {/* Vendor rules */}
        <Section icon={Shield} title="Vendor risk rules" description="Defaults applied when onboarding a new vendor.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Data sensitivity default" defaultValue="High" options={["Low", "Medium", "High", "Critical"]} />
            <SelectField label="Access level default" defaultValue="Production" options={["None", "Read-only", "Production", "Privileged"]} />
            <SelectField label="Review frequency" defaultValue="Annual" options={["Quarterly", "Bi-annual", "Annual"]} />
            <Field label="High-risk vendor threshold (score)" defaultValue="70" />
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 md:col-span-2">
              <div>
                <div className="text-sm font-medium">Data Processing Agreement required</div>
                <div className="text-xs text-muted-foreground">Block vendor activation until DPA is signed.</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notification preferences" description="When and how Averonix sends alerts.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ToggleRow label="Email weekly digest" defaultChecked />
            <ToggleRow label="Critical alert push" defaultChecked />
            <ToggleRow label="Vendor review reminders" defaultChecked />
            <ToggleRow label="Gap due-date reminders" defaultChecked />
            <ToggleRow label="Slack notifications" />
            <ToggleRow label="In-app banners" defaultChecked />
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" description="Brand theme and layout density.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground uppercase">Theme</div>
              <div className="mt-2 text-sm font-medium">Averonix Purple</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border border-border" style={{ backgroundColor: "#C560CC" }} />
                <code className="text-xs font-mono">#C560CC</code>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2">Density</div>
              <Select value={density} onValueChange={setDensity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2">Sidebar mode</div>
              <Select value={sidebarMode} onValueChange={setSidebarMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>
      </div>
      <Dialog open={memberDialog} onOpenChange={setMemberDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Email address</Label><Input placeholder="colleague@company.com" /></div>
            <div><Label className="text-xs">Role</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="security">Security reviewer</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialog(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setMemberDialog(false); toast.success("Member invited locally"); }}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ icon: Icon, title, description, children, action }: { icon: any; title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]"><Icon className="h-4 w-4" /></div>
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return <div><Label className="text-xs text-muted-foreground">{label}</Label><Input defaultValue={defaultValue} className="mt-1" /></div>;
}
function SelectField({ label, defaultValue, options }: { label: string; defaultValue: string; options: string[] }) {
  return <div><Label className="text-xs text-muted-foreground">{label}</Label>
    <Select defaultValue={defaultValue}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select></div>;
}
function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"><span className="text-sm">{label}</span><Switch defaultChecked={defaultChecked} /></div>;
}
function RowLabeled({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border px-3 py-2">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-medium mt-0.5">{value}</div>
  </div>;
}
