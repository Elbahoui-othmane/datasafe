import { createFileRoute } from "@tanstack/react-router";
import { GoogleWorkspaceIntegrationPage } from "@/components/integrations/GoogleWorkspaceIntegrationPage";

export const Route = createFileRoute("/integrations/google-workspace")({
  head: () => ({ meta: [{ title: "Google Workspace - Integration - Averonix" }] }),
  component: GoogleWorkspaceIntegrationPage,
});
