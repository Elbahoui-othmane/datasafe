import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { frameworks } from "@/data/active/frameworks";
import { Plus, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/frameworks/")({
  head: () => ({ meta: [{ title: "Frameworks · Averonix" }, { name: "description", content: "Compliance frameworks catalog." }] }),
  component: FrameworksPage,
});

function FrameworksPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const nav = useNavigate();
  const filtered = frameworks.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Frameworks" subtitle="Track every compliance program in one catalog"
        actions={<Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Add framework</Button>}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add framework</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {["NIST CSF", "GDPR", "Law 09-08", "SOC 2", "ISO 27701"].map((name) => (
              <label key={name} className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-[var(--primary-ultra-soft)] cursor-pointer">
                <input type="radio" name="fw" className="h-4 w-4 accent-[var(--primary)]" />
                <span className="text-sm font-medium">{name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { setDialogOpen(false); toast.success("Framework added"); }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="custom">Custom</TabsTrigger></TabsList>
          </Tabs>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search frameworks" className="pl-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(tab === "custom" ? [] : filtered).map((f) => (
            <Card key={f.id} className="border-border relative overflow-hidden hover:border-[var(--primary)] hover:shadow-md transition group">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--primary-ultra-soft)] opacity-60" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] text-xs font-semibold">{f.shortName.slice(0, 3).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{f.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.description}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Readiness</span>
                    <span className="font-semibold tabular-nums">{f.readiness}%</span>
                  </div>
                  <ProgressBar value={f.readiness} />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{f.completed}/{f.total} controls</span>
                  <Button size="sm" variant="outline" onClick={() => nav({ to: "/frameworks/$id", params: { id: f.id } })}>
                    View details<ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tab === "custom" && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="text-sm font-medium text-foreground">No custom frameworks yet</div>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">Custom frameworks can be added to extend your compliance program beyond built-in standards.</p>
              <Button className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Add framework
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
