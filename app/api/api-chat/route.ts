import { NextResponse } from "next/server";
import { generateGeminiReply } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userInput = messages[messages.length - 1].content;

    const geminiReply = await generateGeminiReply([
      {
        role: "user",
        content:
          "Please search about the topic or answer the user's question in detail. " +
          "Return your answer in Markdown using double line breaks between paragraphs so it renders correctly. " +
          "Style important points bold, and style headers bold and bigger. " +
          "Please do not show any HTML tags in the output." +
          "User input: " + userInput,
      }
    ]);

    return NextResponse.json({ reply: geminiReply });
  } catch (error) {
    console.error("Failed to process chat", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
