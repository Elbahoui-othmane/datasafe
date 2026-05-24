import { createFileRoute } from "@tanstack/react-router";
import { handleDisconnect, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/disconnect")({
  server: {
    handlers: {
      POST: ({ request }) => withGoogleWorkspaceApiErrors(() => handleDisconnect(request)),
    },
  },
});
