import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveSlug, getCustomerByGistId } from "@/lib/registry";
import { fetchGist, isMarkdown } from "@/lib/github";
import { resolveTheme } from "@/lib/theme";
import matter from "gray-matter";

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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slugParam = searchParams.get("slug");

  const [geistRegular, geistBold] = await Promise.all([
    loadFont("Geist-Regular.ttf"),
    loadFont("Geist-Bold.ttf"),
  ]);

  let title = "diff.sprintzero.sh";
  let description = "Client deliverables by Sprint Zero";
  let customerName: string | undefined;
  let accentColor = "#f97316";
  let brandCompany = "Sprint Zero";

  if (slugParam) {
    const slug = slugParam.split("/");
    const resolved = resolveSlug(slug);

    if (resolved) {
      const theme = resolveTheme(resolved.customer);
      accentColor = theme.accentColor;
      brandCompany = theme.company;

      const gist = await fetchGist(resolved.gistId);
      if (gist) {
        if (resolved.project) {
          title = resolved.project.name;
          customerName = resolved.customer?.name;
        } else {
          const registryInfo = getCustomerByGistId(gist.id);
          if (registryInfo) {
            title = registryInfo.project.name;
            customerName = registryInfo.customer.name;
          } else if (gist.description) {
            title = gist.description;
          }
        }

        // Get description from gist or first markdown file frontmatter
        const firstMarkdown = Object.values(gist.files).find((f) =>
          isMarkdown(f.filename),
        );
        if (firstMarkdown) {
          const { data } = matter(firstMarkdown.content);
          if (data.engagement) {
            description = String(data.engagement);
          }
        }
        if (gist.description && title !== gist.description) {
          description = gist.description;
        }
      }
    }
  }

  if (title.length > 60) title = title.slice(0, 57) + "...";
  if (description.length > 120)
    description = description.slice(0, 117) + "...";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.05em",
            }}
          >
            {brandCompany}
          </span>
          <span style={{ fontSize: "24px", color: "#525252" }}>/</span>
          <span style={{ fontSize: "24px", color: "#a3a3a3" }}>diff</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a3a3a3",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {customerName ? (
            <span style={{ fontSize: "20px", color: "#737373" }}>
              {customerName}
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              fontSize: "20px",
              color: "#525252",
              fontFamily: "monospace",
            }}
          >
            diff.sprintzero.sh
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
      ],
    },
  );
}
