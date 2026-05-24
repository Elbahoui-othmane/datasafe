import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "soft" | "success" | "warning" | "danger" | "info" | "outline" | "muted";

const variants: Record<Variant, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-[var(--primary)] text-white",
  soft: "bg-[var(--primary-soft)] text-[var(--primary-dark)]",
  success: "bg-[#DCFCE7] text-[#15803D]",
  warning: "bg-[#FEF3C7] text-[#B45309]",
  danger: "bg-[#FEE2E2] text-[#B91C1C]",
  info: "bg-[#DBEAFE] text-[#1D4ED8]",
  outline: "border border-border text-foreground bg-transparent",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ children, variant = "default", className }: { children: React.ReactNode; variant?: Variant; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}

export function severityVariant(s: string): Variant {
  const v = s.toLowerCase();
  if (v.includes("critical")) return "danger";
  if (v.includes("high")) return "warning";
  if (v.includes("medium")) return "info";
  if (v.includes("low")) return "success";
  return "muted";
}

export function statusVariant(s: string): Variant {
  const v = s.toLowerCase();
  if (v === "ok" || v.includes("up to date") || v.includes("closed") || v.includes("completed") || v.includes("ready") || v.includes("verified") || v.includes("connected") || v.includes("signed")) return "success";
  if (v.includes("needs attention") || v.includes("awaiting") || v.includes("draft") || v.includes("partial") || v.includes("pending") || v.includes("monitoring") || v.includes("needs review") || v.includes("needs update")) return "warning";
  if (v.includes("overdue") || v.includes("blocked") || v.includes("missing") || v.includes("not assigned")) return "danger";
  if (v.includes("in progress") || v.includes("in treatment") || v.includes("in remediation") || v.includes("identified") || v.includes("open") || v.includes("available")) return "info";
  return "muted";
}
