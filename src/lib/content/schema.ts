// Editable site content: the shapes the admin panel can change, how they are
// validated, and how saved edits merge over the built-in defaults in src/data.
// Safe to import on both server and client (no database code here).

import { z } from "zod";
import { DOMAINS, type DomainInfo } from "@/data/domains";
import { DEFAULT_CONTENT, type SiteContent } from "./defaults";

export { DEFAULT_CONTENT, type SiteContent };

export const CONTENT_SECTIONS = ["domains"] as const;
export type ContentSection = (typeof CONTENT_SECTIONS)[number];

const DOMAIN_IDS = DOMAINS.map((d) => d.id) as [string, ...string[]];

const text = (max: number) => z.string().trim().min(1, "Can't be empty").max(max, `Keep it under ${max} characters`);
const textList = (maxLength: number, maxItems: number) =>
  z.array(text(maxLength)).min(1, "Add at least one").max(maxItems, `At most ${maxItems} items`);
/** Like textList, but may be empty (sections the page hides until filled in). */
const optionalTextList = (maxLength: number, maxItems: number) =>
  z.array(text(maxLength)).max(maxItems, `At most ${maxItems} items`);

const statSchema = z.object({
  value: z.number().int().min(0).max(1_000_000),
  suffix: z.string().trim().max(3).optional(),
  label: text(30),
});

const workSchema = z.object({
  title: text(60),
  kind: text(24),
  description: text(160),
});

/** Fields of a domain the club can edit. id/dbKey/color stay fixed in code. */
export const domainContentSchema = z.object({
  id: z.enum(DOMAIN_IDS),
  name: text(40),
  shortName: text(14),
  tagline: text(90),
  description: text(400),
  whatYouDo: textList(120, 6),
  skills: textList(30, 8),
  tools: textList(30, 8),
  stats: z.array(statSchema).max(4),
  achievements: optionalTextList(140, 6),
  works: z.array(workSchema).max(6),
});

export const domainsContentSchema = z
  .array(domainContentSchema)
  .length(DOMAINS.length)
  .refine((list) => new Set(list.map((d) => d.id)).size === list.length, "Each domain must appear exactly once");

export const SECTION_SCHEMAS = {
  domains: domainsContentSchema,
} as const;

export type DomainContent = z.infer<typeof domainContentSchema>;

/** Saved edits for domains, laid over the fixed fields from code. */
export function mergeDomains(edits: readonly DomainContent[]): DomainInfo[] {
  const byId = new Map(edits.map((edit) => [edit.id, edit]));
  return DOMAINS.map((domain) => ({ ...domain, ...byId.get(domain.id) }));
}

/** The editable part of each domain, in display order. */
export function toDomainContent(domains: readonly DomainInfo[]): DomainContent[] {
  return domains.map(({ id, name, shortName, tagline, description, whatYouDo, skills, tools, stats, achievements, works }) => ({
    id,
    name,
    shortName,
    tagline,
    description,
    whatYouDo,
    skills,
    tools,
    stats,
    achievements,
    works,
  }));
}

/** Human-readable list of problems from a failed validation. */
export function describeIssues(error: z.ZodError): string[] {
  return error.issues.slice(0, 8).map((issue) => {
    const where = issue.path.length ? `${issue.path.join(" → ")}: ` : "";
    return `${where}${issue.message}`;
  });
}
