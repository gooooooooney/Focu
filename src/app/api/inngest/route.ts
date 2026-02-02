import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
import { processMessage } from "@/features/conversation/inggest/process-message";
// import { processMessage } from "@/features/inngest/process-message";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    /* your functions will be passed here later! */
    // processMessage,
    processMessage,
  ],
});