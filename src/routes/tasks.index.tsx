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
import { tasks } from "@/data/active/tasks";
import { Plus, Download, Filter, ListTodo, Clock, Activity, CheckCheck, LayoutGrid, List, CalendarDays, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks/")({
  head: () => ({ meta: [{ title: "Tasks · Averonix" }] }),
  component: TasksPage,
});

type Lane = "To do" | "In progress" | "Waiting evidence" | "Done";
const lanes: { key: Lane; match: (s: string) => boolean; tint: string }[] = [
  { key: "To do", match: (s) => s === "Open", tint: "bg-[#F3F4F6] text-[#374151]" },
  { key: "In progress", match: (s) => s === "In progress", tint: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { key: "Waiting evidence", match: (s) => s === "Awaiting evidence" || s === "Blocked", tint: "bg-[#FEF3C7] text-[#B45309]" },
  { key: "Done", match: (s) => s === "Closed", tint: "bg-[#DCFCE7] text-[#15803D]" },
];

function TasksPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Tasks" subtitle="Manage remediation work, assignments, and deadlines."
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
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Create task</Button>
        </>}
      />
      {filtersVisible && <div className="px-8"><div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
        {["Owner", "Priority", "Framework", "Status"].map((f) => (
          <button key={f} className="text-xs rounded-full border border-border px-3 py-1 hover:bg-[var(--primary-ultra-soft)]">{f}</button>
        ))}
        <button className="text-xs text-muted-foreground ml-auto flex items-center gap-1" onClick={() => setFiltersVisible(false)}><X className="h-3 w-3" />Close</button>
      </div></div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Task title</label><Input placeholder="e.g. Implement MFA for all users" /></div>
            <div><label className="text-xs font-medium">Owner</label><Input placeholder="e.g. jane@example.com" /></div>
            <div><label className="text-xs font-medium">Due date</label><Input type="date" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setDialogOpen(false); toast.success("Task created"); }}>Create task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open tasks" value={tasks.filter((t) => t.status !== "Closed").length.toString()} icon={ListTodo} />
          <StatCard label="Waiting evidence" value={tasks.filter((t) => t.status === "Awaiting evidence").length.toString()} icon={Clock} />
          <StatCard label="In progress" value={tasks.filter((t) => t.status === "In progress").length.toString()} icon={Activity} />
          <StatCard label="Completed this quarter" value={tasks.filter((t) => t.status === "Closed").length.toString()} icon={CheckCheck} accent />
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            <button onClick={() => setView("kanban")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                view === "kanban" ? "bg-[var(--primary)] text-white" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="h-3.5 w-3.5" />Kanban
            </button>
            <button onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                view === "list" ? "bg-[var(--primary)] text-white" : "text-muted-foreground hover:text-foreground")}>
              <List className="h-3.5 w-3.5" />List
            </button>
          </div>
          <div className="text-xs text-muted-foreground">{tasks.length} tasks across {lanes.length} stages</div>
        </div>

        {view === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" style={{ minHeight: 0 }}>
            {lanes.map((lane) => {
              const items = tasks.filter((t) => lane.match(t.status));
              return (
                <div key={lane.key} className="flex flex-col min-h-0 rounded-lg border border-border bg-[var(--primary-ultra-soft)]/40 p-3">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", lane.tint)}>{lane.key}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                  </div>
                  <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 330px)" }}>
                    {items.map((t) => (
                      <Link key={t.id} to="/tasks/$id" params={{ id: t.id }}
                        className="block rounded-lg bg-card border border-border p-3 hover:border-[var(--primary)] hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-snug truncate">{t.title}</div>
                          <StatusBadge variant={severityVariant(t.priority)}>{t.priority}</StatusBadge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {t.relatedGap && <span className="rounded bg-[var(--primary-soft)] text-[var(--primary-dark)] px-1.5 py-0.5 font-mono">Gap {t.relatedGap}</span>}
                          <span className="rounded bg-muted text-muted-foreground px-1.5 py-0.5">{t.framework}</span>
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={t.progress} className="h-1.5" />
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[9px] font-semibold">{t.owner.split(" ").map(p=>p[0]).join("").slice(0,2)}</span>{t.owner.split(" ")[0]}</span>
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{t.dueDate.replace(", 2025", "")}</span>
                        </div>
                      </Link>
                    ))}
                    {items.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-6">No tasks</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="max-h-[55vh] overflow-y-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10">
                    <tr><Th>Task</Th><Th>Priority</Th><Th>Status</Th><Th>Linked</Th><Th>Owner</Th><Th>Progress</Th><Th>Due</Th></tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className="border-t border-border hover:bg-[var(--primary-ultra-soft)]">
                        <td className="px-4 py-3 font-medium max-w-[300px]"><Link to="/tasks/$id" params={{ id: t.id }} className="hover:text-[var(--primary)] truncate block">{t.title}</Link></td>
                        <td className="px-4 py-3"><StatusBadge variant={severityVariant(t.priority)}>{t.priority}</StatusBadge></td>
                        <td className="px-4 py-3"><StatusBadge variant={statusVariant(t.status)}>{t.status}</StatusBadge></td>
                        <td className="px-4 py-3 text-xs font-mono">{t.relatedGap ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">{t.owner}</td>
                        <td className="px-4 py-3 min-w-[140px]"><div className="flex items-center gap-2"><ProgressBar value={t.progress} /><span className="text-xs tabular-nums w-8 text-right">{t.progress}%</span></div></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-2.5 text-left font-medium">{children}</th>; }
