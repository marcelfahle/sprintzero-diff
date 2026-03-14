"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  FileDown,
  Link,
  ExternalLink,
  RefreshCw,
  FileText,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

interface PageCopyButtonsProps {
  rawContent: string;
  filename: string;
  gistId: string;
  gistHtmlUrl: string;
  isMarkdown?: boolean;
}

export function PageCopyButtons({
  rawContent,
  filename,
  gistId,
  gistHtmlUrl,
  isMarkdown = false,
}: PageCopyButtonsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const copyRaw = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawContent);
      setCopied(true);
      toast.success("Raw content copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [rawContent]);

  const copyFormatted = useCallback(async () => {
    const el = document.getElementById("gist-content");
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLElement;
    // Strip injected copy buttons
    clone
      .querySelectorAll("[data-copy-button]")
      .forEach((btn) => btn.remove());
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([clone.innerHTML], { type: "text/html" }),
          "text/plain": new Blob([clone.textContent || ""], {
            type: "text/plain",
          }),
        }),
      ]);
      setCopied(true);
      toast.success("Formatted content copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy formatted content");
    }
  }, []);

  const download = useCallback(() => {
    const blob = new Blob([rawContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }, [rawContent, filename]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const openSource = useCallback(() => {
    window.open(gistHtmlUrl, "_blank", "noopener");
  }, [gistHtmlUrl]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/refresh/${gistId}`, { method: "POST" });
      if (res.status === 429) {
        toast.error("Rate limited. Try again in 60 seconds.");
      } else if (res.ok) {
        router.refresh();
        toast.success("Content refreshed");
      } else {
        toast.error("Failed to refresh");
      }
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }, [gistId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Skip if in input, textarea, contenteditable, or with modifiers
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          copyRaw();
          break;
        case "f":
          if (isMarkdown) {
            e.preventDefault();
            copyFormatted();
          }
          break;
        case "d":
          e.preventDefault();
          download();
          break;
        case "l":
          e.preventDefault();
          copyLink();
          break;
        case "o":
          e.preventDefault();
          openSource();
          break;
        case "r":
          e.preventDefault();
          refresh();
          break;
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [copyRaw, copyFormatted, download, copyLink, openSource, refresh, isMarkdown]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
        aria-label="Actions"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem onClick={copyRaw}>
          <Copy className="h-4 w-4" />
          Copy raw
          <DropdownMenuShortcut>C</DropdownMenuShortcut>
        </DropdownMenuItem>
        {isMarkdown && (
          <DropdownMenuItem onClick={copyFormatted}>
            <FileText className="h-4 w-4" />
            Copy formatted
            <DropdownMenuShortcut>F</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={download}>
          <FileDown className="h-4 w-4" />
          Download
          <DropdownMenuShortcut>D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          <Link className="h-4 w-4" />
          Copy link
          <DropdownMenuShortcut>L</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={refresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
          <DropdownMenuShortcut>R</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
