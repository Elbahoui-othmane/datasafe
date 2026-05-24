import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, Fragment } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { StatCard } from "@/components/averonix/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { risks } from "@/data/active/risks";
import { ChevronLeft, ChevronRight, Plus, Download, Filter, AlertTriangle, Flame, Activity, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risks/")({
  head: () => ({ meta: [{ title: "Risks · Averonix" }] }),
  component: RisksPage,
});

const PAGE_SIZE = 10;
const impactLabels = ["Insignificant", "Minor", "Moderate", "Major", "Severe"];
const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost certain"];

function impactIndex(value: string) {
  const match = impactLabels.findIndex((label) => label.toLowerCase() === value.toLowerCase());
  return match >= 0 ? match : 2;
}

function likelihoodIndex(value: string) {
  const match = likelihoodLabels.findIndex((label) => label.toLowerCase() === value.toLowerCase());
  return match >= 0 ? match : 2;
}

function buildRiskMatrix() {
  const matrix = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
  for (const risk of risks) {
    matrix[impactIndex(risk.impact)][likelihoodIndex(risk.likelihood)] += 1;
  }
  return matrix;
}

function buildRiskDrivers() {
  const counts = risks.reduce<Record<string, { count: number; level: string }>>((acc, risk) => {
    const current = acc[risk.category] ?? { count: 0, level: risk.severity };
    current.count += 1;
    if (risk.severity === "Critical" || (risk.severity === "High" && current.level !== "Critical")) {
      current.level = risk.severity;
    }
    acc[risk.category] = current;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, item]) => ({ label, count: item.count, level: item.level }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function cellColor(impactIdx: number, likelihoodIdx: number) {
  const score = (impactIdx + 1) * (likelihoodIdx + 1);
  if (score >= 16) return "bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]";
  if (score >= 10) return "bg-[#FFEDD5] text-[#B45309] hover:bg-[#FED7AA]";
  if (score >= 5) return "bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]";
  return "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]";
}

function RisksPage() {
  const [hover, setHover] = useState<{ i: number; l: number } | null>(null);
  const [page, setPage] = useState(1);
  const riskMatrix = buildRiskMatrix();
  const riskDrivers = buildRiskDrivers();
  const pageCount = Math.max(1, Math.ceil(risks.length / PAGE_SIZE));
  const pageItems = risks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goTo(p: number) { setPage(Math.max(1, Math.min(p, pageCount))); }

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Risks" subtitle="Analyze risk exposure, impact, likelihood, and treatment status."
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
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Create risk</Button>
        </>}
      />
      {filtersVisible && <div className="px-8"><div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
        {["Category", "Severity", "Status", "Owner"].map((f) => (
          <button key={f} className="text-xs rounded-full border border-border px-3 py-1 hover:bg-[var(--primary-ultra-soft)]">{f}</button>
        ))}
        <button className="text-xs text-muted-foreground ml-auto flex items-center gap-1" onClick={() => setFiltersVisible(false)}><X className="h-3 w-3" />Close</button>
      </div></div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create risk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Risk title</label><Input placeholder="e.g. Data breach via unsecured API" /></div>
            <div><label className="text-xs font-medium">Category</label><Input placeholder="e.g. Data Security, Access Control" /></div>
            <div><label className="text-xs font-medium">Owner</label><Input placeholder="e.g. jane@example.com" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setDialogOpen(false); toast.success("Risk created"); }}>Create risk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total risks" value={risks.length.toString()} icon={AlertTriangle} />
          <StatCard label="Critical" value={risks.filter((r) => r.severity === "Critical").length.toString()} icon={Flame} />
          <StatCard label="In treatment" value={risks.filter((r) => r.status === "In treatment").length.toString()} icon={Activity} />
          <StatCard label="Accepted risks" value={risks.filter((r) => r.status === "Accepted").length.toString()} icon={ShieldCheck} accent />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="border-border xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Risk matrix</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Impact × Likelihood. Cells show the number of risks in that quadrant.</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#DCFCE7]" />Low</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#FEF3C7]" />Med</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#FFEDD5]" />High</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#FEE2E2]" />Critical</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex items-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground -rotate-90 whitespace-nowrap">Impact →</div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-[80px_repeat(5,minmax(0,1fr))] gap-1.5">
                    <div />
                    {likelihoodLabels.map((l) => (
                      <div key={l} className="text-[10px] text-center text-muted-foreground uppercase tracking-wide truncate">{l}</div>
                    ))}
                    {[4, 3, 2, 1, 0].map((i) => (
                      <Fragment key={`row-${i}`}>
                        <div className="text-[10px] text-right text-muted-foreground uppercase tracking-wide self-center pr-1">{impactLabels[i]}</div>
                        {[0, 1, 2, 3, 4].map((l) => {
                          const v = riskMatrix[i][l];
                          const active = hover && hover.i === i && hover.l === l;
                          return (
                            <button key={`${i}-${l}`}
                              onMouseEnter={() => setHover({ i, l })}
                              onMouseLeave={() => setHover(null)}
                              className={cn("aspect-square rounded-md flex items-center justify-center text-lg font-semibold transition-all", cellColor(i, l), active && "ring-2 ring-[var(--primary)] scale-[1.03]")}>
                              {v}
                            </button>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground text-center">Likelihood →</div>
                </div>
              </div>
              {hover && (
                <div className="mt-4 rounded-md border border-border bg-[var(--primary-ultra-soft)] px-3 py-2 text-xs">
                  <span className="font-semibold">{riskMatrix[hover.i][hover.l]} risks</span> · {impactLabels[hover.i]} impact · {likelihoodLabels[hover.l]} likelihood
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="shrink-0"><CardTitle className="text-sm">Top risk drivers</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 overflow-y-auto" style={{ maxHeight: "360px" }}>
              {riskDrivers.map((d) => (
                <div key={d.label} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge variant={severityVariant(d.level)}>{d.level}</StatusBadge>
                    <span className="text-sm truncate">{d.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{d.count}</span>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-muted-foreground">Top categories contributing the most exposure across your register.</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">Risk register</CardTitle>
            <span className="text-xs text-muted-foreground">{risks.length} risks</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[55vh] overflow-y-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10">
                  <tr><Th>Risk</Th><Th>Category</Th><Th>Impact</Th><Th>Likelihood</Th><Th>Score</Th><Th>Treatment</Th><Th>Owner</Th><Th>Due</Th></tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-[var(--primary-ultra-soft)]">
                      <td className="px-4 py-3 font-medium max-w-[250px]">
                        <Link to="/risks/$id" params={{ id: r.id }} className="hover:text-[var(--primary)] truncate block">{r.title}</Link>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{r.id}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.category}</td>
                      <td className="px-4 py-3"><StatusBadge variant={severityVariant(r.severity)}>{r.severity}</StatusBadge></td>
                      <td className="px-4 py-3 text-xs">{r.likelihood}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{r.score}</td>
                      <td className="px-4 py-3"><StatusBadge variant={statusVariant(r.status)}>{r.status}</StatusBadge></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.owner}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span>{risks.length} risk{risks.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)} className="h-8 px-2">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="tabular-nums">Page {page} of {pageCount}</span>
                <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => goTo(page + 1)} className="h-8 px-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-2.5 text-left font-medium">{children}</th>; }
