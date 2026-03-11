export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content: string;
}

export interface GistOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Gist {
  id: string;
  description: string | null;
  public: boolean;
  files: Record<string, GistFile>;
  owner: GistOwner | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  twitter_username: string | null;
  location: string | null;
}

const GIST_ID_RE = /^[0-9a-f]{20,32}$/;

function getGitHubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchGist(gistId: string): Promise<Gist | null> {
  if (!GIST_ID_RE.test(gistId)) {
    return null;
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: getGitHubHeaders(),
    next: { revalidate: 86400, tags: [`gist-${gistId}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (res.status === 403 || res.status === 429) {
    throw new Error("GitHub API rate limit exceeded");
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchUser(
  username: string,
): Promise<GitHubUser | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: getGitHubHeaders(),
    next: { revalidate: 86400 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// --- File type detection ---

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

export function isMarkdown(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "md" || ext === "markdown" || ext === "mdx";
}

export function isJSON(filename: string): boolean {
  return getFileExtension(filename) === "json";
}

export function isYAML(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "yml" || ext === "yaml";
}

export function isCSV(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "csv" || ext === "tsv";
}

export function isICS(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "ics" || ext === "ical";
}

export function isPlainText(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "txt" || ext === "text" || ext === "";
}

export function isStructuredData(filename: string): boolean {
  return isJSON(filename) || isYAML(filename) || isCSV(filename) || isICS(filename);
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeMap: Record<string, string> = {
    md: "text/markdown",
    markdown: "text/markdown",
    mdx: "text/markdown",
    json: "application/json",
    yml: "text/yaml",
    yaml: "text/yaml",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    ics: "text/calendar",
    ical: "text/calendar",
    txt: "text/plain",
    text: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "application/typescript",
    tsx: "application/typescript",
    jsx: "application/javascript",
    xml: "application/xml",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeMap[ext] || "text/plain";
}
