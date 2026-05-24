import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ArrowRight, ArrowLeft, Shield, Sparkles, Building2, Target, Layers, Database, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · Averonix" }] }),
  component: Onboarding,
});

const STEP_META = [
  { n: 1, t: "Welcome", icon: Sparkles },
  { n: 2, t: "Workspace", icon: Building2 },
  { n: 3, t: "Goals", icon: Target },
  { n: 4, t: "Frameworks", icon: Layers },
  { n: 5, t: "Sample data", icon: Database },
  { n: 6, t: "Launch", icon: Rocket },
];

const GOALS = [
  "Prepare for ISO 27001",
  "Reduce evidence gaps",
  "Manage vendor risk",
  "Track security controls",
  "Generate executive reports",
  "Improve audit readiness",
];
const FRAMEWORKS = [
  "ISO 27001:2022", "NIST Cybersecurity Framework", "GDPR", "Moroccan Law 09-08",
  "SOC 2", "ISO 27701", "PCI-DSS 4.0", "AI Act",
];
const DATA_OPTIONS = [
  { id: "sample", t: "Use sample data", d: "Recommended. Populate the dashboard with realistic frameworks, controls, vendors, risks, gaps, and tasks." },
  { id: "empty", t: "Start with empty workspace", d: "Build manually." },
  { id: "assess", t: "Begin with assessment", d: "Answer control questions first." },
  { id: "later", t: "Connect integrations later", d: "Add Google Workspace, GitHub, AWS, and other tools later." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState({ name: "Averonix Corp.", industry: "Technology", size: "11–50 employees", region: "Morocco", tz: "UTC+01:00 Casablanca" });
  const [goals, setGoals] = useState<string[]>(["Prepare for ISO 27001", "Reduce evidence gaps", "Manage vendor risk"]);
  const [frameworks, setFrameworks] = useState<string[]>(["ISO 27001:2022", "NIST Cybersecurity Framework", "GDPR", "Moroccan Law 09-08"]);
  const [dataOpt, setDataOpt] = useState("sample");

  const next = () => step < 6 ? setStep(step + 1) : navigate({ to: "/" });
  const back = () => setStep(Math.max(1, step - 1));

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[360px_1fr] bg-[#FCFAFF]">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-8 text-white relative overflow-hidden"
        style={{ background: "radial-gradient(120% 80% at 20% 0%, #2A0F3E 0%, #160B22 45%, #0D0614 100%)" }}>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#C560CC]/25 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#C560CC] to-[#9B35A3] flex items-center justify-center"><Shield className="h-4 w-4" /></div>
          <span className="font-semibold tracking-tight">Averonix</span>
        </div>
        <div className="relative space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Setup · Step {step} of 6</div>
          <ol className="space-y-1.5">
            {STEP_META.map((s) => {
              const done = s.n < step, active = s.n === step;
              return (
                <li key={s.n} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition", active && "bg-white/10", !active && "opacity-60")}>
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", done ? "bg-[var(--success)]" : active ? "bg-[var(--primary)]" : "bg-white/10")}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-sm">{s.t}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="relative text-[10px] text-white/30">© Averonix</div>
      </aside>

      {/* Right content */}
      <main className="flex flex-col">
        <div className="border-b border-border bg-card px-8 py-3">
          <div className="h-1 rounded-full bg-[var(--primary-soft)] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] transition-all" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-3xl mx-auto">
            {step === 1 && (
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Welcome to Averonix</h1>
                <p className="mt-2 text-muted-foreground">Let's configure your compliance command center.</p>
                <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Dashboard preview</div>
                  <div className="grid grid-cols-3 gap-4">
                    <Stat label="Overall readiness" value="58%" />
                    <Stat label="Open gaps" value="42" />
                    <Stat label="Evidence coverage" value="63%" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Workspace profile</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Identity and locale for this workspace.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Fld label="Workspace name" v={workspace.name} on={(v) => setWorkspace({ ...workspace, name: v })} />
                  <Fld label="Industry" v={workspace.industry} on={(v) => setWorkspace({ ...workspace, industry: v })} />
                  <Sel label="Company size" v={workspace.size} on={(v) => setWorkspace({ ...workspace, size: v })} opts={["1–10 employees", "11–50 employees", "51–200 employees", "201–500 employees", "500+ employees"]} />
                  <Fld label="Region" v={workspace.region} on={(v) => setWorkspace({ ...workspace, region: v })} />
                  <Fld label="Time zone" v={workspace.tz} on={(v) => setWorkspace({ ...workspace, tz: v })} />
                </div>
                <div className="mt-6 rounded-xl border border-border bg-[var(--primary-ultra-soft)] p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Preview</div>
                  <div className="mt-2 font-semibold">{workspace.name}</div>
                  <div className="text-sm text-muted-foreground">{workspace.region} · {workspace.industry}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] text-[var(--primary-dark)]"><Sparkles className="h-3 w-3" />Sample workspace</div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Compliance goals</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Choose what you want Averonix to help with.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOALS.map((g) => {
                    const on = goals.includes(g);
                    return (
                      <button key={g} onClick={() => setGoals((p) => on ? p.filter((x) => x !== g) : [...p, g])}
                        className={cn("flex items-center justify-between rounded-xl border p-4 text-left transition", on ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-border bg-card hover:border-[var(--primary)]/40")}>
                        <span className="text-sm font-medium">{g}</span>
                        {on && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white"><Check className="h-3 w-3" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Frameworks</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Select the frameworks you want to track.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FRAMEWORKS.map((f) => {
                    const on = frameworks.includes(f);
                    return (
                      <button key={f} onClick={() => setFrameworks((p) => on ? p.filter((x) => x !== f) : [...p, f])}
                        className={cn("flex items-center gap-3 rounded-xl border p-4 text-left transition", on ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-border bg-card hover:border-[var(--primary)]/40")}>
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold", on ? "bg-[var(--primary)] text-white" : "bg-muted text-muted-foreground")}>
                          {f.split(/[ -]/)[0].slice(0, 3).toUpperCase()}
                        </div>
                        <div className="flex-1"><div className="text-sm font-medium">{f}</div></div>
                        {on && <Check className="h-4 w-4 text-[var(--primary)]" />}
                      </button>
                    );
                  })}
                </div>
                {frameworks.length > 0 && (
                  <div className="mt-6 rounded-xl border border-border bg-[var(--primary-ultra-soft)] p-4 text-sm">
                    Your readiness program is ready. <span className="font-medium">{frameworks.length} frameworks selected.</span>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Data setup</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">How do you want to start?</p>
                <div className="mt-6 space-y-2">
                  {DATA_OPTIONS.map((o) => {
                    const on = dataOpt === o.id;
                    return (
                      <button key={o.id} onClick={() => setDataOpt(o.id)}
                        className={cn("w-full flex items-start gap-3 rounded-xl border p-4 text-left transition", on ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-border bg-card hover:border-[var(--primary)]/40")}>
                        <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", on ? "border-[var(--primary)] bg-[var(--primary)]" : "border-border")}>
                          {on && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div><div className="text-sm font-medium">{o.t}</div><div className="text-xs text-muted-foreground mt-0.5">{o.d}</div></div>
                      </button>
                    );
                  })}
                </div>
                {dataOpt === "sample" && (
                  <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[["Frameworks", "8"], ["Controls", "125"], ["Vendors", "42"], ["Gaps", "96"], ["Tasks", "84"], ["Reports", "5"]].map(([l, v]) => (
                      <div key={l} className="rounded-lg border border-border bg-card p-3 text-center">
                        <div className="text-lg font-semibold text-[var(--primary)]">{v}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Your Averonix workspace is ready</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Review your setup and enter the dashboard.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ["Workspace", workspace.name],
                    ["Region", workspace.region],
                    ["Frameworks selected", String(frameworks.length)],
                    ["Data", dataOpt === "sample" ? "Sample" : "Custom"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl border border-border bg-card p-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                      <div className="mt-0.5 text-sm font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-border bg-[var(--primary-ultra-soft)] p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Checklist</div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["Workspace configured", "Frameworks selected", "Controls prepared", "Vendor risk workspace ready", "Gaps and tasks created", "Reports available"].map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--success)] text-white"><Check className="h-2.5 w-2.5" /></div>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-card px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 1}><ArrowLeft className="h-4 w-4" />Back</Button>
          <div className="text-xs text-muted-foreground">Step {step} of 6</div>
          <Button onClick={next} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
            {step === 6 ? "Enter dashboard" : step === 1 ? "Start setup" : "Continue"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border p-4"><div className="text-2xl font-semibold text-[var(--primary)] tabular-nums">{value}</div><div className="text-xs text-muted-foreground mt-1">{label}</div></div>;
}
function Fld({ label, v, on }: { label: string; v: string; on: (s: string) => void }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label><Input value={v} onChange={(e) => on(e.target.value)} /></div>;
}
function Sel({ label, v, on, opts }: { label: string; v: string; on: (s: string) => void; opts: string[] }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>
    <Select value={v} onValueChange={on}><SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>;
}
