import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { openai } from "@/lib/openai";
import { generateGeminiReply } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { messages, recordId } = await req.json();

    const geminiReply = await generateGeminiReply([
      {
        role: "system",
        content:
          "Depends on user input sources, summarize and search about topic or answer the user's questions. Give me a markdown text with proper formatting. User input is: " +
          messages[messages.length - 1].content,
      },
      {
        role: "user",
        content: JSON.stringify(messages.slice(0, -1)),
      },
    ]);

    const ai = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const reply = ai.choices?.[0]?.message?.content || "";

    await inngest.send({
      name: "text/llm.model",
      data: {
        searchInput: messages[messages.length - 1].content,
        searchResult: messages.slice(0, -1),
        recordId,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Failed to process chat", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}