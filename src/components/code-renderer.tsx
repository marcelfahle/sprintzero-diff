import { highlightCode, getShikiLang } from "@/lib/shiki";

interface CodeRendererProps {
  code: string;
  filename: string;
  language: string | null;
}

export async function CodeRenderer({
  code,
  filename,
  language,
}: CodeRendererProps) {
  const lang = getShikiLang(filename, language);
  const html = await highlightCode(code, lang);

  return (
    <div
      className="code-rendered rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-sm overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!m-0 [&_code]:!bg-transparent [&_code]:!p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
