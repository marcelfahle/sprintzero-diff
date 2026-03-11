"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

interface CodeBlockEnhancerProps {
  children: React.ReactNode;
}

interface PreButtonEntry {
  pre: HTMLPreElement;
  container: HTMLElement;
}

export function CodeBlockEnhancer({ children }: CodeBlockEnhancerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [preButtons, setPreButtons] = useState<PreButtonEntry[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const pres = wrapper.querySelectorAll<HTMLPreElement>("pre");
    const entries: PreButtonEntry[] = [];

    pres.forEach((pre) => {
      // Skip if already enhanced
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = "true";

      // Make pre relative for absolute button positioning
      pre.style.position = "relative";

      // Create a mount point for the portal
      const container = document.createElement("div");
      container.className = "copy-button-portal";
      container.style.position = "absolute";
      container.style.top = "0.5rem";
      container.style.right = "0.5rem";
      container.style.zIndex = "10";
      pre.appendChild(container);

      entries.push({ pre, container });
    });

    setPreButtons((prev) => [...prev, ...entries]);

    return () => {
      entries.forEach(({ pre, container }) => {
        if (pre.contains(container)) {
          pre.removeChild(container);
        }
        delete pre.dataset.enhanced;
        pre.style.position = "";
      });
      setPreButtons((prev) =>
        prev.filter((e) => !entries.includes(e)),
      );
    };
  }, []);

  const getTextForPre = useCallback((pre: HTMLPreElement) => {
    return () => {
      const code = pre.querySelector("code");
      return code?.textContent ?? pre.textContent ?? "";
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      {children}
      {preButtons.map(({ pre, container }, i) =>
        createPortal(
          <CopyButton key={i} getText={getTextForPre(pre)} />,
          container,
        ),
      )}
    </div>
  );
}
