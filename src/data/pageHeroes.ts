// Title text for the top of the Domains page (see components/PageHero.tsx).
// Edit the words here; colours are Google blue / red / yellow / green.

import { DOMAIN_COLOR_HEX } from "./domains";

export interface PageHeroCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  color: string;
}

export const PAGE_HEROES = {
  domains: {
    eyebrow: "Five crafts, one club",
    title: "Our domains",
    subtitle: "Tech, Design, PR & Marketing, Sponsorship & Finance and Documentation. Play with them below, then dive into each one.",
    color: DOMAIN_COLOR_HEX.red,
  },
} satisfies Record<string, PageHeroCopy>;
