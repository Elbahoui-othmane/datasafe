import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, statusVariant } from "@/components/averonix/StatusBadge";
import { extendedIntegrations, recommendedIntegrations } from "@/mocks/extras";
import { isAssessmentMode } from "@/config/dataSource";
import { Plug, Sparkles, CheckCircle2, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/integrations/")({
  head: () => ({ meta: [{ title: "Integrations · Averonix" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [tab, setTab] = useState("connected");
  const nav = useNavigate();

  if (isAssessmentMode()) {
    return (
      <>
        <PageHeader title="Integrations" subtitle="Connect tools to automate evidence, discovery, and monitoring." />
        <div className="p-8 space-y-6">
          <Card className="border-border hover:border-[var(--primary)] hover:shadow-sm transition cursor-pointer" onClick={() => nav({ to: "/integrations/google-workspace" })}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] font-semibold text-xs">GW</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm">Google Workspace</h3>
                    <StatusBadge variant={statusVariant("Available")}>Available</StatusBadge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Identity provider — sync users, groups, and login activity for access control evidence.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {["Users", "Groups", "Admin SDK", "Evidence"].map((capability) => (
                      <span key={capability} className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">{capability}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); nav({ to: "/integrations/google-workspace" }); }}>
                  <Eye className="h-3.5 w-3.5" />View details
                </Button>
                <Button size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={(e) => { e.stopPropagation(); nav({ to: "/integrations/google-workspace" }); }}>
                  <ExternalLink className="h-3.5 w-3.5" />Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const filtered = tab === "connected"
    ? extendedIntegrations.filter((i) => i.status === "Connected")
    : tab === "recommended"
      ? extendedIntegrations.filter((i) => recommendedIntegrations.includes(i.id))
      : extendedIntegrations.filter((i) => i.status === "Available");

  const categories = Array.from(new Set(filtered.map((i) => i.category)));

  return (
    <>
      <PageHeader title="Integrations" subtitle="Connect tools to automate evidence, discovery, and monitoring." />
      <div className="p-8 space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "recommended" && (
          <div className="rounded-lg border border-dashed border-[var(--primary)]/40 bg-[var(--primary-ultra-soft)] p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--primary)] mt-0.5" />
            <div>
              <div className="text-sm font-semibold">Suggested for your stack</div>
              <p className="text-xs text-muted-foreground mt-0.5">Based on your connected tools and active frameworks, these integrations will unlock the most evidence and tests.</p>
            </div>
          </div>
        )}

        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-wider">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.filter((i) => i.category === cat).map((i) => (
                <Card key={i.id} className="border-border hover:border-[var(--primary)] hover:shadow-sm transition">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] font-semibold text-xs">{i.name.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm">{i.name}</h3>
                          <StatusBadge variant={statusVariant(i.status)}>{i.status}</StatusBadge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {i.capabilities.map((c) => <span key={c} className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">{c}</span>)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Powers</div>
                      <div className="flex flex-wrap gap-1.5">
                        {i.powers.map((p) => (
                          <span key={p} className="text-[10px] inline-flex items-center gap-1 rounded bg-[var(--primary-ultra-soft)] text-[var(--primary-dark)] px-1.5 py-0.5"><CheckCircle2 className="h-2.5 w-2.5" />{p}</span>
                        ))}
                      </div>
                    </div>

                    {i.status === "Connected" && (
                      <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Workspace: <span className="text-foreground font-medium">{i.workspace}</span></span>
                        <span>Synced {i.lastSync}</span>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <Button asChild variant={i.status === "Connected" ? "outline" : "default"} size="sm"
                        className={i.status !== "Connected" ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" : ""}>
                        <Link to="/integrations/$id" params={{ id: i.id }}>
                          <Plug className="h-3.5 w-3.5" />{i.status === "Connected" ? "Manage" : "Connect"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
