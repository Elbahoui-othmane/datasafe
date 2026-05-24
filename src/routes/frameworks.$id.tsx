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
import { StatCard } from "@/components/averonix/StatCard";
import { frameworks } from "@/data/active/frameworks";
import { controls } from "@/data/active/controls";
import { gaps } from "@/data/active/gaps";
import { risks } from "@/data/active/risks";
import { ShieldCheck, Layers, Target, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/frameworks/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Averonix` }] }),
  component: FrameworkDetail,
});

const PAGE_SIZE = 15;

function FrameworkDetail() {
  const { id } = Route.useParams();
  const f = frameworks.find((x) => x.id === id);
  const [tab, setTab] = useState("overview");
  const [cPage, setCPage] = useState(1);
  const [gPage, setGPage] = useState(1);
  const [rPage, setRPage] = useState(1);

  if (!f) return <NotFoundState label="Framework not found" backTo="/frameworks" backLabel="Back to frameworks" />;

  const mapped = controls.filter((c) => c.frameworks.includes(f.id));
  const fGaps = gaps.filter((g) => g.framework.toLowerCase().includes(f.shortName.toLowerCase().split(" ")[0]));
  const fRisks = risks.filter((r) => r.frameworks.includes(f.id));

  const cCount = Math.max(1, Math.ceil(mapped.length / PAGE_SIZE));
  const gCount = Math.max(1, Math.ceil(fGaps.length / PAGE_SIZE));
  const rCount = Math.max(1, Math.ceil(fRisks.length / PAGE_SIZE));

  const cItems = mapped.slice((cPage - 1) * PAGE_SIZE, cPage * PAGE_SIZE);
  const gItems = fGaps.slice((gPage - 1) * PAGE_SIZE, gPage * PAGE_SIZE);
  const rItems = fRisks.slice((rPage - 1) * PAGE_SIZE, rPage * PAGE_SIZE);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Frameworks", to: "/frameworks" }, { label: f.name }]}
        title={f.name}
        subtitle={f.description}
        badge={<StatusBadge variant="soft">{f.readiness}% ready</StatusBadge>}
        actions={<Button asChild className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"><Link to="/assessments/iso-27001">Continue assessment</Link></Button>}
      />
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Readiness" value={`${f.readiness}%`} icon={ShieldCheck} accent />
          <StatCard label="Controls" value={`${f.completed}/${f.total}`} icon={Layers} />
          <StatCard label="Open gaps" value={fGaps.length.toString()} icon={Target} />
          <StatCard label="Linked risks" value={fRisks.length.toString()} icon={AlertTriangle} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="controls">Controls</TabsTrigger><TabsTrigger value="gaps">Gaps</TabsTrigger><TabsTrigger value="risks">Risks</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>

          <TabsContent value="overview" className="mt-5">
            <Card className="border-border"><CardContent className="p-6 space-y-4">
              <div><h3 className="font-semibold mb-1">Summary</h3><p className="text-sm text-muted-foreground">{f.description}</p></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Readiness</span><span className="font-semibold">{f.readiness}%</span></div><ProgressBar value={f.readiness} /></div>
              <div><h4 className="text-sm font-semibold mb-2">Recommended next actions</h4>
                <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                  <li>Close 3 critical evidence gaps</li><li>Complete pending control assessments</li><li>Schedule internal audit review</li>
                </ul>
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="controls" className="mt-5">
            <Card className="border-border overflow-hidden flex flex-col">
              <div className="max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm"><thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase text-muted-foreground sticky top-0 z-10"><tr><th className="px-4 py-2.5 text-left">ID</th><th className="px-4 py-2.5 text-left">Control</th><th className="px-4 py-2.5 text-left">Owner</th><th className="px-4 py-2.5 text-left">Status</th></tr></thead><tbody>
                  {cItems.map((c) => (<tr key={c.id} className="border-t border-border hover:bg-[var(--primary-ultra-soft)]"><td className="px-4 py-3 font-mono text-xs">{c.id}</td><td className="px-4 py-3 font-medium max-w-[300px]"><Link to="/controls/$id" params={{ id: c.id }} className="hover:text-[var(--primary)] truncate block">{c.name}</Link></td><td className="px-4 py-3 text-muted-foreground">{c.owner}</td><td className="px-4 py-3"><StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge></td></tr>))}
                </tbody></table>
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>{mapped.length} control{mapped.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={cPage <= 1} onClick={() => setCPage(cPage - 1)} className="h-7 px-2"><ChevronLeft className="h-3 w-3" /></Button>
                  <span className="tabular-nums">{cPage}/{cCount}</span>
                  <Button variant="outline" size="sm" disabled={cPage >= cCount} onClick={() => setCPage(cPage + 1)} className="h-7 px-2"><ChevronRight className="h-3 w-3" /></Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="mt-5">
            <Card className="border-border overflow-hidden flex flex-col">
              <div className="max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm"><thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase text-muted-foreground sticky top-0 z-10"><tr><th className="px-4 py-2.5 text-left">Gap</th><th className="px-4 py-2.5 text-left">Severity</th><th className="px-4 py-2.5 text-left">Status</th></tr></thead><tbody>
                  {gItems.length === 0 ? <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">No mapped gaps.</td></tr> : gItems.map((g) => (<tr key={g.id} className="border-t border-border"><td className="px-4 py-3 font-medium max-w-[400px]"><Link to="/gaps/$id" params={{ id: g.id }} className="hover:text-[var(--primary)] truncate block">{g.title}</Link></td><td className="px-4 py-3"><StatusBadge variant={severityVariant(g.severity)}>{g.severity}</StatusBadge></td><td className="px-4 py-3"><StatusBadge variant={statusVariant(g.status)}>{g.status}</StatusBadge></td></tr>))}
                </tbody></table>
              </div>
              {fGaps.length > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>{fGaps.length} gap{fGaps.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={gPage <= 1} onClick={() => setGPage(gPage - 1)} className="h-7 px-2"><ChevronLeft className="h-3 w-3" /></Button>
                  <span className="tabular-nums">{gPage}/{gCount}</span>
                  <Button variant="outline" size="sm" disabled={gPage >= gCount} onClick={() => setGPage(gPage + 1)} className="h-7 px-2"><ChevronRight className="h-3 w-3" /></Button>
                </div>
              </div>}
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="mt-5">
            <Card className="border-border overflow-hidden flex flex-col">
              <div className="max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm"><thead className="bg-[var(--primary-ultra-soft)] text-xs uppercase text-muted-foreground sticky top-0 z-10"><tr><th className="px-4 py-2.5 text-left">Risk</th><th className="px-4 py-2.5 text-left">Severity</th><th className="px-4 py-2.5 text-left">Score</th></tr></thead><tbody>
                  {rItems.length === 0 ? <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">No mapped risks.</td></tr> : rItems.map((r) => (<tr key={r.id} className="border-t border-border"><td className="px-4 py-3 font-medium max-w-[400px]"><Link to="/risks/$id" params={{ id: r.id }} className="hover:text-[var(--primary)] truncate block">{r.title}</Link></td><td className="px-4 py-3"><StatusBadge variant={severityVariant(r.severity)}>{r.severity}</StatusBadge></td><td className="px-4 py-3 font-semibold">{r.score}</td></tr>))}
                </tbody></table>
              </div>
              {fRisks.length > 0 && <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>{fRisks.length} risk{fRisks.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={rPage <= 1} onClick={() => setRPage(rPage - 1)} className="h-7 px-2"><ChevronLeft className="h-3 w-3" /></Button>
                  <span className="tabular-nums">{rPage}/{rCount}</span>
                  <Button variant="outline" size="sm" disabled={rPage >= rCount} onClick={() => setRPage(rPage + 1)} className="h-7 px-2"><ChevronRight className="h-3 w-3" /></Button>
                </div>
              </div>}
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-5"><Card className="border-border"><CardContent className="p-6 max-h-[400px] overflow-y-auto"><ActivityTimeline items={[
            { id: "1", text: `Control assessed for ${f.shortName}`, time: "2h ago" },
            { id: "2", text: "Evidence uploaded", time: "Yesterday" },
            { id: "3", text: "Framework imported", time: "Last week" },
          ]} /></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
