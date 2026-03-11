"use client";

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface TreeNodeProps {
  keyName: string | null;
  value: JsonValue;
  defaultExpanded?: boolean;
}

function TreeNode({ keyName, value, defaultExpanded = true }: TreeNodeProps) {
  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => setExpanded((e) => !e), []);

  if (!isExpandable) {
    return (
      <div className="flex items-start gap-1 py-0.5">
        {keyName !== null && (
          <>
            <span className="text-neutral-400">{keyName}</span>
            <span className="text-neutral-600">:</span>{" "}
          </>
        )}
        <ValueDisplay value={value} />
      </div>
    );
  }

  const entries = isArray
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, JsonValue>);

  const bracketOpen = isArray ? "[" : "{";
  const bracketClose = isArray ? "]" : "}";
  const itemCount = entries.length;

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-0.5 py-0.5 hover:bg-neutral-800/50 rounded px-0.5 -ml-0.5 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
        )}
        {keyName !== null && (
          <>
            <span className="text-neutral-400">{keyName}</span>
            <span className="text-neutral-600">:</span>{" "}
          </>
        )}
        <span className="text-neutral-600">
          {bracketOpen}
          {!expanded && (
            <span className="text-neutral-500">
              {" "}
              {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
            </span>
          )}
          {!expanded && bracketClose}
        </span>
      </button>
      {expanded && (
        <div className="pl-6 border-l border-neutral-800 ml-1.5">
          {entries.map(([k, v]) => (
            <TreeNode
              key={k}
              keyName={isArray ? null : k}
              value={v}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
      {expanded && (
        <span className="text-neutral-600 pl-1">{bracketClose}</span>
      )}
    </div>
  );
}

function ValueDisplay({ value }: { value: JsonValue }) {
  if (value === null) {
    return <span className="text-neutral-500 italic">null</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-blue-400">{String(value)}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-sz-orange">{String(value)}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-green-400">&quot;{value}&quot;</span>;
  }
  return null;
}

interface DataTreeViewerProps {
  data: JsonValue;
}

export function DataTreeViewer({ data }: DataTreeViewerProps) {
  return (
    <div className="font-mono text-sm p-4 overflow-x-auto">
      <TreeNode keyName={null} value={data} defaultExpanded={true} />
    </div>
  );
}

export type { JsonValue };
