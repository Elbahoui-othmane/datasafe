import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function NotFoundState({ label = "Item not found", backTo = "/", backLabel = "Go back" }: { label?: string; backTo?: string; backLabel?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-5xl mb-3">🔎</div>
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">The item you're looking for doesn't exist.</p>
      <Button asChild className="mt-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
        <Link to={backTo}><ArrowLeft className="h-4 w-4 mr-1" />{backLabel}</Link>
      </Button>
    </div>
  );
}
