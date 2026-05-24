import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAssessmentMode } from "@/config/dataSource";
import { FlaskConical, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tests")({
  head: () => ({ meta: [{ title: "Tests · Averonix" }] }),
  component: TestsPage,
});

function EmptyState() {
  const nav = useNavigate();
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
          <FlaskConical className="h-8 w-8 text-[var(--primary-dark)]" />
        </div>
        <h2 className="text-xl font-semibold">No automated tests yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Connect integrations to run automated security tests across cloud, identity, and code.
        </p>
        <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => nav({ to: "/integrations" })}>
          <Plus className="h-4 w-4 mr-1" />Browse integrations
        </Button>
      </CardContent>
    </Card>
  );
}

function TestsPage() {
  return (
    <>
      <PageHeader title="Tests" subtitle="Automated checks across cloud, identity, and code." />
      <div className="p-8">
        {isAssessmentMode() ? <EmptyState /> : null}
      </div>
    </>
  );
}
