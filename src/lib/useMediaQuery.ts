"use client";
import { useEffect, useState } from "react";

/** Phones, matching Tailwind's `sm` breakpoint. */
export const PHONE_QUERY = "(max-width: 639px)";

/** Whether a CSS media query matches; false until mounted (the server can't know). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
