import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { gaps } from "@/data/active/gaps";
import { tasks } from "@/data/active/tasks";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/gaps/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Gap · Averonix` }] }),
  component: () => {
    const { id } = Route.useParams();
    const g = gaps.find((x) => x.id === id);
    const [tab, setTab] = useState("overview");
    const [resolved, setResolved] = useState(false);
    if (!g) return <NotFoundState label="Gap not found" backTo="/gaps" backLabel="Back to gaps" />;
    const linkedTasks = tasks.filter((t) => t.relatedGap === g.id);
    return (
      <>
        <PageHeader breadcrumbs={[{ label: "Gaps", to: "/gaps" }, { label: g.id }]} title={g.title}
          subtitle={g.reason}
          badge={<><StatusBadge variant={severityVariant(g.severity)}>{g.severity}</StatusBadge><StatusBadge variant={statusVariant(resolved ? "Closed" : g.status)} className="ml-2">{resolved ? "Closed" : g.status}</StatusBadge></>}
          actions={<Button className={`${resolved ? "bg-green-600" : "bg-[var(--primary)]"} hover:opacity-90 text-white`} onClick={() => { setResolved(!resolved); toast.success(resolved ? "Gap reopened" : "Gap marked resolved"); }}>
            {resolved ? "Reopen" : "Mark resolved"}
          </Button>}
        />
        <div className="p-8 space-y-5">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="remediation">Remediation</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="tasks">Linked tasks</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>

            <TabsContent value="overview" className="mt-5"><Card className="border-border"><CardContent className="p-6 space-y-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8 text-sm">
              <R label="Framework" v={g.framework} /><R label="Owner" v={g.owner} /><R label="Due" v={g.dueDate} />
              <R label="Linked control" v={g.linkedControl} /><R label="Updated" v={g.updated} />
            </div><div><div className="flex justify-between text-sm mb-1.5"><span>Remediation progress</span><span className="font-semibold">{g.progress}%</span></div><ProgressBar value={g.progress} /></div></CardContent></Card></TabsContent>

            <TabsContent value="remediation" className="mt-5">
              <CollapsibleSection title="Remediation steps">
                <ol className="space-y-2 text-sm">{g.remediationSteps.map((s, i) => (<li key={s} className="flex items-start gap-3 rounded-md border border-border p-3"><div className="h-6 w-6 rounded-full bg-[var(--primary-soft)] text-[var(--primary-dark)] flex items-center justify-center text-xs font-semibold">{i + 1}</div>{s}</li>))}</ol>
              </CollapsibleSection>
            </TabsContent>

            <TabsContent value="evidence" className="mt-5">
              <CollapsibleSection title="Required evidence">
                <ul className="space-y-2 text-sm">{g.requiredEvidence.map((e) => (<li key={e} className="flex items-center justify-between rounded-md border border-border p-3"><span>{e}</span><StatusBadge variant="warning">Missing</StatusBadge></li>))}</ul>
              </CollapsibleSection>
            </TabsContent>

            <TabsContent value="tasks" className="mt-5"><Card className="border-border"><CardContent className="p-6">{linkedTasks.length === 0 ? <p className="text-sm text-muted-foreground">No linked tasks.</p> : <ul className="space-y-2">{linkedTasks.map((t) => (<li key={t.id}><Link to="/tasks/$id" params={{ id: t.id }} className="flex items-center gap-3 rounded-md border border-border p-3 hover:border-[var(--primary)] text-sm"><StatusBadge variant={severityVariant(t.priority)}>{t.priority}</StatusBadge><span className="flex-1">{t.title}</span><span className="text-xs text-muted-foreground">{t.progress}%</span></Link></li>))}</ul>}</CardContent></Card></TabsContent>

            <TabsContent value="activity" className="mt-5"><Card className="border-border"><CardContent className="p-6"><ActivityTimeline items={[{ id: "1", text: "Progress updated", time: "1h ago" }, { id: "2", text: "Task linked", time: "Yesterday" }, { id: "3", text: "Gap opened", time: "Last week" }]} /></CardContent></Card></TabsContent>
          </Tabs>
        </div>
      </>
    );
  },
});
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
