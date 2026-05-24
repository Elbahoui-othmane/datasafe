import { createFileRoute } from "@tanstack/react-router";
import { handleGroups, withGoogleWorkspaceApiErrors } from "@/lib/server/google-workspace/handlers";

export const Route = createFileRoute("/api/integrations/google-workspace/groups")({
  server: {
    handlers: {
      GET: ({ request }) => withGoogleWorkspaceApiErrors(() => handleGroups(request)),
    },
  },
});
