"use client";
import React, { createContext, useContext } from "react";
import type { DomainInfo } from "@/data/domains";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/content/defaults";

// Live site content (admin edits over defaults) for client components.
// Without a provider, components fall back to the built-in defaults.

const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

export function ContentProvider({ content, children }: { content: SiteContent; children: React.ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useDomains(): DomainInfo[] {
  return useContext(ContentContext).domains;
}
