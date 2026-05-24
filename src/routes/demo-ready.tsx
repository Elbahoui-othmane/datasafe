import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield } from "lucide-react";

export const Route = createFileRoute("/demo-ready")({
  head: () => ({ meta: [{ title: "Demo ready · Averonix" }] }),
  component: DemoReady,
});

const STEPS = [
  "Workspace created",
  "Frameworks selected",
  "Controls prepared",
  "Vendor risk loaded",
  "Reports available",
];

function DemoReady() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF] p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C560CC] to-[#9B35A3] mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm p-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Your workspace is ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">We prepared a guided Averonix workspace for you.</p>

          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-2"><span className="text-muted-foreground">Provisioning</span><span className="font-semibold tabular-nums">100%</span></div>
            <div className="h-1.5 rounded-full bg-[var(--primary-soft)] overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)]" />
            </div>
          </div>

          <ul className="mt-8 space-y-2.5 max-w-md mx-auto text-left">
            {STEPS.map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-lg border border-border bg-[var(--primary-ultra-soft)] px-3 py-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success)] text-white"><Check className="h-3 w-3" /></div>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-4 gap-3 max-w-lg mx-auto">
            {[
              { l: "Frameworks", v: "4" },
              { l: "Controls", v: "125" },
              { l: "Vendors", v: "42" },
              { l: "Open gaps", v: "96" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border p-3">
                <div className="text-xl font-semibold text-[var(--primary)] tabular-nums">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <Link to="/login"><Button variant="outline">Back to login</Button></Link>
            <Link to="/onboarding"><Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">Start onboarding <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
