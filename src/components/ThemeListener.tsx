"use client";

import { useEffect } from "react";

/**
 * Global ThemeListener component.
 * Automatically synchronizes documentElement's 'dark' class with
 * the browser's prefers-color-scheme media query and localStorage theme preference.
 */
export default function ThemeListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = (matches: boolean) => {
      try {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
          document.documentElement.classList.add("dark");
          return;
        }
        if (storedTheme === "light") {
          document.documentElement.classList.remove("dark");
          return;
        }
        // Default to system/browser preference
        if (matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch {
        if (matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    // Ensure state matches on client hydration
    syncTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      syncTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return null;
}
