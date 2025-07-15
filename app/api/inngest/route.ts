import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld, llmModel } from "./functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    llmModel,
    /* your functions will be passed here later! */
  ],
});