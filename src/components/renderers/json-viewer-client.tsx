"use client";

import { type ReactNode, useMemo } from "react";
import { DataTreeViewer, type JsonValue } from "./data-tree-viewer";
import { StructuredFileViewer } from "./structured-file-viewer";

interface JsonViewerClientProps {
  content: string;
  rawView: ReactNode;
}

export function JsonViewerClient({ content, rawView }: JsonViewerClientProps) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(content) as JsonValue;
    } catch {
      return null;
    }
  }, [content]);

  if (parsed === null) {
    return <>{rawView}</>;
  }

  return (
    <StructuredFileViewer
      prettyView={<DataTreeViewer data={parsed} />}
      rawView={rawView}
    />
  );
}
