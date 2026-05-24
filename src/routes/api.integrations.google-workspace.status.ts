import { createFileRoute } from "@tanstack/react-router";
import { handleStatus, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/status")({
  server: {
    handlers: {
      GET: ({ request }) => withGoogleWorkspaceApiErrors(() => handleStatus(request)),
    },
  },
});
