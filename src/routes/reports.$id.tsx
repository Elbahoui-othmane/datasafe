import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusVariant } from "@/components/averonix/StatusBadge";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { reports, isoReadinessReport } from "@/data/active/reports";
import { FileDown, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Report · Averonix` }] }),
  component: () => {
    const { id } = Route.useParams();
    const r = reports.find((x) => x.id === id);
    const isIsoReport = id === "rep-iso";
    const [busy, setBusy] = useState<"export" | "regenerate" | "download" | null>(null);
    if (!r) return <NotFoundState label="Report not found" backTo="/reports" backLabel="Back to reports" />;
    return (
      <>
        <PageHeader breadcrumbs={[{ label: "Reports", to: "/reports" }, { label: r.name }]} title={r.name}
          subtitle={`${r.type} report · generated ${r.generated} · owner ${r.owner}`}
          badge={<StatusBadge variant={statusVariant(r.status)}>{r.status}</StatusBadge>}
          actions={<>
            <Button variant="outline" onClick={() => { setBusy("export"); setTimeout(() => { setBusy(null); toast.success("Export prepared"); }, 800); }} disabled={busy !== null}>
              <Share2 className={`h-4 w-4 ${busy === "export" ? "animate-spin" : ""}`} />Export
            </Button>
            <Button variant="outline" onClick={() => { setBusy("regenerate"); setTimeout(() => { setBusy(null); toast.success("Report regenerated"); }, 1000); }} disabled={busy !== null}>
              <RefreshCw className={`h-4 w-4 ${busy === "regenerate" ? "animate-spin" : ""}`} />Regenerate
            </Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setBusy("download"); setTimeout(() => { setBusy(null); toast.success("PDF ready for download"); }, 1200); }} disabled={busy !== null}>
              <FileDown className={`h-4 w-4 ${busy === "download" ? "animate-bounce" : ""}`} />{busy === "download" ? "Preparing…" : "Download PDF"}
            </Button>
          </>}
        />
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="border-border lg:col-span-2"><CardContent className="p-6"><h3 className="font-semibold mb-3">Preview summary</h3>{isIsoReport ? (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="Readiness" value={`${isoReadinessReport.readiness}%`} />
                <Metric label="Controls" value={`${isoReadinessReport.controlsCompleted}/${isoReadinessReport.controlsTotal}`} />
                <Metric label="Open gaps" value={isoReadinessReport.openGaps.toString()} />
                <Metric label="Critical risks" value={isoReadinessReport.criticalRisks.toString()} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Domain scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {isoReadinessReport.domainScores.map((domain) => (
                    <div key={domain.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{domain.shortName}</span>
                        <span className="text-[var(--primary)] font-semibold">{domain.score}%</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{domain.controls} controls · {domain.openGaps} open gaps · {domain.risks} risks</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended tasks</h4>
                <ul className="space-y-2">
                  {isoReadinessReport.recommendedTasks.map((task) => (
                    <li key={task.id} className="rounded-md border border-border p-3">
                      <div className="font-medium">{task.title}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{task.owner} · due {task.dueDate}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : <div className="space-y-3 text-sm">{r.sections.map((s) => (
            <div key={s} className="rounded-md border border-border p-4"><div className="font-medium">{s}</div><p className="mt-1 text-muted-foreground text-xs">Auto-generated summary for {s.toLowerCase()} based on current workspace data.</p></div>
          ))}</div>}</CardContent></Card>
          <Card className="border-border h-fit"><CardContent className="p-5"><h4 className="text-sm font-semibold mb-3">Recent export activity</h4><ActivityTimeline items={[
            { id: "1", text: "Exported to PDF", time: "2h ago" },
            { id: "2", text: "Shared with executives", time: "Yesterday" },
            { id: "3", text: "Generated", time: r.generated },
          ]} /></CardContent></Card>
        </div>
      </>
    );
  },
});

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--primary-ultra-soft)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
