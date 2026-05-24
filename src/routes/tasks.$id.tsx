import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { tasks } from "@/data/active/tasks";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Task · Averonix` }] }),
  component: TaskDetail,
});

function TaskDetail() {
  const { id } = Route.useParams();
  const initial = tasks.find((x) => x.id === id);
  const [tab, setTab] = useState("overview");
  const [checks, setChecks] = useState(initial?.checklist ?? []);
  const [completed, setCompleted] = useState(false);
  if (!initial) return <NotFoundState label="Task not found" backTo="/tasks" backLabel="Back to tasks" />;
  const t = initial;

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Tasks", to: "/tasks" }, { label: t.id }]} title={t.title}
        subtitle={t.summary}
        badge={<><StatusBadge variant={severityVariant(t.priority)}>{t.priority}</StatusBadge><StatusBadge variant={statusVariant(completed ? "Closed" : t.status)} className="ml-2">{completed ? "Closed" : t.status}</StatusBadge></>}
        actions={<Button className={`${completed ? "bg-green-600" : "bg-[var(--primary)]"} hover:opacity-90 text-white`} onClick={() => { setCompleted(!completed); toast.success(completed ? "Task reopened" : "Task marked complete"); }}>
          {completed ? "Reopen" : "Mark complete"}
        </Button>}
      />
      <div className="p-8 space-y-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="checklist">Checklist</TabsTrigger><TabsTrigger value="linked">Linked items</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>

          <TabsContent value="overview" className="mt-5"><Card className="border-border"><CardContent className="p-6 space-y-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8 text-sm">
            <R label="Framework" v={t.framework} /><R label="Owner" v={t.owner} /><R label="Due" v={t.dueDate} />
            <R label="Linked control" v={t.linkedControl} /><R label="Related gap" v={t.relatedGap ? <Link to="/gaps/$id" params={{ id: t.relatedGap }} className="text-[var(--primary)]">{t.relatedGap}</Link> : "—"} />
            <R label="Updated" v={t.updated} />
          </div><div><div className="flex justify-between text-sm mb-1.5"><span>Progress</span><span className="font-semibold">{t.progress}%</span></div><ProgressBar value={t.progress} /></div></CardContent></Card></TabsContent>

          <TabsContent value="checklist" className="mt-5">
            <CollapsibleSection title="Checklist">
              <ul className="space-y-2 text-sm">{checks.map((c) => (<li key={c.id} className="flex items-start gap-3 rounded-md border border-border p-3"><Checkbox checked={c.done} onCheckedChange={(v) => setChecks((arr) => arr.map((x) => x.id === c.id ? { ...x, done: !!v } : x))} className="mt-0.5" /><span className={c.done ? "line-through text-muted-foreground" : ""}>{c.text}</span></li>))}</ul>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="linked" className="mt-5"><Card className="border-border"><CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div className="rounded-md border border-border p-4"><div className="text-xs text-muted-foreground uppercase">Linked control</div><div className="mt-1 font-medium">{t.linkedControl}</div></div>{t.relatedGap && <div className="rounded-md border border-border p-4"><div className="text-xs text-muted-foreground uppercase">Related gap</div><Link to="/gaps/$id" params={{ id: t.relatedGap }} className="mt-1 font-medium block text-[var(--primary)]">{t.relatedGap}</Link></div>}</CardContent></Card></TabsContent>

          <TabsContent value="activity" className="mt-5"><Card className="border-border"><CardContent className="p-6"><ActivityTimeline items={[{ id: "1", text: "Subtask completed", time: "30m ago" }, { id: "2", text: `Assigned to ${t.owner}`, time: "Yesterday" }, { id: "3", text: "Task created", time: "Last week" }]} /></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
function R({ label, v }: any) { return <div><div className="text-xs text-muted-foreground uppercase">{label}</div><div className="mt-0.5">{v}</div></div>; }

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
          <h3 className="font-semibold">{title}</h3>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
        {open && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
