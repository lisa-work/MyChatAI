// import { openai } from "@/lib/openai";

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages,
//   });

//   return Response.json({ reply: response.choices[0].message.content });
// }

import { openai } from "@/lib/openai";

function missingKey() {
  return !process.env.NEXT_OPENAI_API_KEY;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (missingKey()) {
    return Response.json(
      { error: "OpenAI API key not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return Response.json({ reply: response.choices[0].message.content });
  } catch (error: unknown) {
    console.error("OpenAI request failed", error);
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as any).message)
        : "Error getting response from OpenAI.";
    return Response.json({ error: message }, { status: 500 });
  }
}