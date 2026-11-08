// Built-in site content (from src/data) and its shape. Kept free of zod so the
// public pages can import it without shipping the validation library.

import { DOMAINS, type DomainInfo } from "@/data/domains";

export interface SiteContent {
  domains: DomainInfo[];
}

export const DEFAULT_CONTENT: SiteContent = {
  domains: [...DOMAINS],
};
