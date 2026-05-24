import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedRealDashboardPreview } from "@/components/marketing/AnimatedRealDashboardPreview";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/preview-website")({
  head: () => ({ meta: [{ title: "Preview Website · Averonix" }] }),
  component: PreviewWebsitePage,
});

function PreviewWebsitePage() {
  return (
    <div className="min-h-screen bg-[#FCFBFE] flex flex-col">
      <section className="relative flex-1 overflow-hidden px-6 py-12 lg:px-20">
        <div className="absolute inset-0 bg-[#FCFBFE]" />
        <div className="absolute inset-0 [background:radial-gradient(circle_at_78%_26%,rgba(197,96,204,0.14),transparent_30%),radial-gradient(circle_at_10%_76%,rgba(197,96,204,0.08),transparent_32%)]" />
        <div className="absolute right-[7%] top-[14%] h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute left-[2%] bottom-[10%] h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            to="/overview"
            className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1 text-xs font-medium text-[var(--primary-dark)]">
                Compliance readiness platform
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] lg:text-5xl leading-tight">
                Build your compliance command center with Averonix.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] max-w-md">
                Track ISO 27001 readiness, controls, evidence gaps, risks, tasks, and reports from one clean workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/request-demo">
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white h-11 px-6">
                    Request demo <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/overview">
                  <Button variant="outline" className="h-11 px-6">
                    <Monitor className="h-4 w-4" /> View dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <AnimatedRealDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
        This page is a temporary website preview. The animation can later be moved to the public landing page.
      </div>
    </div>
  );
}
