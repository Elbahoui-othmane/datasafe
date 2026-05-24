import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FlaskConical, FileText, Layers, ShieldCheck,
  ScrollText, Building2, AlertTriangle, GitPullRequestArrow, CheckSquare,
  Plug, Settings, ChevronDown, ShieldHalf, ClipboardCheck, Eye,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon: any; }
interface NavGroup { label: string; items: NavItem[]; }

const groups: NavGroup[] = [
  { label: "Overview", items: [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/tests", label: "Tests", icon: FlaskConical },
    { to: "/reports", label: "Reports", icon: FileText },
  ]},
  { label: "Compliance", items: [
    { to: "/frameworks", label: "Frameworks", icon: Layers },
    { to: "/assessments/iso-27001", label: "Assessments", icon: ClipboardCheck },
    { to: "/controls", label: "Controls", icon: ShieldCheck },
    { to: "/policies", label: "Policies", icon: ScrollText },
  ]},
];

const vendorChildren: NavItem[] = [
  { to: "/vendors", label: "Overview", icon: LayoutDashboard },
  { to: "/vendors/discovery", label: "Discovery", icon: FlaskConical },
  { to: "/vendors/reviews", label: "Security Reviews", icon: ShieldCheck },
  { to: "/vendors/all", label: "All Vendors", icon: Building2 },
];

const riskItems: NavItem[] = [
  { to: "/risks", label: "Risks", icon: AlertTriangle },
  { to: "/gaps", label: "Gaps", icon: GitPullRequestArrow },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];

const manageItems: NavItem[] = [
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/preview-website", label: "Preview Website", icon: Eye },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");
  const vendorActive = pathname.startsWith("/vendors");
  const [vendorsOpen, setVendorsOpen] = useState(vendorActive);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-[var(--sidebar-border)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
          <ShieldHalf className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">Averonix</div>
          <div className="text-[10px] text-[#9C8FA8] leading-tight">Compliance Cloud</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((g) => (
          <NavSection key={g.label} label={g.label}>
            {g.items.map((i) => <NavLink key={i.to} item={i} active={isActive(i.to)} />)}
          </NavSection>
        ))}

        <NavSection label="Risk">
          <button
            onClick={() => setVendorsOpen((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              vendorActive ? "bg-[var(--sidebar-accent)] text-white" : "text-[#C9BCD6] hover:bg-[var(--sidebar-accent)] hover:text-white"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4" />
              Vendors
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", vendorsOpen && "rotate-180")} />
          </button>
          {vendorsOpen && (
            <div className="mt-1 ml-3 border-l border-[var(--sidebar-border)] pl-2 space-y-0.5">
              {vendorChildren.map((c) => (
                <Link key={c.to} to={c.to}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-xs transition-colors",
                    (c.to === "/vendors" ? pathname === "/vendors" : pathname === c.to)
                      ? "bg-[var(--primary)] text-white"
                      : "text-[#C9BCD6] hover:bg-[var(--sidebar-accent)] hover:text-white"
                  )}
                >{c.label}</Link>
              ))}
            </div>
          )}
          {riskItems.map((i) => <NavLink key={i.to} item={i} active={isActive(i.to)} />)}
        </NavSection>

        <NavSection label="Manage">
          {manageItems.map((i) => <NavLink key={i.to} item={i} active={isActive(i.to)} />)}
        </NavSection>
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-3 text-[11px] text-[#7A6E8A]">
        Averonix v1.0
      </div>
    </aside>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A6E8A]">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link to={item.to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-[var(--primary)] text-white" : "text-[#C9BCD6] hover:bg-[var(--sidebar-accent)] hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}
