import { Search, Bell, ChevronDown } from "lucide-react";
import { isAssessmentMode } from "@/config/dataSource";
import { workspace, currentUser } from "@/mocks/data";

export function TopHeader() {
  const assessment = isAssessmentMode();
  const wsName = assessment ? "Your Workspace" : workspace.name;
  const userInitials = assessment ? "AD" : currentUser.initials;
  const userName = assessment ? "Admin" : currentUser.name;

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search…"
          className="h-7 w-full rounded-md border border-transparent bg-[var(--primary-ultra-soft)] pl-8 pr-2 text-xs outline-none focus:bg-card focus:border-border"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs cursor-default">
          <span className="h-4 w-4 rounded bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]" />
          <span className="font-medium">{wsName}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="relative rounded-md p-1.5 cursor-default" title="No new notifications">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md pl-1 pr-2 py-0.5 cursor-default">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-white">{userInitials}</div>
          <div className="hidden md:block leading-tight">
            <div className="text-[11px] font-medium">{userName}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
