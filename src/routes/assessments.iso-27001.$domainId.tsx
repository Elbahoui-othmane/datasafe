import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { StatusBadge, severityVariant, statusVariant } from "@/components/averonix/StatusBadge";
import { NotFoundState } from "@/components/averonix/NotFoundState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { assessmentDomains, defaultAssessmentSector } from "@/data/assessmentDomains";
import type { AssessmentAnswer, AssessmentResponse, EvidenceStatus } from "@/lib/assessment/types";
import { generateDashboardDataFromAssessment } from "@/lib/assessment/generators";
import {
  EVIDENCE_STATUS_OPTIONS,
  normalizeCompanySectors,
  transformDomainToControls,
} from "@/lib/assessment/transform";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ChevronDown, ChevronRight, FileWarning, ListTodo, HelpCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessments/iso-27001/$domainId")({
  head: ({ params }) => ({ meta: [{ title: `${params.domainId} Assessment - Averonix` }] }),
  component: IsoAssessmentDomainPage,
});

function IsoAssessmentDomainPage() {
  const { domainId } = Route.useParams();
  const nav = useNavigate();
  const domain = assessmentDomains.find((item) => item.domain.id === domainId);
  const [sector, setSector] = useState(defaultAssessmentSector);
  const [responses, setResponses] = useState<Record<string, Partial<AssessmentResponse>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const controls = useMemo(
    () => (domain ? transformDomainToControls(domain, sector, responses) : []),
    [domain, sector, responses],
  );
  const generated = useMemo(
    () => (domain ? generateDashboardDataFromAssessment(domain, sector, responses) : null),
    [domain, sector, responses],
  );

  if (!domain || !generated) {
    return <NotFoundState label="Assessment domain not found" backTo="/assessments/iso-27001" backLabel="Back to assessment" />;
  }

  const sectors = normalizeCompanySectors(domain);
  const answeredCount = Object.keys(responses).length;
  const averageScore = controls.length
    ? Math.round(controls.reduce((sum, control) => sum + (control.score ?? 0), 0) / controls.length)
    : 0;

  function updateAnswer(controlId: string, answer: AssessmentAnswer) {
    setResponses((current) => ({
      ...current,
      [controlId]: {
        ...current[controlId],
        answer,
        evidenceStatus: current[controlId]?.evidenceStatus ?? controls.find((control) => control.id === controlId)?.evidenceStatus ?? "missing",
      },
    }));
  }

  function updateEvidence(controlId: string, evidenceStatus: EvidenceStatus) {
    setResponses((current) => ({
      ...current,
      [controlId]: {
        ...current[controlId],
        answer: current[controlId]?.answer ?? controls.find((control) => control.id === controlId)?.answer ?? "not_implemented",
        evidenceStatus,
      },
    }));
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Assessments", to: "/assessments/iso-27001" },
          { label: domain.domain.shortName },
        ]}
        title={domain.domain.name}
        subtitle={domain.domain.description}
        badge={<StatusBadge variant={statusVariant("In progress")}>{averageScore}% live score</StatusBadge>}
        actions={
          <Button
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            onClick={() => nav({ to: "/assessments/iso-27001" })}
          >
            Finish assessment
          </Button>
        }
      />

      <div className="p-8 space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-5">
            <Card className="border-border sticky top-0 z-10">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 items-end">
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>Assessment progress</span>
                      <span className="font-semibold">{answeredCount}/{controls.length} answered</span>
                    </div>
                    <ProgressBar value={controls.length ? Math.round((answeredCount / controls.length) * 100) : 0} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {controls.map((control) => {
                const isExpanded = expanded[control.id] ?? (answeredCount === 0);
                return (
                  <Card key={control.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{control.controlCode}</span>
                            <StatusBadge variant={severityVariant(control.severity)}>{control.severity}</StatusBadge>
                          </div>
                          <h3 className="mt-1 font-semibold text-sm">{control.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{control.question}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge variant={statusVariant(control.status)}>{control.status}</StatusBadge>
                          <button onClick={() => toggleExpanded(control.id)} className="p-1 rounded hover:bg-muted">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Answer</div>
                              <RadioGroup
                                value={control.answer}
                                onValueChange={(value) => updateAnswer(control.id, value as AssessmentAnswer)}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                              >
                                {control.answerOptions.map((option) => (
                                  <Label key={option.value} htmlFor={`${control.id}-${option.value}`} className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm cursor-pointer hover:border-[var(--primary)]">
                                    <RadioGroupItem id={`${control.id}-${option.value}`} value={option.value} />
                                    <span className="flex-1">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.score ?? "N/A"}</span>
                                  </Label>
                                ))}
                              </RadioGroup>
                            </div>

                            <div>
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Evidence status</div>
                              <Select value={control.evidenceStatus} onValueChange={(value) => updateEvidence(control.id, value as EvidenceStatus)}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVIDENCE_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 rounded-md bg-[var(--primary-ultra-soft)] p-3 text-sm">
                            <span className="text-muted-foreground">Live control score</span>
                            <span className="text-lg font-semibold text-[var(--primary)]">{control.score === null ? "Excluded" : `${control.score}%`}</span>
                          </div>

                          {control.description && (
                            <CollapsibleDetail
                              id={`${control.id}-guidance`}
                              icon={<HelpCircle className="h-3.5 w-3.5" />}
                              label="Guidance"
                            >
                              <p className="text-sm text-muted-foreground">{control.description}</p>
                            </CollapsibleDetail>
                          )}

                          {control.evidenceRequirements.length > 0 && (
                            <CollapsibleDetail
                              id={`${control.id}-evidence`}
                              icon={<FileText className="h-3.5 w-3.5" />}
                              label="Expected evidence"
                              count={control.evidenceRequirements.length}
                            >
                              <ul className="space-y-2">
                                {control.evidenceRequirements.map((evidence) => (
                                  <li key={evidence.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5 text-sm">
                                    <span>{evidence.name}</span>
                                    <span className="text-[11px] text-muted-foreground">{evidence.type.replace(/_/g, " ")}</span>
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleDetail>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-4 h-fit">
            <PreviewCard icon={ClipboardCheck} label="Selected controls" value={generated.controls.length.toString()} />
            <PreviewCard icon={FileWarning} label="Generated gaps" value={generated.gaps.length.toString()} />
            <PreviewCard icon={AlertTriangle} label="Generated risks" value={generated.risks.length.toString()} />
            <PreviewCard icon={ListTodo} label="Generated tasks" value={generated.tasks.length.toString()} />

            <Card className="border-border">
              <CardHeader><CardTitle className="text-sm">Generated preview</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <PreviewList title="Gaps" items={generated.gaps.slice(0, 4).map((gap) => gap.title)} />
                <PreviewList title="Risks" items={generated.risks.slice(0, 4).map((risk) => risk.title)} />
                <PreviewList title="Tasks" items={generated.tasks.slice(0, 4).map((task) => task.title)} />
                <Button asChild variant="outline" className="w-full">
                  <Link to="/controls">View dashboard controls</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function PreviewCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CollapsibleDetail({ id, icon, label, count, children }: { id: string; icon: React.ReactNode; label: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium hover:bg-[var(--primary-ultra-soft)] rounded-md transition">
        <span className="flex items-center gap-2">
          <span className="text-[var(--primary-dark)]">{icon}</span>
          {label}
          {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
        </span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">{title}</div>
      {items.length ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="rounded-md border border-border p-2 text-xs">{item}</li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-border p-2 text-xs text-muted-foreground">No generated items</div>
      )}
    </div>
  );
}
