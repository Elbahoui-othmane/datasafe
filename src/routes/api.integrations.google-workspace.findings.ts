import { createFileRoute } from "@tanstack/react-router";
import { handleFindings, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/findings")({
  server: {
    handlers: {
      GET: ({ request }) => withGoogleWorkspaceApiErrors(() => handleFindings(request)),
    },
  },
});
