import { createFileRoute } from "@tanstack/react-router";
import { handleSync, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/sync")({
  server: {
    handlers: {
      POST: ({ request }) => withGoogleWorkspaceApiErrors(() => handleSync(request)),
    },
  },
});
