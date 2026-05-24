import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ShieldCheck, BarChart3, Server, AlertTriangle, FileText, Sparkles, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/request-demo")({
  head: () => ({ meta: [{ title: "Request demo · Averonix" }] }),
  component: RequestDemo,
});

const FRAMEWORKS = ["ISO 27001:2022", "NIST CSF", "GDPR", "Moroccan Law 09-08", "SOC 2", "ISO 27701", "PCI-DSS 4.0", "AI Act"];

function RequestDemo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", company: "", size: "", role: "", goal: "" });
  const [picked, setPicked] = useState<string[]>(["ISO 27001:2022", "GDPR"]);
  const [touched, setTouched] = useState(false);

  const required: (keyof typeof form)[] = ["name", "email", "company", "size", "role", "goal"];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (required.every((k) => form[k])) navigate({ to: "/demo-ready" });
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#C560CC] to-[#9B35A3] flex items-center justify-center"><Shield className="h-4 w-4 text-white" /></div>
            <span className="font-semibold tracking-tight">Averonix</span>
          </Link>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">Back to sign in</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-3 rounded-xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Request your Averonix demo</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">See how Averonix helps your team assess compliance readiness, vendor risk, evidence gaps, and remediation work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name" v={form.name} on={(v) => set("name", v)} err={touched && !form.name} placeholder="Yassine El Amrani" />
            <Field label="Work email" v={form.email} on={(v) => set("email", v)} err={touched && !form.email} placeholder="you@company.com" type="email" />
            <Field label="Company name" v={form.company} on={(v) => set("company", v)} err={touched && !form.company} placeholder="Acme Inc." />
            <SelField label="Company size" v={form.size} on={(v) => set("size", v)} err={touched && !form.size} options={["1–10", "11–50", "51–200", "201–500", "500+"]} />
            <SelField label="Role" v={form.role} on={(v) => set("role", v)} err={touched && !form.role} options={["Founder / CEO", "IT Manager", "Security Manager", "Compliance Officer", "Student / Demo evaluator", "Other"]} />
            <SelField label="Primary goal" v={form.goal} on={(v) => set("goal", v)} err={touched && !form.goal} options={["Prepare for ISO 27001", "Improve cybersecurity posture", "Manage vendor risk", "Track privacy compliance", "Generate compliance reports", "Explore the product demo"]} />
          </div>

          <div>
            <Label className="text-xs">Frameworks interested in</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FRAMEWORKS.map((f) => {
                const on = picked.includes(f);
                return (
                  <button type="button" key={f}
                    onClick={() => setPicked((p) => on ? p.filter((x) => x !== f) : [...p, f])}
                    className={cn("rounded-full border px-3 py-1 text-xs transition", on ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)] font-medium" : "border-border hover:border-[var(--primary)]/40")}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
            Request demo <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Preview */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--primary-dark)]">
              <Sparkles className="h-3.5 w-3.5" />WHAT YOUR DEMO INCLUDES
            </div>
            <ul className="mt-4 space-y-2.5">
              {[
                { icon: BarChart3, t: "Compliance dashboard preview" },
                { icon: ShieldCheck, t: "ISO 27001 readiness workspace" },
                { icon: Server, t: "Vendor risk overview" },
                { icon: AlertTriangle, t: "Gaps and remediation workflow" },
                { icon: FileText, t: "Risk register sample" },
                { icon: FileText, t: "Executive report preview" },
              ].map((c) => (
                <li key={c.t} className="flex items-center gap-3 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--primary-dark)]"><c.icon className="h-3.5 w-3.5" /></div>
                  <span>{c.t}</span>
                  <Check className="ml-auto h-3.5 w-3.5 text-[var(--success)]" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-gradient-to-br from-[#160B22] to-[#0D0614] text-white p-6">
            <div className="text-[10px] uppercase tracking-wider text-white/50">Sample workspace</div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Mini label="Readiness" value="58%" />
              <Mini label="Vendors" value="42" />
              <Mini label="Open gaps" value="96" />
              <Mini label="Tasks" value="84" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xl font-semibold text-[#E8AEEF] tabular-nums">{value}</div><div className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">{label}</div></div>;
}
function Field({ label, v, on, err, placeholder, type }: { label: string; v: string; on: (s: string) => void; err?: boolean; placeholder?: string; type?: string }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>
    <Input type={type} value={v} placeholder={placeholder} onChange={(e) => on(e.target.value)} className={cn(err && "border-[var(--danger)]")} /></div>;
}
function SelField({ label, v, on, err, options }: { label: string; v: string; on: (s: string) => void; err?: boolean; options: string[] }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>
    <Select value={v} onValueChange={on}><SelectTrigger className={cn(err && "border-[var(--danger)]")}><SelectValue placeholder="Select…" /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>;
}
