import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
import { processMessage } from "@/features/conversation/inggest/process-message";
import { exportToGithub } from "@/features/projects/inggest/export-github-repo";
import { importGithubRepo } from "@/features/projects/inggest/import-github-repo";
// import { processMessage } from "@/features/inngest/process-message";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    /* your functions will be passed here later! */
    // processMessage,
    processMessage,
    importGithubRepo,
    exportToGithub,
  ],
});