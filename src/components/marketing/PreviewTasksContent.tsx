import { StatusBadge, severityVariant } from "@/components/averonix/StatusBadge";
import { ProgressBar } from "@/components/averonix/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { tasks } from "@/data/active/tasks";
import { cn } from "@/lib/utils";
import { CheckSquare } from "lucide-react";

interface PreviewTasksContentProps {
  highlightedTaskId?: string;
  pressed?: boolean;
}

export function PreviewTasksContent({ highlightedTaskId, pressed }: PreviewTasksContentProps) {
  const featuredTask =
    tasks.find((task) => task.id === highlightedTaskId) ??
    tasks.find((task) => task.frameworkId === "iso-27001" && (task.linkedGapId || task.linkedRiskId)) ??
    tasks[0];
  const prioritize = (list: typeof tasks) => [
    ...(featuredTask && list.some((task) => task.id === featuredTask.id) ? [featuredTask] : []),
    ...list.filter((task) => task.id !== featuredTask?.id),
  ];
  const open = prioritize(tasks.filter((t) => t.status === "Open" || t.status === "Blocked" || t.status === "Awaiting evidence"));
  const inProgress = prioritize(tasks.filter((t) => t.status === "In progress"));
  const closed = prioritize(tasks.filter((t) => t.status === "Closed"));

  return (
    <div className="space-y-2 p-3" data-preview="tasks">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Remediation tasks</h3>
        <span className="text-[10px] text-muted-foreground tabular-nums">{tasks.length} total</span>
      </div>

      <Card className="border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]">
        <CardContent className="p-2.5">
          <div className="grid grid-cols-3 gap-2">
            <KanbanColumn title="Open" count={open.length} color="text-muted-foreground">
              {open.slice(0, 2).map((t) => (
                <KanbanCard key={t.id} task={t} highlighted={t.id === highlightedTaskId} pressed={pressed && t.id === highlightedTaskId} />
              ))}
            </KanbanColumn>
            <KanbanColumn title="In progress" count={inProgress.length} color="text-[var(--primary)]">
              {inProgress.slice(0, 2).map((t) => (
                <KanbanCard key={t.id} task={t} highlighted={t.id === highlightedTaskId} pressed={pressed && t.id === highlightedTaskId} />
              ))}
            </KanbanColumn>
            <KanbanColumn title="Closed" count={closed.length} color="text-[var(--success)]">
              {closed.slice(0, 2).map((t) => (
                <KanbanCard key={t.id} task={t} highlighted={t.id === highlightedTaskId} pressed={pressed && t.id === highlightedTaskId} />
              ))}
            </KanbanColumn>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[var(--primary-ultra-soft)]/40 border border-border p-1.5 min-h-0">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className={`text-[9px] font-semibold uppercase tracking-wide ${color}`}>{title}</span>
        <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KanbanCard({ task, highlighted, pressed }: { task: any; highlighted?: boolean; pressed?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md bg-card border border-border p-1.5 transition-all",
        highlighted && "border-[var(--primary)] bg-[var(--primary-ultra-soft)]/55 ring-1 ring-[var(--primary)]/45",
        pressed && "scale-[0.985]",
      )}
    >
      <div className="flex items-start gap-1">
        <CheckSquare className="h-2.5 w-2.5 text-muted-foreground mt-0.5 shrink-0" />
        <span className="text-[9px] font-medium leading-snug truncate">{task.title}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <StatusBadge variant={severityVariant(task.priority)} className="text-[7px] px-1 py-0">{task.priority}</StatusBadge>
        <ProgressBar value={task.progress} className="h-1 flex-1" />
        <span className="text-[7px] tabular-nums text-muted-foreground">{task.progress}%</span>
      </div>
    </div>
  );
}
