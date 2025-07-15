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

export const llmModel=inngest.createFunction(
  { id: "llm-model" },
  { event: "llm-model" },
  async ({ event, step }) => {
  const aiResp = await step.ai.infer("generate-ai-llm-model-call", {
    model: step.ai.models.gemini({
      model: "gemini-1.5-flash",
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    }),
    body: {
        contents: [
            {
                role:'system',
                parts:[
                    {
                        text: "Depends on user input sources, summarize and search about topic or answer the user's questions. Give me a markdown text with proper formatting. User input is: " + event.data.searchInput
                    }
                ]
            },
            {
                role: 'user',
                parts: [
                    {
                        text: JSON.stringify(event.data.searchResult)
                    }
                ]
            }
        ]
    }
  })

  const saveToDb = await step.run("saveToDb", async () => {
    const { data, error } = await supabase
      .from('Chats')
      .update({ 
        aiResp: (
          aiResp?.candidates?.[0]?.content?.parts?.[0] && 
          'text' in aiResp.candidates[0].content.parts[0]
            ? (aiResp.candidates[0].content.parts[0] as { text: string }).text
            : null
        )
      })
      .eq('id', event.data.recordId)
      .select()

      return aiResp;
  })
});