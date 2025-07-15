import { inngest, chatAI } from "@/lib/inngest";

function missingKey() {
  return !process.env.INNGEST_EVENT_KEY || !process.env.INNGEST_SIGNING_KEY;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (missingKey()) {
    return Response.json(
      { error: "Inngest keys not configured." },
      { status: 500 }
    );
  }

  try {
    const result = await inngest.invoke(chatAI, { data: { messages } });
    return Response.json({ reply: result.data.reply });
  } catch (error: unknown) {
    console.error("Inngest request failed", error);
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as any).message)
        : "Error getting response from OpenAI.";
    return Response.json({ error: message }, { status: 500 });
  }
}