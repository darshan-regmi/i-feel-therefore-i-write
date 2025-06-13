export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getPoemById } from "@/lib/notion";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const poem = await getPoemById(params.id);

  if (!poem) {
    return NextResponse.json({ error: "Poem not found" }, { status: 404 });
  }

  return NextResponse.json(poem);
}