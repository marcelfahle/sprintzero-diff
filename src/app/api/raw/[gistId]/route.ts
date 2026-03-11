import { NextRequest, NextResponse } from "next/server";
import { fetchGist, getMimeType } from "@/lib/github";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gistId: string }> },
) {
  const { gistId } = await params;
  const gist = await fetchGist(gistId);

  if (!gist) {
    return NextResponse.json({ error: "Gist not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const requestedFile = searchParams.get("file");

  const filenames = Object.keys(gist.files);
  const filename = requestedFile && filenames.includes(requestedFile)
    ? requestedFile
    : filenames[0];

  if (!filename) {
    return NextResponse.json({ error: "No files in gist" }, { status: 404 });
  }

  const file = gist.files[filename];
  const contentType = getMimeType(filename);

  return new NextResponse(file.content, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
