"use client";

import { ThemeProvider } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useTheme } from "next-themes";

function ThemeUrlSync() {
  const { setTheme } = useTheme();
  const searchParams = useSearchParams();

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    if (themeParam === "light" || themeParam === "dark") {
      setTheme(themeParam);
    }
  }, [searchParams, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense>
        <ThemeUrlSync />
      </Suspense>
      {children}
    </ThemeProvider>
  );
}
