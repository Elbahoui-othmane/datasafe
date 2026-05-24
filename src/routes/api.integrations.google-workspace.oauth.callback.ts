import { createFileRoute } from "@tanstack/react-router";
import { handleOAuthCallback, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/oauth/callback")({
  server: {
    handlers: {
      GET: ({ request }) => withGoogleWorkspaceApiErrors(() => handleOAuthCallback(request)),
    },
  },
});
