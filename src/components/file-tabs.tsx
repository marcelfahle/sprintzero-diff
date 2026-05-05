"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileTabsProps {
  filenames: string[];
  activeFile: string;
}

function parseFilename(name: string): { prefix: string | null; rest: string } {
  const stripped = name.replace(/\.md$/i, "");
  const m = stripped.match(/^(\d+)[-_\s.]+(.+)$/);
  if (m) return { prefix: m[1], rest: m[2] };
  return { prefix: null, rest: stripped };
}

export function FileTabs({ filenames, activeFile }: FileTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      if (value === null) return;
      const filename = String(value);
      const params = new URLSearchParams(searchParams.toString());
      if (filename === filenames[0]) params.delete("file");
      else params.set("file", filename);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams, filenames],
  );

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, filenames]);

  // Map vertical wheel to horizontal scroll, but only when the strip
  // can actually consume the delta — otherwise let the page scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.deltaY === 0) return;
      const canScroll =
        (e.deltaY > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 1) ||
        (e.deltaY < 0 && el.scrollLeft > 1);
      if (!canScroll) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Bring the active tab into view when it changes (or on first mount).
  useEffect(() => {
    const tab = tabRefs.current[activeFile];
    const container = scrollRef.current;
    if (!tab || !container) return;
    const tRect = tab.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const padding = 24;
    if (tRect.left < cRect.left + padding || tRect.right > cRect.right - padding) {
      tab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeFile]);

  if (filenames.length <= 1) return null;

  return (
    <div className="-mx-4 mb-6 border-b border-neutral-800/80 sm:-mx-6 lg:-mx-8">
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overscroll-x-contain px-4 sm:px-6 lg:px-8",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          edges.left && edges.right
            ? "[mask-image:linear-gradient(to_right,transparent_0,black_28px,black_calc(100%-28px),transparent_100%)]"
            : edges.left
              ? "[mask-image:linear-gradient(to_right,transparent_0,black_28px)]"
              : edges.right
                ? "[mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent_100%)]"
                : "",
        )}
      >
        <TabsPrimitive.Root value={activeFile} onValueChange={handleTabChange}>
          <TabsPrimitive.List className="relative flex w-max items-center">
            {filenames.map((name) => {
              const { prefix, rest } = parseFilename(name);
              return (
                <TabsPrimitive.Tab
                  key={name}
                  value={name}
                  ref={(el) => {
                    tabRefs.current[name] = el;
                  }}
                  className={cn(
                    "group/tab relative inline-flex items-baseline gap-2",
                    "whitespace-nowrap px-3.5 py-3 font-mono text-[13px] tracking-tight",
                    "text-neutral-500 transition-colors duration-150 hover:text-neutral-200",
                    "focus-visible:text-neutral-100 focus-visible:outline-none",
                    "data-active:text-neutral-100",
                  )}
                >
                  {prefix && (
                    <span
                      className={cn(
                        "tabular-nums text-neutral-700 transition-colors duration-150",
                        "group-hover/tab:text-neutral-500",
                        "group-data-active/tab:text-sz-orange",
                      )}
                    >
                      {prefix}
                    </span>
                  )}
                  <span>{rest}</span>
                </TabsPrimitive.Tab>
              );
            })}
            <TabsPrimitive.Indicator
              renderBeforeHydration
              className={cn(
                "pointer-events-none absolute bottom-[-1px] left-0 h-px",
                "bg-sz-orange shadow-[0_0_8px_-2px_var(--color-sz-orange)]",
                "transition-[transform,width] duration-[260ms]",
                "ease-[cubic-bezier(0.32,0.72,0,1)]",
              )}
              style={{
                transform: "translateX(var(--active-tab-left))",
                width: "var(--active-tab-width)",
              }}
            />
          </TabsPrimitive.List>
        </TabsPrimitive.Root>
      </div>
    </div>
  );
}
