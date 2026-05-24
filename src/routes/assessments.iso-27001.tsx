import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assessmentDomainSummaries } from "@/data/generated/generatedDomainSummaries";
import { isoReadinessReport } from "@/data/active/reports";
import { Layers, AlertTriangle, Target, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/assessments/iso-27001")({
  head: () => ({ meta: [{ title: "ISO 27001 Assessment - Averonix" }] }),
  component: IsoAssessmentPage,
});

function IsoAssessmentPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname !== "/assessments/iso-27001") return <Outlet />;

  return (
    <>
      <PageHeader
        title="ISO 27001 Assessment"
        subtitle="Convert assessment responses into controls, evidence gaps, risks, and remediation tasks."
        badge={<StatusBadge variant={statusVariant("Ready")}>{isoReadinessReport.readiness}% ready</StatusBadge>}
      />
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Metric icon={Layers} label="Assessment controls" value={isoReadinessReport.controlsTotal.toString()} />
          <Metric icon={CheckCircle2} label="Controls OK" value={isoReadinessReport.controlsCompleted.toString()} />
          <Metric icon={Target} label="Open gaps" value={isoReadinessReport.openGaps.toString()} />
          <Metric icon={AlertTriangle} label="Critical risks" value={isoReadinessReport.criticalRisks.toString()} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assessmentDomainSummaries.map((summary) => (
            <Card key={summary.domain.id} className="border-border hover:border-[var(--primary)] hover:shadow-md transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">{summary.domain.id}</div>
                    <h3 className="mt-1 font-semibold">{summary.domain.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{summary.domain.description}</p>
                  </div>
                  <div className="rounded-md bg-[var(--primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--primary-dark)] whitespace-nowrap">
                    {summary.domain.shortName}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Readiness score</span>
                    <span className="font-semibold tabular-nums">{summary.readiness}%</span>
                  </div>
                  <ProgressBar value={summary.readiness} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Controls" value={summary.totalControls} />
                  <MiniStat label="Open gaps" value={summary.openGaps} />
                  <MiniStat label="Risks" value={summary.linkedRisks} />
                </div>

                <Button asChild className="w-full mt-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                  <Link to="/assessments/iso-27001/$domainId" params={{ domainId: summary.domain.id }}>
                    Start / Continue <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-[var(--primary-ultra-soft)] p-2">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
