import { supabase } from "@/data/supabase";
import { inngest } from "../../../inngest/client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const llmModel = inngest.createFunction(
  { id: "llm-model" },
  { event: "text/llm.model" },
  async ({ event, step }) => {
    const aiResp = await step.ai.infer("generate-ai-llm-model-call", {
      model: step.ai.models.gemini({
        model: "gemini-1.5-flash",
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "system",
            parts: [
              {
                text:
                  "Depends on user input sources, search about topic and give detailed answers or answer the user's questions. Please return your answer in Markdown, using double line breaks (\n\n) between paragraphs so that it renders with correct paragraph tags, style the main points to be bold and style the header to be bold and bigger than the body. User input is: " +
                  event.data.searchInput,
              },
            ],
          },
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify(event.data.searchResult),
              },
            ],
          },
        ],
      },
    });

    await step.run("saveToDb", async () => {
      if (event.data.recordId) {
        await supabase
          .from("Chats")
          .update({
            aiResp:
              aiResp?.candidates?.[0]?.content?.parts?.[0] &&
              "text" in aiResp.candidates[0].content.parts[0]
                ? (aiResp.candidates[0].content.parts[0] as { text: string }).text
                : null,
          })
          .eq("id", event.data.recordId);
      }
    });

    return aiResp;
  },
);
