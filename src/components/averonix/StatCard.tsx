import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, accent, className,
}: {
  label: string; value: React.ReactNode; hint?: React.ReactNode;
  icon?: LucideIcon; accent?: boolean; className?: string;
}) {
  return (
    <Card className={cn("border-border shadow-[0_1px_2px_rgba(15,7,30,0.04)]", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
            <div className={cn("mt-2 text-3xl font-semibold tabular-nums", accent && "text-[var(--primary)]")}>{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          {Icon && (
            <div className="rounded-lg bg-[var(--primary-ultra-soft)] p-2 text-[var(--primary)]">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
