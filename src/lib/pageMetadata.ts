import type { Metadata } from "next";

/**
 * Per-page metadata for routes whose page.tsx is a client component
 * ("use client" pages can't export metadata, so each route gets a tiny layout.tsx).
 * Gives every page its own tab title, canonical URL and link-preview title.
 * The share image comes from src/app/opengraph-image.png automatically.
 */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "GDG NMIT",
      locale: "en_IN",
      title: `${title} | GDG NMIT`,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | GDG NMIT`,
      description,
    },
  };
}
