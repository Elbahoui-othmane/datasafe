import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, FileSearch, AlertTriangle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Averonix" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@averonix.com");
  const [password, setPassword] = useState("••••••••");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FCFAFF]">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "radial-gradient(120% 80% at 20% 0%, #2A0F3E 0%, #160B22 45%, #0D0614 100%)" }}>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#C560CC]/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#9B35A3]/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#C560CC] to-[#9B35A3] flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Averonix</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight leading-tight">
              Compliance readiness,<br />simplified.
            </h1>
            <p className="mt-4 text-sm text-white/70 max-w-md leading-relaxed">
              Track frameworks, controls, vendors, risks, gaps and remediation work from one clean workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg">
            {[
              { icon: ShieldCheck, label: "Framework readiness" },
              { icon: AlertTriangle, label: "Vendor risk visibility" },
              { icon: FileSearch, label: "Evidence gap tracking" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                <c.icon className="h-4 w-4 text-[#E8AEEF] mb-3" />
                <div className="text-xs font-medium leading-snug">{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-white/40">© Averonix</div>
      </div>

      {/* Right login */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your Averonix workspace.</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/" }); }}
            className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="space-y-1.5">
              <Label className="text-xs">Work email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Password</Label>
                <span className="text-[11px] text-muted-foreground cursor-default">Forgot?</span>
              </div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
            <Button type="submit" className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="relative my-1 text-center">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <span className="relative bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate({ to: "/onboarding" })}>
              Explore workspace
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              No account?{" "}
              <Link to="/request-demo" className="font-medium text-[var(--primary)] hover:underline">Request a demo</Link>
            </div>
          </form>

          {/* Mini preview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Workspace preview</div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Readiness" value="58%" />
              <Stat label="Open gaps" value="42" />
              <Stat label="Evidence" value="63%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-[var(--primary)] tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
