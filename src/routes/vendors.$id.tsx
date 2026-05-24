import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/averonix/PageHeader";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent } from "@/components/ui/card";
import { isAssessmentMode, isMockMode } from "@/config/dataSource";
import { vendors as mockVendors, securityReviews } from "@/mocks/data";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/vendors/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Vendor · Averonix` }] }),
  component: () => {
    const { id } = Route.useParams();
    const v = isMockMode() ? mockVendors.find((x) => x.id === id) : undefined;

    if (isAssessmentMode()) {
      return (
        <>
          <PageHeader title="Vendor" subtitle="Vendor detail" />
          <div className="p-8">
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
                  <Building2 className="h-8 w-8 text-[var(--primary-dark)]" />
                </div>
                <h2 className="text-xl font-semibold">Vendor not available</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Vendor data is not available in assessment mode.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    if (!v) return <NotFoundState label="Vendor not found" backTo="/vendors" backLabel="Back to vendors" />;
    return null;
  },
});
