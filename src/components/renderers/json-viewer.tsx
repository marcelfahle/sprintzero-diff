import { CodeRenderer } from "@/components/code-renderer";
import { JsonViewerClient } from "./json-viewer-client";

interface JsonViewerProps {
  content: string;
  filename: string;
}

export async function JsonViewer({ content, filename }: JsonViewerProps) {
  const rawView = (
    <CodeRenderer code={content} filename={filename} language="JSON" />
  );

  return <JsonViewerClient content={content} rawView={rawView} />;
}
