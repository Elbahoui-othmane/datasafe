import { StatCard } from "@/components/averonix/StatCard";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { Sparkline } from "@/components/averonix/Charts";
import { StatusBadge } from "@/components/averonix/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { frameworks } from "@/data/active/frameworks";
import { evidenceGaps, gaps } from "@/data/active/gaps";
import { controls } from "@/data/active/controls";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, FileCheck, ChevronRight } from "lucide-react";

interface PreviewOverviewContentProps {
  highlightIso?: boolean;
  pressIso?: boolean;
  highlightSummary?: boolean;
}

export function PreviewOverviewContent({
  highlightIso,
  pressIso,
  highlightSummary,
}: PreviewOverviewContentProps) {
  const overallReadiness = frameworks.length > 0
    ? Math.round(frameworks.reduce((sum, f) => sum + f.readiness, 0) / frameworks.length)
    : 0;
  const evidenceReady = controls.filter((c) => ["Verified", "Uploaded", "Ready"].includes(c.evidence)).length;
  const evidenceCoverage = controls.length > 0 ? Math.round((evidenceReady / controls.length) * 100) : 0;
  const isoFramework = frameworks.find((f) => f.id === "iso-27001" || f.name.toLowerCase().includes("iso 27001"));
  const shownFrameworks = [
    ...(isoFramework ? [isoFramework] : []),
    ...frameworks.filter((f) => f.id !== isoFramework?.id),
  ].slice(0, 2);

  return (
    <div className="space-y-3 p-3" data-preview="overview">
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Overall readiness"
          value={`${overallReadiness}%`}
          hint="computed from frameworks"
          accent
          icon={Shield}
          className={cn(
            "transition-all duration-300",
            highlightSummary && "ring-2 ring-[var(--primary)]/45 bg-[var(--primary-ultra-soft)]/35 shadow-md",
          )}
        />
        <StatCard label="Open gaps" value={gaps.filter((g) => g.status !== "Closed").length.toString()} hint={`${evidenceGaps.critical} critical`} icon={AlertTriangle} />
        <StatCard label="Evidence coverage" value={`${evidenceCoverage}%`} hint="of mapped controls" icon={FileCheck} />
        <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
          <CardContent className="p-3">
            <div className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Readiness trend</div>
            <div className="mt-1 text-lg font-semibold text-[var(--primary)]">{overallReadiness}%</div>
            <Sparkline data={[42, 45, 48, 50, 52, 55, overallReadiness]} height={32} />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Framework readiness</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shownFrameworks.map((f) => {
            const isIso = f.id === isoFramework?.id;
            return (
            <Card
              key={f.id}
              className={cn(
                "border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)] transition-all duration-300",
                isIso && highlightIso && "ring-2 ring-[var(--primary)]/55 bg-[var(--primary-ultra-soft)]/40 shadow-md",
                isIso && pressIso && "scale-[0.985] border-[var(--primary)]",
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] text-[10px] font-semibold">{f.shortName.slice(0, 3).toUpperCase()}</div>
                    <div>
                      <div className="text-xs font-medium leading-tight">{f.name}</div>
                      <div className="text-[10px] text-muted-foreground">{f.completed} / {f.total} controls</div>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Readiness</span>
                  <span className="font-semibold tabular-nums">{f.readiness}%</span>
                </div>
                <ProgressBar value={f.readiness} className="h-1.5" />
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
        <CardContent className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Evidence Gaps</div>
          <div className="grid grid-cols-4 gap-2">
            <GapTile label="Critical" value={evidenceGaps.critical} variant="danger" />
            <GapTile label="High" value={evidenceGaps.high} variant="warning" />
            <GapTile label="Medium" value={evidenceGaps.medium} variant="info" />
            <GapTile label="Low" value={evidenceGaps.low} variant="success" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GapTile({ label, value, variant }: { label: string; value: number; variant: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-center">
      <StatusBadge variant={variant} className="text-[9px] px-1.5 py-0">{label}</StatusBadge>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}
