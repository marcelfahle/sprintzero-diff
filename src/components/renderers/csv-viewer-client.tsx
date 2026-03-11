"use client";

import { type ReactNode, useMemo, useState, useCallback } from "react";
import Papa from "papaparse";
import { ArrowUp, ArrowDown } from "lucide-react";
import { StructuredFileViewer } from "./structured-file-viewer";

interface CsvViewerClientProps {
  content: string;
  filename: string;
  rawView: ReactNode;
}

type SortDirection = "asc" | "desc";

interface SortState {
  column: number;
  direction: SortDirection;
}

export function CsvViewerClient({
  content,
  filename,
  rawView,
}: CsvViewerClientProps) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const delimiter = ext === "tsv" ? "\t" : undefined;

  const { headers, rows } = useMemo(() => {
    const result = Papa.parse<string[]>(content, {
      delimiter,
      skipEmptyLines: true,
    });

    if (!result.data || result.data.length === 0) {
      return { headers: [] as string[], rows: [] as string[][] };
    }

    return {
      headers: result.data[0],
      rows: result.data.slice(1),
    };
  }, [content, delimiter]);

  const [sort, setSort] = useState<SortState | null>(null);

  const handleSort = useCallback(
    (colIndex: number) => {
      setSort((prev) => {
        if (prev?.column === colIndex) {
          return prev.direction === "asc"
            ? { column: colIndex, direction: "desc" }
            : null;
        }
        return { column: colIndex, direction: "asc" };
      });
    },
    [],
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sort.column] ?? "";
      const bVal = b[sort.column] ?? "";

      // Try numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum) && aVal !== "" && bVal !== "") {
        return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Fall back to string comparison
      const cmp = aVal.localeCompare(bVal);
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [rows, sort]);

  if (headers.length === 0) {
    return <>{rawView}</>;
  }

  const prettyView = (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-neutral-800">
            {headers.map((header, i) => (
              <th
                key={i}
                className="sticky top-0 bg-neutral-900 px-4 py-2.5 text-left font-medium text-neutral-300 cursor-pointer select-none hover:text-neutral-100 transition-colors whitespace-nowrap"
                onClick={() => handleSort(i)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {header}
                  {sort?.column === i ? (
                    sort.direction === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5 text-sz-orange" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-sz-orange" />
                    )
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={
                rowIndex % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900"
              }
            >
              {headers.map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 text-neutral-300 whitespace-nowrap"
                >
                  {row[colIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return <StructuredFileViewer prettyView={prettyView} rawView={rawView} />;
}
