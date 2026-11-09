// Single source of truth for the GDG NMIT domains.
// Used by the home page section (components/Domain.tsx) and the /domain page.
//
// `stats`, `achievements` and `works` start empty: the club adds real ones in
// /admin. The Domains page hides those tabs until a domain has some.

export type DomainColor = "blue" | "red" | "yellow" | "green";

export const DOMAIN_COLOR_HEX: Record<DomainColor, string> = {
  blue: "#4285f4",
  red: "#ea4335",
  yellow: "#f9ab00",
  green: "#34a853",
};

export interface DomainStat {
  value: number;
  suffix?: string;
  label: string;
}

export interface DomainWork {
  title: string;
  kind: string;
  description: string;
}

export interface DomainInfo {
  /** URL-safe id. */
  id: string;
  /** Key used for this domain in the members collection (see api/teams). */
  dbKey: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  color: DomainColor;
  whatYouDo: string[];
  skills: string[];
  tools: string[];
  stats: DomainStat[];
  achievements: string[];
  works: DomainWork[];
}

export const DOMAINS: readonly DomainInfo[] = [
  {
    id: "tech",
    dbKey: "tech",
    name: "Tech",
    shortName: "Tech",
    tagline: "We ship the things we talk about.",
    description:
      "Building cutting-edge solutions, organizing workshops, and driving technical excellence through innovation and collaboration.",
    color: "green",
    whatYouDo: [
      "Build and maintain club projects and this website",
      "Run hands-on workshops and study jams",
      "Mentor juniors through hackathons",
    ],
    skills: ["Web & App Dev", "Cloud", "AI / ML", "Open Source", "Problem Solving"],
    tools: ["Next.js", "Flutter", "Firebase", "Google Cloud", "GitHub"],
    stats: [],
    achievements: [],
    works: [],
  },
  {
    id: "design",
    dbKey: "design",
    name: "Design",
    shortName: "Design",
    tagline: "If it looks good, we probably touched it.",
    description:
      "Crafting beautiful experiences through UI/UX design, branding, and creative content that inspire and engage users.",
    color: "blue",
    whatYouDo: [
      "Design posters, banners and event branding",
      "Prototype UI/UX for club products",
      "Keep the GDG look consistent everywhere",
    ],
    skills: ["UI/UX", "Visual Design", "Branding", "Motion", "Illustration"],
    tools: ["Figma", "Illustrator", "Photoshop", "Canva", "After Effects"],
    stats: [],
    achievements: [],
    works: [],
  },
  {
    id: "pr-marketing",
    dbKey: "pr & marketing",
    name: "PR & Marketing",
    shortName: "PR",
    tagline: "Getting the right people in the room.",
    description:
      "Building relationships, managing communications, and amplifying our message to the world with strategy and impact.",
    color: "yellow",
    whatYouDo: [
      "Reach out to speakers, partners and communities",
      "Run campaigns across Instagram and LinkedIn",
      "Represent GDG NMIT outside campus",
    ],
    skills: ["Communication", "Outreach", "Social Media", "Strategy", "Public Speaking"],
    tools: ["Instagram", "LinkedIn", "Canva", "Google Sheets", "Google Forms"],
    stats: [],
    achievements: [],
    works: [],
  },
  {
    id: "scholarship-finance",
    dbKey: "scholarship and finance",
    name: "Sponsorship & Finance",
    shortName: "Finance",
    tagline: "Keeping ideas funded and doors open.",
    description:
      "Securing sponsorships, managing budgets, and bringing scholarships and opportunities to members so every idea has the resources it needs.",
    color: "red",
    whatYouDo: [
      "Plan and track budgets for every event",
      "Pitch to sponsors and manage sponsor relationships",
      "Find and share scholarships and opportunities with members",
    ],
    skills: ["Budgeting", "Sponsorship Pitching", "Negotiation", "Spreadsheets", "Research"],
    tools: ["Google Sheets", "Excel", "Google Forms", "Canva", "Notion"],
    stats: [],
    achievements: [],
    works: [],
  },
  {
    id: "documentation",
    dbKey: "content and documentation",
    name: "Documentation",
    shortName: "Docs",
    tagline: "If it isn't written down, it didn't happen.",
    description:
      "Creating clear documentation, event reports, and guides so the community can learn from everything we do.",
    color: "blue",
    whatYouDo: [
      "Write event reports and recaps",
      "Document projects, workshops and processes",
      "Keep the club's knowledge base up to date",
    ],
    skills: ["Technical Writing", "Editing", "Research", "Storytelling", "Organisation"],
    tools: ["Google Docs", "Notion", "Markdown", "GitHub", "Grammarly"],
    stats: [],
    achievements: [],
    works: [],
  },
];

export function findDomain(id: string | null | undefined): DomainInfo | undefined {
  return DOMAINS.find((domain) => domain.id === id);
}
