import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus } from "lucide-react";

export const Route = createFileRoute("/vendors/reviews")({
  head: () => ({ meta: [{ title: "Security Reviews · Averonix" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const nav = useNavigate();
  return (
    <>
      <PageHeader
        title="Security reviews"
        subtitle="Review vendor security posture and questionnaire responses."
        breadcrumbs={[{ label: "Vendors", to: "/vendors" }, { label: "Reviews" }]}
        actions={
          <Button
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            onClick={() => nav({ to: "/vendors/all" })}
          >
            <Plus className="h-4 w-4" />Create review
          </Button>
        }
      />
      <div className="p-8">
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
              <ShieldCheck className="h-8 w-8 text-[var(--primary-dark)]" />
            </div>
            <h2 className="text-xl font-semibold">No security reviews yet</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Security reviews will appear after vendors are added and classified. Add vendors first to start evaluating their security posture.
            </p>
            <Button
              className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
              onClick={() => nav({ to: "/vendors/all" })}
            >
              <Plus className="h-4 w-4 mr-1" />Add vendors first
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
