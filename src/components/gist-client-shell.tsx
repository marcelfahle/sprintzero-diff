"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { FileTabs } from "@/components/file-tabs";
import { PageCopyButtons } from "@/components/page-copy-buttons";
import { CodeBlockEnhancer } from "@/components/code-block-enhancer";

export interface FileData {
  filename: string;
  rawContent: string;
  isMarkdown: boolean;
  renderedContent: ReactNode;
}

interface GistClientShellProps {
  filenames: string[];
  fileData: FileData[];
  gistDescription: string | null;
  gistHtmlUrl: string;
  gistId: string;
  engagementFooter: ReactNode;
  themeStyleOverrides?: Record<string, string>;
}

function GistClientShellInner({
  filenames,
  fileData,
  gistDescription,
  gistHtmlUrl,
  gistId,
  engagementFooter,
  themeStyleOverrides,
}: GistClientShellProps) {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file");
  const noheader = searchParams.has("noheader");
  const nofooter = searchParams.has("nofooter");
  const mono = searchParams.has("mono");

  const activeFile = fileParam && filenames.includes(fileParam) ? fileParam : filenames[0];
  const activeFileData = fileData.find((f) => f.filename === activeFile) ?? fileData[0];

  return (
    <div className={`mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 ${mono ? "font-mono" : ""}`} style={themeStyleOverrides}>
      {!noheader && (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {gistDescription && (
              <h1 className="text-lg font-medium text-neutral-100 break-words">
                {gistDescription}
              </h1>
            )}
          </div>
          <div className="flex-shrink-0">
            <PageCopyButtons
              rawContent={activeFileData.rawContent}
              filename={activeFileData.filename}
              gistId={gistId}
              gistHtmlUrl={gistHtmlUrl}
              isMarkdown={activeFileData.isMarkdown}
            />
          </div>
        </header>
      )}

      <FileTabs filenames={filenames} activeFile={activeFile} />

      <CodeBlockEnhancer>
        <div id="gist-content">
          {fileData.map((file) => (
            <div
              key={file.filename}
              className={file.filename === activeFile ? "block" : "hidden"}
            >
              {file.renderedContent}
            </div>
          ))}
        </div>
      </CodeBlockEnhancer>

      {!nofooter && engagementFooter}
    </div>
  );
}

export function GistClientShell(props: GistClientShellProps) {
  return (
    <Suspense>
      <GistClientShellInner {...props} />
    </Suspense>
  );
}
