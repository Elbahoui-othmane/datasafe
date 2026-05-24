import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, statusVariant } from "@/components/averonix/StatusBadge";
import { extendedIntegrations, recommendedIntegrations } from "@/mocks/extras";
import { Plug, Sparkles, CheckCircle2, Eye, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/integrations/")({
  head: () => ({ meta: [{ title: "Integrations · Averonix" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [tab, setTab] = useState("available");
  const nav = useNavigate();

  const filtered =
    tab === "connected"
      ? extendedIntegrations.filter((i) => i.status === "Connected")
      : tab === "recommended"
        ? extendedIntegrations.filter((i) => recommendedIntegrations.includes(i.id))
        : extendedIntegrations;

  const categories = Array.from(new Set(filtered.map((i) => i.category)));

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Connect tools to automate evidence collection, vendor discovery, and security monitoring."
      />
      <div className="p-8 space-y-6">
        {/* Google Workspace featured card */}
        <Card
          className="border-border hover:border-[var(--primary)] hover:shadow-sm transition cursor-pointer"
          onClick={() => nav({ to: "/integrations/google-workspace" })}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] font-semibold text-xs shrink-0">
                GW
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">Google Workspace</h3>
                  <StatusBadge variant={statusVariant("Available")}>Available</StatusBadge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Identity provider — sync users, groups, and login activity for access control evidence. Requires OAuth Web Client credentials and Admin SDK API.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {["Users", "Groups", "Admin SDK", "Evidence", "OAuth"].map((capability) => (
                    <span key={capability} className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); nav({ to: "/integrations/google-workspace" }); }}
              >
                <Eye className="h-3.5 w-3.5" />View details
              </Button>
              <Button
                size="sm"
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                onClick={(e) => { e.stopPropagation(); nav({ to: "/integrations/google-workspace" }); }}
              >
                <ExternalLink className="h-3.5 w-3.5" />Connect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="available">All integrations</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6 space-y-6">
            {tab === "recommended" && (
              <div className="rounded-lg border border-dashed border-[var(--primary)]/40 bg-[var(--primary-ultra-soft)] p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[var(--primary)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">Suggested for your stack</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Based on your connected tools and active frameworks, these integrations will unlock the most evidence and automated tests.
                  </p>
                </div>
              </div>
            )}

            {tab === "connected" && filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] mx-auto mb-3">
                  <Plug className="h-6 w-6 text-[var(--primary-dark)]" />
                </div>
                <div className="text-sm font-medium">No integrations connected yet</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect Google Workspace or another integration to start syncing data.
                </p>
                <Button
                  className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                  size="sm"
                  onClick={() => nav({ to: "/integrations/google-workspace" })}
                >
                  Connect Google Workspace
                </Button>
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)] font-semibold text-xs shrink-0">
                            {i.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm">{i.name}</h3>
                              <StatusBadge variant={statusVariant(i.status)}>{i.status}</StatusBadge>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {i.capabilities.map((c) => (
                                <span key={c} className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Powers</div>
                          <div className="flex flex-wrap gap-1.5">
                            {i.powers.map((p) => (
                              <span key={p} className="text-[10px] inline-flex items-center gap-1 rounded bg-[var(--primary-ultra-soft)] text-[var(--primary-dark)] px-1.5 py-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />{p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {i.status === "Connected" && "lastSync" in i && (
                          <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
                            <span>Workspace: <span className="text-foreground font-medium">{(i as any).workspace}</span></span>
                            <span>Synced {(i as any).lastSync}</span>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            asChild
                            variant={i.status === "Connected" ? "outline" : "default"}
                            size="sm"
                            className={i.status !== "Connected" ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" : ""}
                          >
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
