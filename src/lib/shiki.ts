import { codeToHtml } from "shiki";

const LANG_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  yml: "yaml",
  yaml: "yaml",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  mdx: "mdx",
  css: "css",
  scss: "scss",
  html: "html",
  xml: "xml",
  sql: "sql",
  graphql: "graphql",
  dockerfile: "dockerfile",
  toml: "toml",
  ini: "ini",
  csv: "csv",
  swift: "swift",
  kt: "kotlin",
  java: "java",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  php: "php",
  lua: "lua",
  r: "r",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hs: "haskell",
  ml: "ocaml",
  vim: "viml",
  diff: "diff",
  makefile: "makefile",
};

export function getShikiLang(
  filename: string,
  language: string | null,
): string {
  // Try GitHub's language field first (lowercase)
  if (language) {
    const lower = language.toLowerCase();
    if (LANG_MAP[lower]) return LANG_MAP[lower];
    // Shiki might support it directly
    return lower;
  }

  // Fall back to file extension
  const dot = filename.lastIndexOf(".");
  if (dot !== -1) {
    const ext = filename.slice(dot + 1).toLowerCase();
    if (LANG_MAP[ext]) return LANG_MAP[ext];
    return ext;
  }

  // Special filenames
  const base = filename.toLowerCase();
  if (base === "dockerfile") return "dockerfile";
  if (base === "makefile") return "makefile";

  return "text";
}

export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang,
      theme: "github-dark-default",
    });
  } catch {
    // If the language isn't supported, fall back to plain text
    return await codeToHtml(code, {
      lang: "text",
      theme: "github-dark-default",
    });
  }
}
