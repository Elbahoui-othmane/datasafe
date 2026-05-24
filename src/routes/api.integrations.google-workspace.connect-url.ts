import { createFileRoute } from "@tanstack/react-router";
import { handleConnectUrl, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/connect-url")({
  server: {
    handlers: {
      GET: ({ request }) => withGoogleWorkspaceApiErrors(() => handleConnectUrl(request)),
    },
  },
});
