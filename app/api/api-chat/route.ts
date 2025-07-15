import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { messages, recordId } = await req.json();

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