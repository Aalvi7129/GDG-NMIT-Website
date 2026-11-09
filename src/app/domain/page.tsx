import type { Metadata } from "next";
import DomainExplorer from "@/components/domain/DomainExplorer";
import MotionPreferences from "@/components/MotionPreferences";
import { getSiteContent } from "@/lib/content/store";
import "@/styles/motion.css";

// Re-check saved content every 5 minutes; admin saves refresh it immediately.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Domains | GDG NMIT",
  description:
    "Explore the domains of GDG NMIT: Tech, Design, PR & Marketing, Sponsorship & Finance and Documentation. See what each domain does and how an event comes together.",
};

export default async function DomainPage() {
  const content = await getSiteContent();
  return (
    <MotionPreferences>
      <DomainExplorer content={content} />
    </MotionPreferences>
  );
}
