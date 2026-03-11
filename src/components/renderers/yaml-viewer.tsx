import { CodeRenderer } from "@/components/code-renderer";
import { YamlViewerClient } from "./yaml-viewer-client";

interface YamlViewerProps {
  content: string;
  filename: string;
}

export async function YamlViewer({ content, filename }: YamlViewerProps) {
  const rawView = (
    <CodeRenderer code={content} filename={filename} language="YAML" />
  );

  return <YamlViewerClient content={content} rawView={rawView} />;
}
