import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { StatCard } from "@/components/averonix/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { gaps } from "@/data/active/gaps";
import { frameworks } from "@/data/active/frameworks";
import { Plus, Download, Filter, AlertOctagon, FileX, Ban, CheckCircle2, FileText, FileCheck2, FileSearch, FileWarning, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gaps/")({
  head: () => ({ meta: [{ title: "Gaps · Averonix" }] }),
  component: GapsPage,
});

interface EvidenceItem { id: string; label: string; framework: string; gapId: string; lane: "Missing" | "Requested" | "Collected" | "Verified"; }
const lanes: { key: EvidenceItem["lane"]; icon: any; tint: string }[] = [
  { key: "Missing", icon: FileX, tint: "text-[#B91C1C] bg-[#FEE2E2]" },
  { key: "Requested", icon: FileSearch, tint: "text-[#B45309] bg-[#FEF3C7]" },
  { key: "Collected", icon: FileText, tint: "text-[#1D4ED8] bg-[#DBEAFE]" },
  { key: "Verified", icon: FileCheck2, tint: "text-[#15803D] bg-[#DCFCE7]" },
];

function GapsPage() {
  const [selectedId, setSelectedId] = useState("G-001");
  const selected = gaps.find((g) => g.id === selectedId) ?? gaps[0];
  const dynamicEvidenceBoard: EvidenceItem[] = gaps.flatMap((gap) => {
    const lane: EvidenceItem["lane"] =
      gap.status === "Closed"
        ? "Verified"
        : gap.status === "In remediation"
          ? "Collected"
          : gap.status === "Awaiting evidence"
            ? "Requested"
            : "Missing";

    return gap.requiredEvidence.slice(0, 4).map((label, index) => ({
      id: `${gap.id}-e${index + 1}`,
      label,
      framework: gap.framework,
      gapId: gap.id,
      lane,
    }));
  });

  // remediation by framework: avg progress
  const byFramework = frameworks.map((f) => {
    const list = gaps.filter((g) => g.framework.toLowerCase().includes(f.shortName.toLowerCase().split(" ")[0]));
    const avg = list.length ? Math.round(list.reduce((s, g) => s + g.progress, 0) / list.length) : 0;
    return { name: f.shortName, count: list.length, progress: avg };
  }).filter((f) => f.count > 0).slice(0, 6);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Gaps" subtitle="Track missing evidence, incomplete requirements, and remediation progress."
        actions={<>
          <Button variant="outline" onClick={() => setFiltersVisible(!filtersVisible)} className={filtersVisible ? "bg-[var(--primary-soft)]" : ""}>
            <Filter className="h-4 w-4" />Filters
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setExportVisible(!exportVisible)}><Download className="h-4 w-4" />Export</Button>
            {exportVisible && <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border bg-card shadow-lg z-50">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setExportVisible(false); toast.success("Exporting as CSV"); }}>Export as CSV</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setExportVisible(false); toast.success("Exporting as PDF"); }}>Export as PDF</button>
            </div>}
          </div>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Create gap</Button>
        </>}
      />
      {filtersVisible && <div className="px-8"><div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
        {["Severity", "Status", "Framework", "Owner"].map((f) => (
          <button key={f} className="text-xs rounded-full border border-border px-3 py-1 hover:bg-[var(--primary-ultra-soft)]">{f}</button>
        ))}
        <button className="text-xs text-muted-foreground ml-auto flex items-center gap-1" onClick={() => setFiltersVisible(false)}><X className="h-3 w-3" />Close</button>
      </div></div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create gap</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Gap title</label><Input placeholder="e.g. Missing evidence for access control" /></div>
            <div><label className="text-xs font-medium">Framework</label><Input placeholder="e.g. ISO 27001" /></div>
            <div><label className="text-xs font-medium">Owner</label><Input placeholder="e.g. jane@example.com" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setDialogOpen(false); toast.success("Gap created"); }}>Create gap</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open gaps" value={gaps.filter((g) => g.status !== "Closed").length.toString()} icon={AlertOctagon} />
          <StatCard label="Missing evidence" value={dynamicEvidenceBoard.filter((e) => e.lane === "Missing").length.toString()} icon={FileWarning} />
          <StatCard label="Blocked gaps" value={gaps.filter((g) => g.status === "Blocked").length.toString()} icon={Ban} />
          <StatCard label="Closed this quarter" value={gaps.filter((g) => g.status === "Closed").length.toString()} icon={CheckCircle2} accent />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-5">
          {/* Left: gap inbox */}
          <Card className="border-border h-fit flex flex-col min-h-0">
            <CardHeader className="pb-3 shrink-0"><CardTitle className="text-sm">Gap inbox</CardTitle></CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {gaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-3">
                    <AlertOctagon className="h-6 w-6 text-[var(--primary-dark)]" />
                  </div>
                  <p className="text-sm font-medium">No gaps identified yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Gaps will appear when controls are incomplete or evidence is missing.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/controls">View controls</Link>
                  </Button>
                </div>
              ) : (
              <ul>
                {gaps.map((g) => (
                  <li key={g.id}>
                    <button onClick={() => setSelectedId(g.id)}
                      className={cn("w-full text-left px-4 py-3 border-t border-border first:border-0 hover:bg-[var(--primary-ultra-soft)] block",
                        selectedId === g.id && "bg-[var(--primary-ultra-soft)] border-l-2 border-l-[var(--primary)]")}>
                      <div className="flex items-start gap-2">
                        <StatusBadge variant={severityVariant(g.severity)}>{g.severity}</StatusBadge>
                        <span className="text-sm font-medium leading-snug flex-1 truncate">{g.title}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{g.framework}</span>·<span>{g.owner}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={g.progress} className="h-1.5" />
                        <span className="text-[10px] tabular-nums w-7 text-right text-muted-foreground">{g.progress}%</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              )}
            </CardContent>
          </Card>

          {/* Center: evidence board */}
          <Card className="border-border flex flex-col min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-sm">Evidence requirements board</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Track evidence from missing to verified across all active gaps.</p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 h-full">
                {lanes.map((lane) => {
                  const items = dynamicEvidenceBoard.filter((e) => e.lane === lane.key);
                  const Icon = lane.icon;
                  return (
                    <div key={lane.key} className="rounded-lg bg-[var(--primary-ultra-soft)]/50 border border-border p-3 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                          <span className={cn("h-6 w-6 rounded-md flex items-center justify-center", lane.tint)}><Icon className="h-3.5 w-3.5" /></span>
                          {lane.key}
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                      </div>
                      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-0.5" style={{ maxHeight: "55vh" }}>
                        {items.map((e) => (
                          <Link key={e.id} to="/gaps/$id" params={{ id: e.gapId }}
                            className="block rounded-md bg-card border border-border p-2.5 hover:border-[var(--primary)] transition">
                            <div className="text-xs font-medium leading-snug">{e.label}</div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{e.framework}</span><span className="font-mono">{e.gapId}</span>
                            </div>
                          </Link>
                        ))}
                        {items.length === 0 && (
                          <div className="text-[11px] text-muted-foreground text-center py-6">
                            <span className="block font-medium text-foreground/70">No {lane.key.toLowerCase()} evidence</span>
                            <span className="mt-1 block">Evidence items will appear here as gaps progress.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right: selected gap card */}
          <Card className="border-border h-fit sticky top-4">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Selected gap</CardTitle></CardHeader>
            <CardContent>
              <h3 className="font-semibold leading-snug truncate">{selected.title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge variant={severityVariant(selected.severity)}>{selected.severity}</StatusBadge>
                <StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Linked control</span>
                  <Link to="/controls/$id" params={{ id: selected.linkedControl.replace("CTL-", "") }} className="text-right text-sm hover:text-[var(--primary)] hover:underline">{selected.linkedControl}</Link>
                </div>
                <Field label="Framework" value={selected.framework} />
                <Field label="Owner" value={selected.owner} />
                <Field label="Due" value={selected.dueDate} />
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Gap reason</div>
                <p className="text-sm mt-1 line-clamp-3">{selected.reason}</p>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Required evidence</div>
                <ul className="mt-1 space-y-1">
                  {selected.requiredEvidence.slice(0, 4).map((e) => (
                    <li key={e} className="text-xs flex items-center gap-2 truncate"><span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />{e}</li>
                  ))}
                  {selected.requiredEvidence.length > 4 && <li className="text-xs text-muted-foreground">+{selected.requiredEvidence.length - 4} more</li>}
                </ul>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Next action</div>
                <p className="text-sm mt-1 truncate">{selected.remediationSteps[0]}</p>
              </div>
              <Button asChild className="w-full mt-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                <Link to="/gaps/$id" params={{ id: selected.id }}>View gap details</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Remediation by framework */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm">Remediation progress by framework</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {byFramework.map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between text-xs mb-1.5"><span className="font-medium">{f.name}</span><span className="text-muted-foreground tabular-nums">{f.progress}% · {f.count} gaps</span></div>
                  <ProgressBar value={f.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><span className="text-xs text-muted-foreground">{label}</span><span className="text-right text-sm">{value}</span></div>;
}
