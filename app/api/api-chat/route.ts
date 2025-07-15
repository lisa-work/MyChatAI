import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
  });

  return Response.json({ reply: response.choices[0].message.content });
}
