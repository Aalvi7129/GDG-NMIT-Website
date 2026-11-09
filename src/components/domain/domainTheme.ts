import { CodeXml, HandCoins, Megaphone, NotebookPen, Palette, type LucideIcon } from "lucide-react";
import { DOMAIN_COLOR_HEX, type DomainInfo } from "@/data/domains";

export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  tech: CodeXml,
  design: Palette,
  "pr-marketing": Megaphone,
  "scholarship-finance": HandCoins,
  documentation: NotebookPen,
};

export function domainHex(domain: DomainInfo): string {
  return DOMAIN_COLOR_HEX[domain.color];
}

/** Readable text colour on top of the domain's fill (yellow needs dark text). */
export function domainInk(domain: DomainInfo): string {
  return domain.color === "yellow" ? "#000000" : "#ffffff";
}
