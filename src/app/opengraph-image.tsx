import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "diff.sprintzero.sh — Client deliverables by Sprint Zero";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [geistRegular, geistBold] = await Promise.all([
    loadFont("Geist-Regular.ttf"),
    loadFont("Geist-Bold.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "Geist",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#f97316",
            letterSpacing: "0.05em",
            marginBottom: "32px",
          }}
        >
          Sprint Zero
        </span>
        <span
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#fafafa",
            fontFamily: "monospace",
            letterSpacing: "-0.02em",
          }}
        >
          diff.sprintzero.sh
        </span>
        <span
          style={{
            fontSize: "24px",
            color: "#737373",
            marginTop: "24px",
          }}
        >
          Client deliverables by Sprint Zero
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: geistRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: geistBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const buffer = await readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans",
      filename,
    ),
  );
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}
