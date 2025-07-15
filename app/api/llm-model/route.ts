import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchInput, searchResult, recordId } = await req.json();

  const inngestRunId = await inngest.send({
    name: "text/llm.model",
    data: {
      searchInput: searchInput,
      searchResult: searchResult,
      recordId: recordId,
    },
  })
  return NextResponse.json(inngestRunId)
}