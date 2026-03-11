import { CodeRenderer } from "@/components/code-renderer";
import { CsvViewerClient } from "./csv-viewer-client";

interface CsvViewerProps {
  content: string;
  filename: string;
}

export async function CsvViewer({ content, filename }: CsvViewerProps) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const language = ext === "tsv" ? "TSV" : "CSV";

  const rawView = (
    <CodeRenderer code={content} filename={filename} language={language} />
  );

  return (
    <CsvViewerClient
      content={content}
      filename={filename}
      rawView={rawView}
    />
  );
}
