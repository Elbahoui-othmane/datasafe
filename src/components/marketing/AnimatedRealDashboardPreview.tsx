import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PreviewOverviewContent } from "./PreviewOverviewContent";
import { PreviewAssessmentContent } from "./PreviewAssessmentContent";
import { PreviewControlsContent } from "./PreviewControlsContent";
import { PreviewGapsContent } from "./PreviewGapsContent";
import { PreviewTasksContent } from "./PreviewTasksContent";
import { PreviewReportsContent } from "./PreviewReportsContent";
import { controls } from "@/data/active/controls";
import { gaps } from "@/data/active/gaps";
import { reports } from "@/data/active/reports";
import { tasks } from "@/data/active/tasks";
import { cn } from "@/lib/utils";
import { Bell, ChevronRight, Search, Shield } from "lucide-react";

type ScreenId = "overview" | "assessment" | "controls" | "gaps" | "tasks" | "reports";
type NavId = "overview" | "reports" | "assessments" | "controls" | "gaps" | "tasks";
type TargetId =
  | "nav-overview"
  | "nav-reports"
  | "nav-assessments"
  | "nav-controls"
  | "nav-gaps"
  | "iso-card"
  | "answer-partial"
  | "evidence-missing"
  | "assessment-result"
  | "control-row"
  | "gap-row"
  | "task-card"
  | "report-row"
  | "overview-summary";

interface WorkflowStep {
  id: string;
  title: string;
  caption: string;
  from: ScreenId;
  to: ScreenId;
  target: TargetId;
  resultTarget?: TargetId;
  click: boolean;
  zoom: number;
}

const navItems: { id: NavId; label: string; group: string }[] = [
  { id: "overview", label: "Overview", group: "Overview" },
  { id: "reports", label: "Reports", group: "Overview" },
  { id: "assessments", label: "Assessments", group: "Compliance" },
  { id: "controls", label: "Controls", group: "Compliance" },
  { id: "gaps", label: "Gaps", group: "Risk" },
  { id: "tasks", label: "Tasks", group: "Risk" },
];

const navGroups = [
  { label: "Overview", ids: ["overview", "reports"] as NavId[] },
  { label: "Compliance", ids: ["assessments", "controls"] as NavId[] },
  { label: "Risk", ids: ["gaps", "tasks"] as NavId[] },
];

const timings = {
  screen: 900,
  move: 600,
  pause: 250,
  click: 350,
  pressed: 450,
  transition: 450,
  result: 1000,
};

const MOVE_START = timings.screen;
const MOVE_END = MOVE_START + timings.move;
const CLICK_START = MOVE_END + timings.pause;
const CLICK_END = CLICK_START + timings.click;
const PRESS_END = CLICK_END + timings.pressed;
const TRANSITION_END = PRESS_END + timings.transition;
const RESULT_START = TRANSITION_END;
const STEP_MS = RESULT_START + timings.result;

const targetPositions: Record<TargetId, { x: number; y: number; ring: { x: number; y: number; w: number; h: number } }> = {
  "nav-overview": { x: 11, y: 22, ring: { x: 2, y: 19.5, w: 18, h: 4.5 } },
  "nav-reports": { x: 11, y: 27, ring: { x: 2, y: 24.5, w: 18, h: 4.5 } },
  "nav-assessments": { x: 11, y: 40, ring: { x: 2, y: 37.5, w: 18, h: 4.5 } },
  "nav-controls": { x: 11, y: 45, ring: { x: 2, y: 42.5, w: 18, h: 4.5 } },
  "nav-gaps": { x: 11, y: 52, ring: { x: 2, y: 49.5, w: 18, h: 4.5 } },
  "iso-card": { x: 40, y: 52, ring: { x: 23, y: 42, w: 35, h: 21 } },
  "answer-partial": { x: 44, y: 55, ring: { x: 25, y: 42, w: 34, h: 19 } },
  "evidence-missing": { x: 68, y: 55, ring: { x: 60, y: 43, w: 18, h: 24 } },
  "assessment-result": { x: 51, y: 80, ring: { x: 25, y: 76, w: 53, h: 9 } },
  "control-row": { x: 86, y: 40, ring: { x: 23, y: 33, w: 74, h: 11 } },
  "gap-row": { x: 53, y: 47, ring: { x: 27, y: 42, w: 52, h: 14 } },
  "task-card": { x: 36, y: 44, ring: { x: 24, y: 31, w: 25, h: 20 } },
  "report-row": { x: 82, y: 28, ring: { x: 24, y: 18, w: 68, h: 13 } },
  "overview-summary": { x: 31, y: 24, ring: { x: 23, y: 10, w: 25, h: 23 } },
};

function buildSteps(): WorkflowStep[] {
  return [
    {
      id: "overview-readiness",
      title: "Overview readiness",
      caption: "Averonix starts from the real dashboard and highlights ISO 27001 readiness.",
      from: "overview",
      to: "overview",
      target: "iso-card",
      click: false,
      zoom: 1.04,
    },
    {
      id: "open-assessment",
      title: "Open assessment",
      caption: "The cursor clicks Assessments before the ISO assessment screen appears.",
      from: "overview",
      to: "assessment",
      target: "nav-assessments",
      resultTarget: "answer-partial",
      click: true,
      zoom: 1.03,
    },
    {
      id: "answer-partial",
      title: "Answer a control",
      caption: "A partially implemented response updates the live assessment control.",
      from: "assessment",
      to: "assessment",
      target: "answer-partial",
      click: true,
      zoom: 1.08,
    },
    {
      id: "evidence-missing",
      title: "Mark evidence missing",
      caption: "Missing evidence lowers the score and generates an issue preview.",
      from: "assessment",
      to: "assessment",
      target: "evidence-missing",
      resultTarget: "assessment-result",
      click: true,
      zoom: 1.08,
    },
    {
      id: "open-controls",
      title: "Generated control",
      caption: "The assessment answer becomes a real control row with score and evidence status.",
      from: "assessment",
      to: "controls",
      target: "nav-controls",
      resultTarget: "control-row",
      click: true,
      zoom: 1.05,
    },
    {
      id: "open-gaps",
      title: "Evidence gap",
      caption: "A weak control produces a linked evidence gap in the gap center.",
      from: "controls",
      to: "gaps",
      target: "nav-gaps",
      resultTarget: "gap-row",
      click: true,
      zoom: 1.05,
    },
    {
      id: "open-task",
      title: "Remediation task",
      caption: "Clicking the gap leads to the remediation task that makes the issue actionable.",
      from: "gaps",
      to: "tasks",
      target: "gap-row",
      resultTarget: "task-card",
      click: true,
      zoom: 1.06,
    },
    {
      id: "open-reports",
      title: "Readiness report",
      caption: "Reports summarize domain scores, completed controls, gaps, risks, and tasks.",
      from: "tasks",
      to: "reports",
      target: "nav-reports",
      resultTarget: "report-row",
      click: true,
      zoom: 1.05,
    },
    {
      id: "back-overview",
      title: "Return to overview",
      caption: "The workflow loops back to the dashboard summary with the latest readiness signal.",
      from: "reports",
      to: "overview",
      target: "nav-overview",
      resultTarget: "overview-summary",
      click: true,
      zoom: 1.03,
    },
  ];
}

export function AnimatedRealDashboardPreview() {
  const steps = useMemo(buildSteps, []);
  const featuredControl = useMemo(
    () =>
      controls.find((control) => control.frameworkId === "iso-27001" && (control.linkedGaps?.length ?? 0) > 0) ??
      controls.find((control) => control.frameworkId === "iso-27001") ??
      controls[0],
    [],
  );
  const featuredGap = useMemo(
    () =>
      gaps.find((gap) => gap.controlId === featuredControl?.id || gap.linkedControl === featuredControl?.id) ??
      gaps.find((gap) => gap.frameworkId === "iso-27001" && gap.status !== "Closed") ??
      gaps.find((gap) => gap.status !== "Closed") ??
      gaps[0],
    [featuredControl?.id],
  );
  const featuredTask = useMemo(
    () =>
      tasks.find((task) => task.linkedGapId === featuredGap?.id || task.relatedGap === featuredGap?.id) ??
      tasks.find((task) => task.frameworkId === "iso-27001" && task.status !== "Closed") ??
      tasks[0],
    [featuredGap?.id],
  );
  const featuredReport = useMemo(
    () => reports.find((report) => report.name.toLowerCase().includes("iso 27001")) ?? reports[0],
    [],
  );
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsedInStep, setElapsedInStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const tick = () => {
      if (!mountedRef.current || paused) return;
      const elapsed = Date.now() - startRef.current;
      const totalMs = steps.length * STEP_MS;
      const ms = elapsed % totalMs;
      setStepIdx(Math.floor(ms / STEP_MS));
      setElapsedInStep(ms % STEP_MS);
    };
    tick();
    const id = window.setInterval(tick, 50);
    return () => {
      mountedRef.current = false;
      window.clearInterval(id);
    };
  }, [paused, steps.length]);

  const jumpToStep = useCallback((i: number) => {
    startRef.current = Date.now() - i * STEP_MS;
    setStepIdx(i);
    setElapsedInStep(0);
  }, []);

  const step = steps[stepIdx];
  const previousStep = steps[(stepIdx - 1 + steps.length) % steps.length];
  const target = targetPositions[step.target];
  const previousTarget = targetPositions[previousStep.target];
  const moveT = clamp((elapsedInStep - MOVE_START) / timings.move);
  const cursorX = previousTarget.x + (target.x - previousTarget.x) * easeInOut(moveT);
  const cursorY = previousTarget.y + (target.y - previousTarget.y) * easeInOut(moveT);
  const clickActive = step.click && elapsedInStep >= CLICK_START && elapsedInStep < CLICK_END;
  const pressActive = step.click && elapsedInStep >= CLICK_START && elapsedInStep < PRESS_END;
  const hasTransitioned = step.from === step.to || elapsedInStep >= PRESS_END;
  const currentScreen = hasTransitioned ? step.to : step.from;
  const transitionT = step.from === step.to ? 1 : clamp((elapsedInStep - PRESS_END) / timings.transition);
  const contentOpacity = step.from === step.to || elapsedInStep < PRESS_END ? 1 : transitionT;
  const resultVisible = step.click ? elapsedInStep >= RESULT_START : elapsedInStep >= MOVE_END + timings.pause;
  const resultT = resultVisible ? clamp((elapsedInStep - RESULT_START) / 400) : 0;
  const scale = 1 + (step.zoom - 1) * easeInOut(resultT);
  const pressedTarget = pressActive ? step.target : null;
  const navPressed = pressedTarget?.startsWith("nav-") ? (pressedTarget.replace("nav-", "") as NavId) : null;
  const ringVisible = resultVisible || pressActive;
  const ringOpacity = pressActive ? 0.9 : resultVisible ? 0.8 : 0;
  const activeRingTarget = pressActive ? target : targetPositions[step.resultTarget ?? step.target];

  const answerSelected = stepIdx > 2 || (step.id === "answer-partial" && elapsedInStep >= CLICK_END);
  const evidenceSelected = stepIdx > 3 || (step.id === "evidence-missing" && elapsedInStep >= CLICK_END);
  const issueGenerated = stepIdx > 3 || (step.id === "evidence-missing" && resultVisible);

  return (
    <div className="w-full select-none">
      <div className="relative mx-auto max-w-[560px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
            <span className="ml-3 font-mono text-[10px] text-muted-foreground">averonix.app</span>
          </div>

          <div className="relative overflow-hidden" style={{ height: 360 }}>
            <div className="flex h-full">
              <PreviewSidebar activeNav={screenToNav(currentScreen)} pressedNav={navPressed} />

              <div className="flex min-w-0 flex-1 flex-col">
                <PreviewTopbar screen={currentScreen} />

                <div
                  className="flex-1 overflow-hidden transition-opacity duration-300 ease-out"
                  style={{
                    opacity: contentOpacity,
                    transform: `scale(${Math.min(scale, 1.16)})`,
                    transformOrigin: "center top",
                  }}
                >
                  {renderScreen(currentScreen, {
                    stepId: step.id,
                    resultVisible,
                    pressedTarget,
                    answerSelected,
                    evidenceSelected,
                    issueGenerated,
                    featuredControlId: featuredControl?.id,
                    featuredGapId: featuredGap?.id,
                    featuredTaskId: featuredTask?.id,
                    featuredReportId: featuredReport?.id,
                  })}
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute z-30 transition-none"
              style={{ left: `${cursorX}%`, top: `${cursorY}%` }}
            >
              {clickActive && (
                <span className="absolute -left-[7px] -top-[7px] h-5 w-5 rounded-full border border-[var(--primary)] bg-[var(--primary)]/25 animate-ping" />
              )}
              <svg width="16" height="22" viewBox="0 0 16 22" fill="none" className="-translate-x-0.5 -translate-y-0.5 drop-shadow-md">
                <path d="M2 2L2 18L5.5 13.5L9.5 20L11 19L7 12L13.5 12L2 2Z" fill="#C560CC" opacity={0.9} />
              </svg>
            </div>

            {ringVisible && (
              <div
                className="pointer-events-none absolute z-20 transition-all duration-300 ease-out"
                style={{
                  left: `${activeRingTarget.ring.x}%`,
                  top: `${activeRingTarget.ring.y}%`,
                  width: `${activeRingTarget.ring.w}%`,
                  height: `${activeRingTarget.ring.h}%`,
                  boxShadow: "0 0 0 2px rgba(197,96,204,0.85), 0 0 18px rgba(197,96,204,0.22)",
                  borderRadius: 10,
                  opacity: ringOpacity,
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="text-center">
            <span className="text-[11px] font-medium text-muted-foreground">
              Step {stepIdx + 1} of {steps.length}
            </span>
            <span className="ml-2 text-[11px] font-semibold text-foreground">{step.title}</span>
          </div>
          <p className="mx-auto max-w-md text-center text-[11px] leading-snug text-muted-foreground">
            {step.caption}
          </p>

          <div className="flex items-center justify-center gap-2 pt-1">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jumpToStep(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === stepIdx ? "w-5 bg-[var(--primary)]" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                aria-label={`Step ${i + 1}`}
              />
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              className="ml-2 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="0,0 10,5 0,10" /></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="0" width="3" height="10" /><rect x="6" y="0" width="3" height="10" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderScreen(
  screen: ScreenId,
  state: {
    stepId: string;
    resultVisible: boolean;
    pressedTarget: TargetId | null;
    answerSelected: boolean;
    evidenceSelected: boolean;
    issueGenerated: boolean;
    featuredControlId?: string;
    featuredGapId?: string;
    featuredTaskId?: string;
    featuredReportId?: string;
  },
) {
  switch (screen) {
    case "overview":
      return (
        <PreviewOverviewContent
          highlightIso={state.stepId === "overview-readiness" && state.resultVisible}
          pressIso={state.pressedTarget === "iso-card"}
          highlightSummary={state.stepId === "back-overview" && state.resultVisible}
        />
      );
    case "assessment":
      return (
        <PreviewAssessmentContent
          answerSelected={state.answerSelected}
          evidenceSelected={state.evidenceSelected}
          issueGenerated={state.issueGenerated}
          pressedTarget={
            state.pressedTarget === "answer-partial" || state.pressedTarget === "evidence-missing"
              ? state.pressedTarget
              : null
          }
        />
      );
    case "controls":
      return (
        <PreviewControlsContent
          highlightedControlId={state.featuredControlId}
          pressed={state.pressedTarget === "nav-controls"}
        />
      );
    case "gaps":
      return (
        <PreviewGapsContent
          highlightedGapId={state.featuredGapId}
          pressed={state.pressedTarget === "gap-row"}
        />
      );
    case "tasks":
      return (
        <PreviewTasksContent
          highlightedTaskId={state.featuredTaskId}
          pressed={false}
        />
      );
    case "reports":
      return (
        <PreviewReportsContent
          highlightedReportId={state.featuredReportId}
          pressed={state.pressedTarget === "nav-reports"}
        />
      );
  }
}

function PreviewSidebar({ activeNav, pressedNav }: { activeNav: NavId; pressedNav: NavId | null }) {
  return (
    <div className="flex w-[22%] shrink-0 flex-col bg-[#0E0818] text-[var(--sidebar-foreground)]">
      <div className="flex items-center gap-1.5 border-b border-[#221636] px-2.5 py-2.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--primary)] text-white">
          <Shield className="h-2.5 w-2.5" />
        </div>
        <span className="text-[9px] font-semibold leading-tight text-white">Averonix</span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden px-1.5 py-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-0.5 px-2 text-[7px] font-semibold uppercase tracking-wider text-[#7A6E8A]">
              {group.label}
            </div>
            {group.ids.map((id) => {
              const item = navItems.find((navItem) => navItem.id === id)!;
              const active = activeNav === id;
              const pressed = pressedNav === id;
              return (
                <div
                  key={id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[9px] transition-all",
                    active && "bg-[var(--primary)] text-white",
                    !active && pressed && "scale-[0.985] bg-[var(--primary)]/30 text-white ring-1 ring-[var(--primary)]/40",
                    !active && !pressed && "text-[#C9BCD6]",
                  )}
                >
                  {active ? <ChevronRight className="h-2 w-2" /> : <span className="w-2" />}
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTopbar({ screen }: { screen: ScreenId }) {
  const title =
    screen === "assessment"
      ? "ISO 27001 Assessment"
      : screen.charAt(0).toUpperCase() + screen.slice(1);

  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-1.5">
      <div className="min-w-[88px] text-[10px] font-semibold text-foreground">{title}</div>
      <div className="flex max-w-[150px] flex-1 items-center gap-1.5 rounded-md bg-muted px-2 py-1">
        <Search className="h-2.5 w-2.5 text-muted-foreground" />
        <span className="text-[8px] text-muted-foreground">Search...</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Bell className="h-3 w-3 text-muted-foreground" />
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary-soft)]">
          <span className="text-[6px] font-semibold text-[var(--primary-dark)]">A</span>
        </div>
      </div>
    </div>
  );
}

function screenToNav(screen: ScreenId): NavId {
  if (screen === "assessment") return "assessments";
  return screen;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
