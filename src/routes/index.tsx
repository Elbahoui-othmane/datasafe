import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { StatCard } from "@/components/averonix/StatCard";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { Sparkline } from "@/components/averonix/Charts";
import { StatusBadge } from "@/components/averonix/StatusBadge";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { frameworks } from "@/data/active/frameworks";
import { evidenceGaps, gaps } from "@/data/active/gaps";
import { controls } from "@/data/active/controls";
import { isAssessmentMode } from "@/config/dataSource";
import { ChevronRight, Play, FileDown, Plus, Shield, AlertTriangle, FileCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview · Averonix" }, { name: "description", content: "Your compliance command center." }] }),
  component: Overview,
});

function Overview() {
  const overallReadiness = frameworks.length > 0
    ? Math.round(frameworks.reduce((sum, f) => sum + f.readiness, 0) / frameworks.length)
    : 0;
  const evidenceReady = controls.filter((control) => ["Verified", "Uploaded", "Ready"].includes(control.evidence)).length;
  const evidenceCoverage = controls.length > 0 ? Math.round((evidenceReady / controls.length) * 100) : 0;
  const nav = useNavigate();
  const [frameworkDialog, setFrameworkDialog] = useState(false);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Your compliance command center"
        actions={
          <>
            <Button variant="outline" onClick={() => nav({ to: "/assessments/iso-27001" })}><Play className="h-4 w-4" />Run assessment</Button>
            <Button variant="outline" onClick={() => nav({ to: "/reports" })}><FileDown className="h-4 w-4" />Generate report</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setFrameworkDialog(true)}><Plus className="h-4 w-4" />Add framework</Button>
          </>
        }
      />
      <Dialog open={frameworkDialog} onOpenChange={setFrameworkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add framework</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {["NIST CSF", "GDPR", "Law 09-08", "SOC 2", "ISO 27701"].map((name) => (
              <label key={name} className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-[var(--primary-ultra-soft)] cursor-pointer">
                <input type="radio" name="framework" className="h-4 w-4 accent-[var(--primary)]" />
                <span className="text-sm font-medium">{name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFrameworkDialog(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setFrameworkDialog(false); toast.success("Framework added"); }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Overall readiness" value={`${overallReadiness}%`} hint="computed from frameworks" accent icon={Shield} />
          <StatCard label="Open gaps" value={gaps.filter((gap) => gap.status !== "Closed").length.toString()} hint={`${evidenceGaps.critical} critical`} icon={AlertTriangle} />
          <StatCard label="Evidence coverage" value={`${evidenceCoverage}%`} hint="of mapped controls" icon={FileCheck} />
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Readiness trend</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--primary)]">{overallReadiness}%</div>
              <Sparkline data={[42, 45, 48, 50, 52, 55, overallReadiness]} />
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Framework readiness</h2>
            <Link to="/frameworks" className="text-sm text-[var(--primary)] hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {frameworks.map((f) => (
              <Link key={f.id} to="/frameworks/$id" params={{ id: f.id }}>
                <Card className="border-border transition hover:border-[var(--primary)] hover:shadow-md group cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] text-xs font-semibold">{f.shortName.slice(0, 3).toUpperCase()}</div>
                        <div>
                          <div className="font-medium text-sm">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.completed} / {f.total} controls</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="font-semibold tabular-nums">{f.readiness}%</span>
                    </div>
                    <ProgressBar value={f.readiness} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Evidence Gaps</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <GapTile label="Critical" value={evidenceGaps.critical} variant="danger" />
              <GapTile label="High" value={evidenceGaps.high} variant="warning" />
              <GapTile label="Medium" value={evidenceGaps.medium} variant="info" />
              <GapTile label="Low" value={evidenceGaps.low} variant="success" />
            </CardContent>
          </Card>
          {!isAssessmentMode() && (
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent><ActivityTimeline items={[]} /></CardContent>
          </Card>
          )}
        </div>
      </div>
    </>
  );
}

function GapTile({ label, value, variant }: { label: string; value: number; variant: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <StatusBadge variant={variant}>{label}</StatusBadge>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
