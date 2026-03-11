"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileTabsProps {
  filenames: string[];
  activeFile: string;
}

export function FileTabs({ filenames, activeFile }: FileTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      if (value === null) return;
      const filename = String(value);
      const params = new URLSearchParams(searchParams.toString());
      if (filename === filenames[0]) {
        params.delete("file");
      } else {
        params.set("file", filename);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams, filenames],
  );

  if (filenames.length <= 1) return null;

  return (
    <Tabs value={activeFile} onValueChange={handleTabChange}>
      <TabsList variant="line" className="w-full justify-start gap-0 border-b border-neutral-800 px-0">
        {filenames.map((name) => (
          <TabsTrigger
            key={name}
            value={name}
            className="font-mono text-xs data-active:text-neutral-100 data-active:after:bg-sz-orange text-neutral-500 hover:text-neutral-300 rounded-none px-3 py-2"
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
