import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const rateLimitMap = new Map<string, number>();

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ gistId: string }> },
) {
  const { gistId } = await params;

  if (!/^[0-9a-f]{20,32}$/.test(gistId)) {
    return NextResponse.json({ error: "Invalid gist ID" }, { status: 400 });
  }

  const now = Date.now();
  const lastRefresh = rateLimitMap.get(gistId);

  if (lastRefresh && now - lastRefresh < 60_000) {
    return NextResponse.json(
      { error: "Rate limited. Try again in 60 seconds." },
      { status: 429 },
    );
  }

  rateLimitMap.set(gistId, now);
  revalidateTag(`gist-${gistId}`, { expire: 0 });

  return NextResponse.json({ revalidated: true });
}
