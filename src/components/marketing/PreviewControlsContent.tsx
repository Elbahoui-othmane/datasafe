import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { controls } from "@/data/active/controls";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface PreviewControlsContentProps {
  highlightedControlId?: string;
  pressed?: boolean;
}

export function PreviewControlsContent({ highlightedControlId, pressed }: PreviewControlsContentProps) {
  const featuredControl =
    controls.find((control) => control.id === highlightedControlId) ??
    controls.find((control) => control.frameworkId === "iso-27001" && (control.linkedGaps?.length ?? 0) > 0) ??
    controls.find((control) => control.frameworkId === "iso-27001") ??
    controls[0];
  const rows = [
    ...(featuredControl ? [featuredControl] : []),
    ...controls.filter((control) => control.id !== featuredControl?.id),
  ].slice(0, 5);

  return (
    <div className="space-y-2 p-3" data-preview="controls">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Controls</h3>
        <span className="text-[10px] text-muted-foreground tabular-nums">{controls.length} total</span>
      </div>
      <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
        <div className="max-h-[240px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-[var(--primary-ultra-soft)] text-[9px] uppercase tracking-wide text-muted-foreground sticky top-0 z-10">
              <tr>
                <Th>ID</Th><Th>Control</Th><Th>Domain</Th><Th>Score</Th><Th>Evidence</Th><Th>Status</Th><Th>Risk</Th><Th><span className="sr-only">Details</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const highlighted = c.id === highlightedControlId;
                return (
                <tr
                  key={c.id}
                  className={cn(
                    "border-t border-border transition-all hover:bg-[var(--primary-ultra-soft)]",
                    highlighted && "bg-[var(--primary-ultra-soft)] ring-1 ring-inset ring-[var(--primary)]/45",
                    highlighted && pressed && "scale-[0.995]",
                  )}
                >
                  <td className="px-2 py-2 font-mono text-[10px] text-muted-foreground">{c.id}</td>
                  <td className="px-2 py-2 font-medium max-w-[140px] truncate text-[11px]">{c.name}</td>
                  <td className="px-2 py-2 max-w-[90px] truncate text-[10px] text-muted-foreground">{c.domainName ?? "General"}</td>
                  <td className="px-2 py-2 tabular-nums text-[10px] text-muted-foreground">{c.score ?? Math.round((c.testsDone / c.testsTotal) * 100)}%</td>
                  <td className="px-2 py-2"><StatusBadge variant={statusVariant(c.evidence)} className="text-[8px] px-1.5 py-0">{c.evidence}</StatusBadge></td>
                  <td className="px-2 py-2"><StatusBadge variant={statusVariant(c.status)} className="text-[8px] px-1.5 py-0">{c.status}</StatusBadge></td>
                  <td className="px-2 py-2"><StatusBadge variant={severityVariant(c.risk)} className="text-[8px] px-1.5 py-0">{c.risk}</StatusBadge></td>
                  <td className="px-2 py-2"><ChevronRight className="h-3 w-3 text-muted-foreground" /></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1.5 text-left font-medium">{children}</th>;
}
