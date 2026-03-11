import matter from "gray-matter";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Badge } from "@/components/ui/badge";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { data: frontmatter, content: body } = matter(content);
  const hasFrontmatter = Object.keys(frontmatter).length > 0;

  return (
    <div>
      {hasFrontmatter && <FrontmatterCard data={frontmatter} />}
      <div className="markdown-body">
        <Markdown
          remarkPlugins={[remarkGfm, remarkAlert]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "prepend",
                properties: {
                  className: ["heading-anchor"],
                  ariaHidden: "true",
                  tabIndex: -1,
                },
                content: [{ type: "text", value: "#" }],
              },
            ],
          ]}
        >
          {body}
        </Markdown>
      </div>
    </div>
  );
}

function FrontmatterCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="contents">
            <dt>
              <Badge variant="secondary" className="font-mono text-xs">
                {key}
              </Badge>
            </dt>
            <dd className="text-sm text-neutral-300">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
