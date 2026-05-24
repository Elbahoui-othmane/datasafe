import { useState } from "react";
import { Search, Bell, ChevronDown, X } from "lucide-react";
import { isAssessmentMode } from "@/config/dataSource";
import { workspace, currentUser } from "@/mocks/data";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function TopHeader() {
  const assessment = isAssessmentMode();
  const wsName = assessment ? "Your Workspace" : workspace.name;
  const userInitials = assessment ? "AD" : currentUser.initials;
  const userName = assessment ? "Admin" : currentUser.name;
  const [notifOpen, setNotifOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search…"
          className="h-7 w-full rounded-md border border-transparent bg-[var(--primary-ultra-soft)] pl-8 pr-2 text-xs outline-none focus:bg-card focus:border-border"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) toast.info(`Search: "${val}"`);
            }
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {/* Workspace switcher */}
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs select-none">
          <span className="h-4 w-4 rounded bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]" />
          <span className="font-medium">{wsName}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative rounded-md p-1.5 hover:bg-muted transition"
            title="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border bg-card shadow-lg z-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide">Notifications</span>
                <button onClick={() => setNotifOpen(false)} className="rounded p-0.5 hover:bg-muted">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground text-center py-4">No new notifications.</div>
            </div>
          )}
        </div>

        {/* User menu */}
        <button
          className="flex items-center gap-1.5 rounded-md pl-1 pr-2 py-0.5 hover:bg-muted transition"
          onClick={() => nav({ to: "/settings" })}
          title="Go to settings"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-white">{userInitials}</div>
          <div className="hidden md:block leading-tight">
            <div className="text-[11px] font-medium">{userName}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
