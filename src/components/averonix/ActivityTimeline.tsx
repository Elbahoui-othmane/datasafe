import { cn } from "@/lib/utils";

export function ActivityTimeline({ items }: { items: { id: string; text: string; time: string }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((a, i) => (
        <li key={a.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("h-2 w-2 rounded-full", i === 0 ? "bg-[var(--primary)]" : "bg-border")} />
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-3">
            <div className="text-sm text-foreground">{a.text}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
