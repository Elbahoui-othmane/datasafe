import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusVariant } from "@/components/averonix/StatusBadge";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { reports } from "@/data/active/reports";
import { scheduledReports } from "@/mocks/extras";
import { isAssessmentMode } from "@/config/dataSource";
import { FileDown, RefreshCw, FileText, ChevronRight, Plus, CalendarClock, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/")({
  head: () => ({ meta: [{ title: "Reports · Averonix" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [selectedId, setSelectedId] = useState("rep-iso");
  const [exportOpen, setExportOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];
  const nav = useNavigate();

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export compliance-ready summaries."
        actions={<>
          <div className="relative">
            <Button variant="outline" onClick={() => setExportOpen(!exportOpen)}><FileDown className="h-4 w-4" />Export</Button>
            {exportOpen && <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border bg-card shadow-lg z-50">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setExportOpen(false); toast.success("Exporting as PDF"); }}>Export as PDF</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setExportOpen(false); toast.success("Exporting as CSV"); }}>Export as CSV</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setExportOpen(false); toast.success("Schedule export"); }}>Schedule…</button>
            </div>}
          </div>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setGenerating(true); setTimeout(() => { setGenerating(false); nav({ to: "/reports" }); }, 800); }}>
            <Plus className="h-4 w-4" />{generating ? "Generating…" : "Generate report"}
          </Button>
        </>}
      />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="border-border lg:col-span-2 h-fit flex flex-col min-h-0">
          <CardHeader className="shrink-0"><CardTitle className="text-sm">Report library</CardTitle></CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "55vh" }}>
            <ul>
              {reports.map((r) => (
                <li key={r.id}>
                  <button onClick={() => setSelectedId(r.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-t border-border first:border-0 hover:bg-[var(--primary-ultra-soft)] ${selectedId === r.id ? "bg-[var(--primary-ultra-soft)]" : ""}`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.type} · {r.generated}</div>
                    </div>
                    <StatusBadge variant={statusVariant(r.status)}>{r.status}</StatusBadge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>
                    <span>Generated {selected.generated}</span>
                    <span>·</span>
                    <span>Owner: {selected.owner}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setGenerating(true); setTimeout(() => { setGenerating(false); }, 1000); }} className={generating ? "opacity-60 pointer-events-none" : ""}>
                    <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />{generating ? "Regenerating…" : "Regenerate"}
                  </Button>
                  <Button asChild className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"><Link to="/reports/$id" params={{ id: selected.id }}>Open report</Link></Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Included sections</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selected.sections.map((s) => (
                    <li key={s} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm bg-[var(--primary-ultra-soft)]/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />{s}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setGenerating(true); setTimeout(() => { setGenerating(false); toast.success("PDF ready for download"); }, 1200); }}>
                <FileDown className={`h-4 w-4 ${generating ? "animate-bounce" : ""}`} />{generating ? "Preparing…" : "Download PDF"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-border">
              <CardHeader className="shrink-0"><CardTitle className="text-sm">Recent exports</CardTitle></CardHeader>
              <CardContent className="overflow-y-auto" style={{ maxHeight: "260px" }}><ActivityTimeline items={[
                { id: "1", text: "Executive Summary exported", time: "1h ago" },
                { id: "2", text: "Vendor Risk Summary generated", time: "Yesterday" },
                { id: "3", text: "Gap Report downloaded", time: "3d ago" },
              ]} /></CardContent>
            </Card>
            {!isAssessmentMode() ? (
              <Card className="border-border">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[var(--primary)]" />Scheduled reports</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {scheduledReports.map((s) => (
                    <div key={s.id} className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">{s.name}</div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{s.recipients}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.cadence}</div>
                      <div className="mt-1 text-[11px] text-[var(--primary-dark)]">Next: {s.next}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader><CardTitle className="text-sm">Scheduled reports</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">No scheduled reports configured yet.</CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
