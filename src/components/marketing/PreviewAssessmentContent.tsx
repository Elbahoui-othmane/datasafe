import { ProgressBar } from "@/components/averonix/ProgressBar";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { controls } from "@/data/active/controls";
import { isoReadinessReport } from "@/data/active/reports";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, FileText, Layers, Target } from "lucide-react";

type PressTarget = "answer-partial" | "evidence-missing" | null;

interface PreviewAssessmentContentProps {
  answerSelected?: boolean;
  evidenceSelected?: boolean;
  issueGenerated?: boolean;
  pressedTarget?: PressTarget;
}

const answerOptions = [
  { value: "implemented", label: "Implemented", score: "100" },
  { value: "mostly", label: "Mostly implemented", score: "75" },
  { value: "partial", label: "Partially implemented", score: "50" },
  { value: "planned", label: "Planned", score: "25" },
];

const evidenceOptions = ["Missing", "Partial", "Uploaded", "Verified"];

export function PreviewAssessmentContent({
  answerSelected = false,
  evidenceSelected = false,
  issueGenerated = false,
  pressedTarget,
}: PreviewAssessmentContentProps) {
  const featuredControl =
    controls.find((control) => control.frameworkId === "iso-27001" && (control.linkedGaps?.length ?? 0) > 0) ??
    controls.find((control) => control.frameworkId === "iso-27001") ??
    controls[0];
  const expectedEvidence =
    featuredControl?.expectedEvidence?.slice(0, 3) ??
    featuredControl?.evidenceRequirements?.map((item) => item.name).slice(0, 3) ??
    [];
  const liveScore = answerSelected ? (evidenceSelected ? 35 : 50) : featuredControl?.score ?? 0;
  const liveStatus = liveScore >= 85 ? "OK" : liveScore >= 60 ? "Needs attention" : liveScore >= 35 ? "In progress" : "Failed";

  return (
    <div className="space-y-2.5 p-3" data-preview="assessment">
      <div className="grid grid-cols-4 gap-2">
        <MiniMetric icon={Layers} label="Controls" value={isoReadinessReport.controlsTotal.toString()} />
        <MiniMetric icon={CheckCircle2} label="OK" value={isoReadinessReport.controlsCompleted.toString()} />
        <MiniMetric icon={Target} label="Gaps" value={isoReadinessReport.openGaps.toString()} />
        <MiniMetric icon={AlertTriangle} label="Risks" value={isoReadinessReport.criticalRisks.toString()} />
      </div>

      <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Selected sector</div>
              <div className="mt-1 rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-medium">SaaS</div>
            </div>
            <div className="min-w-[160px] flex-1">
              <div className="mb-1 flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">Assessment progress</span>
                <span className="font-semibold">1/{Math.max(1, controls.length)}</span>
              </div>
              <ProgressBar value={Math.max(8, Math.round((1 / Math.max(1, controls.length)) * 100))} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground">
                  {featuredControl?.controlCode ?? featuredControl?.id ?? "ISO-CTRL"}
                </span>
                <StatusBadge variant={severityVariant(featuredControl?.risk ?? featuredControl?.severity ?? "Medium")} className="px-1.5 py-0 text-[8px]">
                  {featuredControl?.risk ?? featuredControl?.severity ?? "Medium"}
                </StatusBadge>
              </div>
              <h3 className="mt-1 truncate text-xs font-semibold">{featuredControl?.name ?? "Assessment control"}</h3>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                {featuredControl?.question ?? featuredControl?.description ?? "Answer the control question and attach supporting evidence."}
              </p>
            </div>
            <StatusBadge variant={statusVariant(liveStatus)} className="shrink-0 px-1.5 py-0 text-[8px]">
              {liveStatus}
            </StatusBadge>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_0.72fr] gap-3">
            <div>
              <div className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Answer</div>
              <div className="grid grid-cols-2 gap-1.5">
                {answerOptions.map((option) => {
                  const selected = answerSelected && option.value === "partial";
                  const pressed = pressedTarget === "answer-partial" && option.value === "partial";
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-border p-1.5 text-[9px] transition-all",
                        selected && "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)]",
                        pressed && "scale-[0.985] ring-2 ring-[var(--primary)]/35",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full border border-border",
                          selected && "border-[var(--primary)] bg-[var(--primary)]",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      <span className="text-[8px] text-muted-foreground">{option.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Evidence status</div>
              <div className="space-y-1">
                {evidenceOptions.map((option) => {
                  const selected = evidenceSelected && option === "Missing";
                  const pressed = pressedTarget === "evidence-missing" && option === "Missing";
                  return (
                    <div
                      key={option}
                      className={cn(
                        "rounded-md border border-border px-2 py-1 text-[9px] font-medium transition-all",
                        selected && "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)]",
                        pressed && "scale-[0.985] ring-2 ring-[var(--primary)]/35",
                      )}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {expectedEvidence.length > 0 && (
            <div className="mt-3 rounded-md border border-border bg-muted/35 p-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-2.5 w-2.5" />
                Expected evidence
              </div>
              <div className="space-y-1">
                {expectedEvidence.map((item) => (
                  <div key={item} className="truncate text-[9px] text-muted-foreground">{item}</div>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              "mt-3 flex items-center justify-between rounded-md bg-[var(--primary-ultra-soft)] p-2 text-[10px] transition-all",
              issueGenerated && "ring-2 ring-[var(--primary)]/45",
            )}
          >
            <span className="text-muted-foreground">{issueGenerated ? "Gap and task generated" : "Live control score"}</span>
            <span className="text-sm font-semibold text-[var(--primary)]">{liveScore}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
      <CardContent className="flex items-center gap-1.5 p-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Icon className="h-2.5 w-2.5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[7px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-xs font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
