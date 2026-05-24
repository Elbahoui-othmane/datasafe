import { StatusBadge, severityVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { gaps } from "@/data/active/gaps";
import { cn } from "@/lib/utils";
import { AlertOctagon, FileWarning, Ban, CheckCircle2 } from "lucide-react";

interface PreviewGapsContentProps {
  highlightedGapId?: string;
  pressed?: boolean;
}

export function PreviewGapsContent({ highlightedGapId, pressed }: PreviewGapsContentProps) {
  const openGaps = gaps.filter((g) => g.status !== "Closed");
  const featuredGap =
    openGaps.find((gap) => gap.id === highlightedGapId) ??
    openGaps.find((gap) => gap.frameworkId === "iso-27001") ??
    openGaps[0];
  const shownGaps = [
    ...(featuredGap ? [featuredGap] : []),
    ...openGaps.filter((gap) => gap.id !== featuredGap?.id),
  ].slice(0, 4);
  const missingEvidence = gaps.filter((g) => g.status !== "Closed" && g.status !== "In remediation").length;
  const blockedGaps = gaps.filter((g) => g.status === "Blocked").length;
  const closedGaps = gaps.filter((g) => g.status === "Closed").length;

  return (
    <div className="space-y-2 p-3" data-preview="gaps">
      <div className="grid grid-cols-2 gap-2">
        <MiniStat icon={AlertOctagon} label="Open" value={openGaps.length.toString()} />
        <MiniStat icon={FileWarning} label="Missing ev." value={missingEvidence.toString()} />
        <MiniStat icon={Ban} label="Blocked" value={blockedGaps.toString()} />
        <MiniStat icon={CheckCircle2} label="Closed" value={closedGaps.toString()} />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent gaps</h3>
        <div className="space-y-1.5">
          {shownGaps.map((g) => {
            const highlighted = g.id === highlightedGapId;
            return (
            <Card
              key={g.id}
              className={cn(
                "border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)] transition-all",
                highlighted && "border-[var(--primary)] bg-[var(--primary-ultra-soft)]/45 ring-1 ring-[var(--primary)]/45",
                highlighted && pressed && "scale-[0.985]",
              )}
            >
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={severityVariant(g.severity)} className="text-[8px] px-1.5 py-0">{g.severity}</StatusBadge>
                  <span className="text-[11px] font-medium leading-snug truncate flex-1">{g.title}</span>
                  <span className="text-[9px] tabular-nums text-muted-foreground">{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} className="h-1 mt-1.5" />
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--primary-dark)]">
        <Icon className="h-3 w-3" />
      </span>
      <div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}
