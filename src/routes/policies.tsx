import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAssessmentMode } from "@/config/dataSource";
import { ScrollText, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/policies")({
  head: () => ({ meta: [{ title: "Policies · Averonix" }] }),
  component: PoliciesPage,
});

function EmptyState() {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
          <ScrollText className="h-8 w-8 text-[var(--primary-dark)]" />
        </div>
        <h2 className="text-xl font-semibold">No policies yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Policy management is not available yet. Add policies manually later.
        </p>
        <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => toast.success("Policy management is available in connected workspaces.")}>
          <Plus className="h-4 w-4 mr-1" />New policy
        </Button>
      </CardContent>
    </Card>
  );
}

function PoliciesPage() {
  return (
    <>
      <PageHeader title="Policies" subtitle="Manage and publish security policies." />
      <div className="p-8">
        {isAssessmentMode() ? <EmptyState /> : null}
      </div>
    </>
  );
}
