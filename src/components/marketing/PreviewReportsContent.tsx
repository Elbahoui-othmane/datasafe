import { StatusBadge, statusVariant } from "@/components/averonix/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { reports, isoReadinessReport } from "@/data/active/reports";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";

interface PreviewReportsContentProps {
  highlightedReportId?: string;
  pressed?: boolean;
}

export function PreviewReportsContent({ highlightedReportId = "rep-iso", pressed }: PreviewReportsContentProps) {
  const isoReport =
    reports.find((report) => report.id === highlightedReportId) ??
    reports.find((report) => report.name.toLowerCase().includes("iso 27001")) ??
    reports[0];
  const shownReports = [
    ...(isoReport ? [isoReport] : []),
    ...reports.filter((report) => report.id !== isoReport?.id),
  ].slice(0, 3);

  return (
    <div className="space-y-3 p-3" data-preview="reports">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Report library</h3>
        <span className="text-[10px] text-muted-foreground">{reports.length} reports</span>
      </div>

      <div className="space-y-2">
        {shownReports.map((report) => {
          const highlighted = report.id === highlightedReportId || report.id === isoReport?.id;
          return (
            <Card
              key={report.id}
              className={cn(
                "border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)] transition-all",
                highlighted && "border-[var(--primary)] bg-[var(--primary-ultra-soft)]/45 ring-1 ring-[var(--primary)]/45",
                highlighted && pressed && "scale-[0.985]",
              )}
            >
              <CardContent className="flex items-center gap-2.5 p-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium">{report.name}</div>
                  <div className="text-[9px] text-muted-foreground">{report.type} - {report.generated}</div>
                </div>
                <StatusBadge variant={statusVariant(report.status)} className="px-1.5 py-0 text-[8px]">
                  {report.status}
                </StatusBadge>
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card
        className={cn(
          "border-border bg-[var(--primary-ultra-soft)]/30 shadow-[0_1px_2px_rgba(15,7,30,0.04)] transition-all",
          highlightedReportId === "rep-iso" && "ring-1 ring-[var(--primary)]/35",
        )}
      >
        <CardContent className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">ISO 27001 Readiness</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Overall readiness</span>
            <span className="text-sm font-semibold text-[var(--primary)]">{isoReadinessReport.readiness}%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Controls</span>
            <span className="tabular-nums">{isoReadinessReport.controlsCompleted}/{isoReadinessReport.controlsTotal}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Open gaps</span>
            <span className="tabular-nums">{isoReadinessReport.openGaps}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
