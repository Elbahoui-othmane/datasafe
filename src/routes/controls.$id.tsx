import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { ActivityTimeline } from "@/components/averonix/ActivityTimeline";
import { controls } from "@/data/active/controls";
import { frameworks } from "@/data/active/frameworks";
import { gaps } from "@/data/active/gaps";
import { risks } from "@/data/active/risks";
import { tasks } from "@/data/active/tasks";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/controls/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Control · Averonix` }] }),
  component: ControlDetail,
});

function ControlDetail() {
  const { id } = Route.useParams();
  const c = controls.find((x) => x.id === id);
  const [tab, setTab] = useState("overview");
  const [updateOpen, setUpdateOpen] = useState(false);
  if (!c) return <NotFoundState label="Control not found" backTo="/controls" backLabel="Back to controls" />;
  const linkedGaps = gaps.filter((g) => g.controlId === c.id || g.linkedControl === c.name);
  const linkedRisks = risks.filter((r) => r.linkedControlId === c.id || r.linkedControl === c.name);
  const linkedTasks = tasks.filter((t) => t.linkedControlId === c.id || t.linkedControl === c.name);
  const evidenceItems = c.evidenceRequirements?.length
    ? c.evidenceRequirements
    : ["Quarterly screenshot", "Configuration export", "Reviewer sign-off"].map((name, index) => ({
        id: `${c.id}-ev-${index}`,
        name,
        status: c.evidence.toLowerCase(),
        required: true,
        type: "document",
      }));

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Controls", to: "/controls" }, { label: c.id }]} title={c.name}
        subtitle={c.description}
        badge={<><StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge><StatusBadge variant={severityVariant(c.risk)} className="ml-2">{c.risk}</StatusBadge></>}
        actions={<Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setUpdateOpen(true)}>Update control</Button>}
      />
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Update control</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Status</label><Input defaultValue={c.status} /></div>
            <div><label className="text-xs font-medium">Owner</label><Input defaultValue={c.owner} /></div>
            <div><label className="text-xs font-medium">Score</label><Input defaultValue={c.score?.toString() ?? ""} placeholder="Score" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setUpdateOpen(false); toast.success("Control updated"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="linked">Linked items</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>

          <TabsContent value="overview" className="mt-5"><Card className="border-border"><CardContent className="p-6 grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
            <Row label="Control ID" value={c.id} /><Row label="Owner" value={c.owner} />
            <Row label="Domain" value={c.domainName ?? "General"} />
            <Row label="Category" value={c.category ?? "Security"} />
            <Row label="Score" value={c.score === null || c.score === undefined ? `${c.testsDone}/${c.testsTotal} tests` : `${c.score}%`} />
            <Row label="Status" value={<StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge>} />
            <Row label="Risk" value={<StatusBadge variant={severityVariant(c.risk)}>{c.risk}</StatusBadge>} />
            <Row label="Evidence" value={<StatusBadge variant={statusVariant(c.evidence)}>{c.evidence}</StatusBadge>} />
            <Row label="Frameworks" value={c.frameworks.map((id) => frameworks.find((f) => f.id === id)?.shortName).join(", ")} />
            <div className="col-span-2 mt-4 border-t border-border pt-4"><div className="text-xs font-medium uppercase text-muted-foreground mb-1">Description</div><p>{c.description}</p></div>
          </CardContent></Card></TabsContent>

          <TabsContent value="evidence" className="mt-5">
            <CollapsibleSection title="Evidence status" badge={<StatusBadge variant={statusVariant(c.evidence)}>{c.evidence}</StatusBadge>}>
              <p className="text-sm text-muted-foreground mb-4">Latest evidence snapshot for this control.</p>
              <ul className="space-y-2 text-sm">
                {evidenceItems.map((e) => (<li key={e.id} className="flex items-center justify-between rounded-md border border-border p-3"><span>{e.name}</span><div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">{e.type.replace(/_/g, " ")}</span><StatusBadge variant={statusVariant(e.status)}>{e.status}</StatusBadge></div></li>))}
              </ul>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="linked" className="mt-5"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LinkedList title="Gaps" items={linkedGaps.map((g) => ({ id: g.id, label: g.title, to: "/gaps/$id" as const, severity: g.severity }))} />
            <LinkedList title="Risks" items={linkedRisks.map((r) => ({ id: r.id, label: r.title, to: "/risks/$id" as const, severity: r.severity }))} />
            <LinkedList title="Tasks" items={linkedTasks.map((t) => ({ id: t.id, label: t.title, to: "/tasks/$id" as const, severity: t.priority }))} />
          </div></TabsContent>

          <TabsContent value="activity" className="mt-5"><Card className="border-border"><CardContent className="p-6"><ActivityTimeline items={[
            { id: "1", text: "Control evidence refreshed", time: "1h ago" },
            { id: "2", text: `Owner assigned: ${c.owner}`, time: "Yesterday" },
            { id: "3", text: "Control created", time: "Last month" },
          ]} /></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function Row({ label, value }: any) { return <div><div className="text-xs text-muted-foreground uppercase">{label}</div><div className="mt-0.5">{value}</div></div>; }
type LinkKind = "/gaps/$id" | "/risks/$id" | "/tasks/$id";
function LinkedList({ title, items }: { title: string; items: { id: string; label: string; to: LinkKind; severity: string }[] }) {
  return <Card className="border-border"><CardContent className="p-5"><h4 className="text-sm font-semibold mb-3">{title}</h4><ul className="space-y-2">{items.map((i) => {
    const inner = <><StatusBadge variant={severityVariant(i.severity)}>{i.severity}</StatusBadge><span className="flex-1 truncate">{i.label}</span></>;
    const cls = "flex items-center gap-2 rounded-md border border-border p-2.5 hover:border-[var(--primary)] text-sm";
    return <li key={i.id}>
      {i.to === "/gaps/$id" && <Link to="/gaps/$id" params={{ id: i.id }} className={cls}>{inner}</Link>}
      {i.to === "/risks/$id" && <Link to="/risks/$id" params={{ id: i.id }} className={cls}>{inner}</Link>}
      {i.to === "/tasks/$id" && <Link to="/tasks/$id" params={{ id: i.id }} className={cls}>{inner}</Link>}
    </li>;
  })}</ul></CardContent></Card>;
}

function CollapsibleSection({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{title}</h3>
            {badge}
          </div>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
        {open && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
