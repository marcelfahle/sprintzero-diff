import { notFound } from "next/navigation";
import type { Metadata } from "next";
import matter from "gray-matter";
import { resolveSlug, getCustomerByGistId } from "@/lib/registry";
import { fetchGist, isMarkdown, isJSON } from "@/lib/github";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { CodeRenderer } from "@/components/code-renderer";
import { JsonViewer } from "@/components/renderers/json-viewer";
import { GistClientShell, type FileData } from "@/components/gist-client-shell";
import { EngagementFooter } from "@/components/engagement-footer";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

async function resolveGist(slug: string[]) {
  const resolved = resolveSlug(slug);
  if (!resolved) return null;

  const gist = await fetchGist(resolved.gistId);
  if (!gist) return null;

  return { gist, resolved };
}

async function renderFile(
  filename: string,
  content: string,
  language: string | null,
): Promise<React.ReactNode> {
  if (isMarkdown(filename)) {
    return <MarkdownRenderer content={content} />;
  }
  if (isJSON(filename)) {
    return <JsonViewer content={content} filename={filename} />;
  }
  return <CodeRenderer code={content} filename={filename} language={language} />;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolveGist(slug);
  if (!result) return { title: "Not Found" };

  const { gist, resolved } = result;

  let title = "diff.sprintzero.sh";
  if (resolved.project) {
    title = `${resolved.project.name} \u00b7 Sprint Zero`;
  } else if (gist.description) {
    title = `${gist.description} \u00b7 Sprint Zero`;
  }

  const description =
    gist.description || "Client deliverable by Sprint Zero";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function GistPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await resolveGist(slug);
  if (!result) notFound();

  const { gist, resolved } = result;

  const files = Object.values(gist.files);
  if (files.length === 0) notFound();

  const filenames = files.map((f) => f.filename);

  // Pre-render all file panels in parallel
  const fileData: FileData[] = await Promise.all(
    files.map(async (file) => ({
      filename: file.filename,
      rawContent: file.content,
      isMarkdown: isMarkdown(file.filename),
      renderedContent: await renderFile(
        file.filename,
        file.content,
        file.language,
      ),
    })),
  );

  // Extract frontmatter from first markdown file for extra metadata
  const firstMarkdown = files.find((f) => isMarkdown(f.filename));
  let frontmatterMeta: Record<string, string> = {};
  if (firstMarkdown) {
    const { data } = matter(firstMarkdown.content);
    frontmatterMeta = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    );
  }

  // Build footer props: merge registry metadata + frontmatter
  const registryInfo = resolved.customer
    ? { customer: resolved.customer, project: resolved.project! }
    : getCustomerByGistId(gist.id);

  const customerName =
    registryInfo?.customer.name || frontmatterMeta.client || undefined;
  const projectName =
    registryInfo?.project.name || frontmatterMeta.engagement || undefined;
  const deliveryDate =
    registryInfo?.project.date || frontmatterMeta.delivered || undefined;

  const engagementFooter = (
    <EngagementFooter
      customerName={customerName}
      projectName={projectName}
      deliveryDate={deliveryDate}
      gistHtmlUrl={gist.html_url}
    />
  );

  return (
    <GistClientShell
      filenames={filenames}
      fileData={fileData}
      gistDescription={gist.description}
      gistHtmlUrl={gist.html_url}
      gistId={gist.id}
      engagementFooter={engagementFooter}
    />
  );
}
