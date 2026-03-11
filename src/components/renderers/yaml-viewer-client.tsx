"use client";

import { type ReactNode, useMemo } from "react";
import YAML from "yaml";
import { DataTreeViewer, type JsonValue } from "./data-tree-viewer";
import { StructuredFileViewer } from "./structured-file-viewer";

interface YamlViewerClientProps {
  content: string;
  rawView: ReactNode;
}

export function YamlViewerClient({ content, rawView }: YamlViewerClientProps) {
  const parsed = useMemo(() => {
    try {
      return YAML.parse(content) as JsonValue;
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
