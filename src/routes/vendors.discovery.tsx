import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAssessmentMode } from "@/config/dataSource";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors/discovery")({
  head: () => ({ meta: [{ title: "Discovery · Averonix" }] }),
  component: DiscoveryPage,
});

function EmptyState() {
  const nav = useNavigate();
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
          <Search className="h-8 w-8 text-[var(--primary-dark)]" />
        </div>
        <h2 className="text-xl font-semibold">No discovered vendors yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Connect integrations later to discover third-party tools automatically.
        </p>
        <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => nav({ to: "/integrations" })}>
          <Plus className="h-4 w-4 mr-1" />Run discovery
        </Button>
      </CardContent>
    </Card>
  );
}

function DiscoveryPage() {
  return (
    <>
      <PageHeader title="Discovery" subtitle="Automatically discover vendors and tools"
        breadcrumbs={[{ label: "Vendors", to: "/vendors" }, { label: "Discovery" }]}
      />
      <div className="p-8">
        {isAssessmentMode() ? <EmptyState /> : null}
      </div>
    </>
  );
}
