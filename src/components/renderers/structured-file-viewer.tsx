"use client";

import { useState, type ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StructuredFileViewerProps {
  prettyView: ReactNode;
  rawView: ReactNode;
}

export function StructuredFileViewer({
  prettyView,
  rawView,
}: StructuredFileViewerProps) {
  const [mode, setMode] = useState<"pretty" | "raw">("pretty");

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-end px-3 py-2 border-b border-neutral-800">
        <ToggleGroup
          value={[mode]}
          onValueChange={(val: string[]) => {
            const next = val.find((v) => v !== mode);
            if (next === "pretty" || next === "raw") setMode(next);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="pretty">Pretty</ToggleGroupItem>
          <ToggleGroupItem value="raw">Raw</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>{mode === "pretty" ? prettyView : rawView}</div>
    </div>
  );
}
