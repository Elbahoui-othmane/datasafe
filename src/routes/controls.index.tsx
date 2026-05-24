import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { Donut } from "@/components/averonix/Charts";
import { controls } from "@/data/active/controls";
import { frameworks } from "@/data/active/frameworks";
import { Plus, Search, MoreHorizontal, ChevronRight, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/controls/")({
  head: () => ({ meta: [{ title: "Controls · Averonix" }, { name: "description", content: "Manage security controls and implementation status." }] }),
  component: ControlsPage,
});

const PAGE_SIZE = 15;

function ControlsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() =>
    controls.filter((c) =>
      [c.name, c.id, c.domainName, c.category, c.owner]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q.toLowerCase())),
    ),
    [q],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = controls.find((c) => c.id === selectedId);
  const assigned = controls.filter((c) => c.owner).length;
  const okControls = controls.filter((c) => c.status === "OK").length;
  const evidenceReady = controls.filter((c) => c.evidence === "Verified" || c.evidence === "Uploaded" || c.evidence === "Ready").length;
  const completion = Math.round((okControls / controls.length) * 100);

  function goTo(p: number) { setPage(Math.max(1, Math.min(p, pageCount))); }

  const [moreOpen, setMoreOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Controls" subtitle="Track implementation, ownership, and evidence across every control"
        actions={<>
          <div className="relative">
            <Button variant="outline" onClick={() => setMoreOpen(!moreOpen)}><MoreHorizontal className="h-4 w-4" />More</Button>
            {moreOpen && <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-card shadow-lg z-50">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setMoreOpen(false); toast.success("Import ready — upload a CSV file to add controls in bulk."); }}>Import controls</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setMoreOpen(false); toast.success("Controls exported as CSV"); }}>Export controls</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-ultra-soft)]" onClick={() => { setMoreOpen(false); toast.success("Bulk assignment saved locally"); }}>Bulk assign</button>
            </div>}
          </div>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Add control</Button>
        </>}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add control</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Control name</label><Input placeholder="e.g. Access Control Policy" /></div>
            <div><label className="text-xs font-medium">Domain</label><Input placeholder="e.g. A.9 Access Control" /></div>
            <div><label className="text-xs font-medium">Owner</label><Input placeholder="e.g. jane@example.com" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setDialogOpen(false); toast.success("Control added"); }}>Add control</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Assignment</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <Donut size={140} centerValue={`${Math.round((assigned / controls.length) * 100)}%`} centerLabel="assigned" data={[
                { name: "Assigned", value: assigned, color: "#C560CC" },
                { name: "Unassigned", value: controls.length - assigned, color: "#E9DDEA" },
                { name: "Needs reassignment", value: controls.filter((c) => c.status === "Not assigned").length, color: "#D97706" },
              ]}/>
              <ul className="text-sm space-y-2">
                <Legend color="#C560CC" label="Assigned" value={assigned.toString()} />
                <Legend color="#E9DDEA" label="Unassigned" value={(controls.length - assigned).toString()} />
                <Legend color="#D97706" label="Needs reassignment" value={controls.filter((c) => c.status === "Not assigned").length.toString()} />
                <li className="text-xs text-muted-foreground pt-2 border-t border-border">Total controls: {controls.length}</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Completion</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{completion}% <span className="text-sm font-normal text-muted-foreground">controls OK</span></div>
              <div className="text-xs text-muted-foreground mt-1">{okControls} completed / {controls.length} total</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniBar label="Tests" value={Math.round(controls.reduce((sum, c) => sum + c.testsDone, 0) / controls.reduce((sum, c) => sum + c.testsTotal, 0) * 100)} />
                <MiniBar label="Evidence" value={Math.round((evidenceReady / controls.length) * 100)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search controls" className="pl-9 h-9 border-transparent bg-muted" />
          </div>
          <FilterChip label="Framework" /><FilterChip label="Owner" /><FilterChip label="Domain" />
          <FilterChip label="Source" /><FilterChip label="Status" /><FilterChip label="Risk" />
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setQ(""); setPage(1); }}><X className="h-3 w-3" />Clear all</Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-lg border border-border bg-card overflow-hidden flex flex-col">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-left w-8"><Checkbox /></th>
                    <Th>ID</Th><Th>Control</Th><Th>Domain</Th><Th>Owner</Th><Th>Framework</Th><Th>Score</Th><Th>Evidence</Th><Th>Status</Th><Th>Risk</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)}
                      className={`border-t border-border cursor-pointer hover:bg-[var(--primary-ultra-soft)] ${selectedId === c.id ? "bg-[var(--primary-ultra-soft)]" : ""}`}>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}><Checkbox /></td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="px-3 py-3 font-medium max-w-[200px] truncate">{c.name}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{c.domainName ?? "General"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.owner}</td>
                      <td className="px-3 py-3 text-xs">{c.frameworks.map((id) => frameworks.find((f) => f.id === id)?.shortName).join(", ")}</td>
                      <td className="px-3 py-3 tabular-nums text-xs text-muted-foreground">{c.score ?? Math.round((c.testsDone / c.testsTotal) * 100)}%</td>
                      <td className="px-3 py-3"><StatusBadge variant={statusVariant(c.evidence)}>{c.evidence}</StatusBadge></td>
                      <td className="px-3 py-3"><StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge></td>
                      <td className="px-3 py-3"><StatusBadge variant={severityVariant(c.risk)}>{c.risk}</StatusBadge></td>
                      <td className="px-3 py-3"><Link to="/controls/$id" params={{ id: c.id }}><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span>{filtered.length} control{filtered.length !== 1 ? "s" : ""}{q ? ` (filtered)` : ""}</span>
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
          </div>

          {selected && (
            <Card className="border-border h-fit xl:sticky xl:top-4">
              <CardContent className="p-5">
                <div className="text-xs font-mono text-muted-foreground">{selected.id}</div>
                <h3 className="mt-1 font-semibold">{selected.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{selected.description}</p>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <Row label="Owner" value={selected.owner} />
                  <Row label="Domain" value={selected.domainName ?? "General"} />
                  <Row label="Category" value={selected.category ?? "Security"} />
                  <Row label="Score" value={selected.score === null || selected.score === undefined ? "Demo tests" : `${selected.score}%`} />
                  <Row label="Status" value={<StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>} />
                  <Row label="Risk" value={<StatusBadge variant={severityVariant(selected.risk)}>{selected.risk}</StatusBadge>} />
                  <Row label="Evidence" value={<StatusBadge variant={statusVariant(selected.evidence)}>{selected.evidence}</StatusBadge>} />
                </dl>
                <Button asChild className="w-full mt-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                  <Link to="/controls/$id" params={{ id: selected.id }}>View control details</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Th({ children }: any) { return <th className="px-3 py-2.5 text-left font-medium">{children}</th>; }
function Row({ label, value }: any) { return <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground text-xs">{label}</dt><dd className="text-right">{value}</dd></div>; }
function Legend({ color, label, value }: any) { return <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1">{label}</span><span className="font-medium tabular-nums">{value}</span></li>; }
function FilterChip({ label }: { label: string }) {
  const [active, setActive] = useState(false);
  return <Button variant={active ? "default" : "outline"} size="sm" className="h-9 text-xs" onClick={() => setActive(!active)}
    style={active ? { backgroundColor: "var(--primary)", color: "white" } : {}}>{label}<ChevronRight className="h-3 w-3 rotate-90" /></Button>;
}
function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}%</span></div>
      <div className="h-2 rounded-full bg-[var(--primary-ultra-soft)]"><div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${value}%` }} /></div>
    </div>
  );
}
