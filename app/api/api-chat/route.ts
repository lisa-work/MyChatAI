// import { NextResponse } from "next/server";
// import { inngest } from "@/inngest/client";
// import { generateGeminiReply } from "@/lib/gemini";

// export async function POST(req: Request) {
//   try {
//     const { messages, recordId } = await req.json();

//     // Compose user input from the last message
//     const userInput = messages[messages.length - 1].content;

//     // Call Gemini directly to generate a reply
//     const geminiReply = await generateGeminiReply([
//       {
//         role: "user",
//         content:
//           "Depends on user input sources, search about topic and give detailed answers or answer the user's questions or just simply interact with them. Please return your answer in Markdown, using double line breaks (\n\n) between paragraphs so that it renders with correct paragraph tags, style the main points to be bold and style the header to be bold and bigger than the body. User input is: " +
//           userInput,
//       },
//       {
//         role: "user",
//         content: JSON.stringify(messages.slice(0, -1)),
//       },
//     ]);


//     await inngest.send({
//       name: "text/llm.model",
//       data: {
//         searchInput: userInput,
//         searchResult: messages.slice(0, -1),
//         recordId,
//       },
//     });

//     return NextResponse.json({ reply: geminiReply });
//   } catch (error) {
//     console.error("Failed to process chat", error instanceof Error ? error.message : error);
//     return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
//   }
// }

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
          "Return your answer in Markdown using double line breaks (\\n\\n) between paragraphs so it renders correctly. " +
          "Style important points bold, and style headers bold and bigger. " +
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
