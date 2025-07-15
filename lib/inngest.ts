import { Inngest } from "inngest";


export const inngest = new Inngest({ id: 'mychatai' });

export const chatAI = inngest.createFunction(
  { id: 'chat-ai', name: 'Chat AI', trigger: { event: 'app/chat' } },
  async ({ event, step }) => {
    const messages = event.data.messages as { role: string; content: string }[];
    const response = await step.ai.infer('openai:gpt-4o', { messages });
    return { reply: response.choices?.[0]?.message?.content ?? '' };
  },
);