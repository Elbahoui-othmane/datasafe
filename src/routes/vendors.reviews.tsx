import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { isAssessmentMode } from "@/config/dataSource";
import { ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vendors/reviews")({
  head: () => ({ meta: [{ title: "Security Reviews · Averonix" }] }),
  component: ReviewsPage,
});

function EmptyState() {
  const nav = useNavigate();
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
          <ShieldCheck className="h-8 w-8 text-[var(--primary-dark)]" />
        </div>
        <h2 className="text-xl font-semibold">No security reviews yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Security reviews will appear after vendors are added or classified.
        </p>
        <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => nav({ to: "/vendors/all" })}>
          <Plus className="h-4 w-4 mr-1" />Create review
        </Button>
      </CardContent>
    </Card>
  );
}

function ReviewsPage() {
  return (
    <>
      <PageHeader title="Security reviews" subtitle="Review vendor security posture"
        breadcrumbs={[{ label: "Vendors", to: "/vendors" }, { label: "Reviews" }]}
      />
      <div className="p-8">
        {isAssessmentMode() ? <EmptyState /> : null}
      </div>
    </>
  );
}
