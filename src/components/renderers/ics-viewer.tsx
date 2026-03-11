import { CodeRenderer } from "@/components/code-renderer";
import { IcsViewerClient } from "./ics-viewer-client";

interface IcsViewerProps {
  content: string;
  filename: string;
}

export async function IcsViewer({ content, filename }: IcsViewerProps) {
  const rawView = (
    <CodeRenderer code={content} filename={filename} language="iCalendar" />
  );

  return <IcsViewerClient content={content} rawView={rawView} />;
}
