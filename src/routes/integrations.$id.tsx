import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoogleWorkspaceIntegrationPage } from "@/components/integrations/GoogleWorkspaceIntegrationPage";
import { isAssessmentMode } from "@/config/dataSource";
import { integrations } from "@/mocks/data";
import { Plug, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/integrations/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Integration · Averonix` }] }),
  component: () => {
    const { id } = Route.useParams();
    const nav = useNavigate();
    const [disconnectOpen, setDisconnectOpen] = useState(false);

    if (id === "google-workspace") {
      return <GoogleWorkspaceIntegrationPage />;
    }

    if (isAssessmentMode()) {
      return (
        <>
          <PageHeader title="Integration" subtitle="Integration detail" />
          <div className="p-8">
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
                  <Plug className="h-8 w-8 text-[var(--primary-dark)]" />
                </div>
                <h2 className="text-xl font-semibold">Integration not available</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Integration detail is not available in assessment mode.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    const i = integrations.find((x) => x.id === id);
    if (!i) return <NotFoundState label="Integration not found" backTo="/integrations" backLabel="Back to integrations" />;
    const connected = i.status === "Connected";
    return (
      <>
        <PageHeader breadcrumbs={[{ label: "Integrations", to: "/integrations" }, { label: i.name }]} title={i.name}
          subtitle={i.category}
          actions={<>
            {connected ? <>
              <Button variant="outline" onClick={() => { toast.success("Sync started"); }}><RefreshCw className="h-4 w-4" />Run sync</Button>
              <Button variant="outline" onClick={() => setDisconnectOpen(true)}><Unplug className="h-4 w-4" />Disconnect</Button>
            </> : <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => nav({ to: "/integrations/google-workspace" })}><Plug className="h-4 w-4" />Connect</Button>}
          </>}
        />
        <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Disconnect {i.name}?</DialogTitle><DialogDescription>This will remove the integration and stop data sync. You can reconnect later.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisconnectOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setDisconnectOpen(false); toast.success("Disconnected"); }}>Disconnect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="border-border lg:col-span-2"><CardContent className="p-6 space-y-5">
            <div><h3 className="font-semibold mb-2">Capabilities</h3><div className="flex flex-wrap gap-2">{i.capabilities.map((c) => <span key={c} className="text-xs rounded-md bg-[var(--primary-ultra-soft)] text-[var(--primary-dark)] px-2.5 py-1">{c}</span>)}</div></div>
            {connected && <div className="grid grid-cols-2 gap-4 text-sm"><div><div className="text-xs text-muted-foreground uppercase">Connected workspace</div><div className="mt-0.5 font-medium">{i.workspace}</div></div><div><div className="text-xs text-muted-foreground uppercase">Last sync</div><div className="mt-0.5 font-medium">{i.lastSync}</div></div></div>}
          </CardContent></Card>
        </div>
      </>
    );
  },
});
