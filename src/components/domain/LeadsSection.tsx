"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { DomainInfo } from "@/data/domains";
import { useDomains } from "./ContentContext";
import type { Member } from "@/types/team";
import type { DomainCrew } from "./useDomainCrew";
import DomainEmblem from "./DomainEmblem";
import { domainHex, domainInk } from "./domainTheme";

// Flip cards for each domain's lead and co-lead, straight from the team
// database. Hidden entirely until at least one lead exists.

const LEAD_TIERS = new Set(["lead", "co-lead"]);
const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";
const FLIP_SPRING = { type: "spring", stiffness: 160, damping: 20 } as const;
const SKILLS_ON_CARD = 4;

interface LeadCardData {
  member: Member;
  domain: DomainInfo;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function collectLeads(crew: DomainCrew, domains: readonly DomainInfo[]): LeadCardData[] {
  return domains.flatMap((domain) =>
    (crew.membersByDomain[domain.dbKey] ?? [])
      .filter((member) => LEAD_TIERS.has(member.tier.trim().toLowerCase()))
      .map((member) => ({ member, domain })),
  );
}

const faceClass = "absolute inset-0 rounded-3xl border-2 border-black p-6 flex flex-col [backface-visibility:hidden]";

function LeadCard({ member, domain, index }: LeadCardData & { index: number }) {
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();
  // Mouse flips on hover; a mouse click shouldn't then flip it back.
  const lastPointer = useRef<string>("");
  const color = domainHex(domain);
  const ink = domainInk(domain);
  const hasPhoto = member.photoUrl?.startsWith(CLOUDINARY_PREFIX);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: index * 0.08 }}
    >
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`${member.name}, ${member.role || member.tier} of ${domain.name}. ${flipped ? "Showing" : "Show"} what ${domain.shortName} looks for.`}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onClick={(e) => {
          const mouseClick = e.detail > 0 && lastPointer.current === "mouse";
          if (!mouseClick) setFlipped((f) => !f);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
        className="relative block h-80 w-full cursor-pointer text-left outline-none rounded-3xl focus-visible:ring-4 focus-visible:ring-g-blue"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped && !reduceMotion ? 180 : 0 }}
          transition={FLIP_SPRING}
        >
          {/* Front */}
          <div className={`${faceClass} bg-white dark:bg-g-quite-black`} style={{ boxShadow: `6px 6px 0 ${color}` }}>
            <div className="flex items-start justify-between">
              {hasPhoto && member.photoUrl ? (
                <Image src={member.photoUrl} alt="" width={96} height={96} className="w-24 h-24 rounded-2xl object-cover border-2 border-black" />
              ) : (
                <span className="grid place-items-center w-24 h-24 rounded-2xl border-2 border-black text-3xl font-bold" style={{ backgroundColor: color, color: ink }}>
                  {initials(member.name)}
                </span>
              )}
              <DomainEmblem domainId={domain.id} size={48} />
            </div>
            <p className="mt-auto text-2xl font-bold text-gray-900 dark:text-white">{member.name}</p>
            <p className="mt-1 font-bold capitalize" style={{ color }}>
              {member.role || member.tier}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{domain.name}</p>
          </div>

          {/* Back */}
          <motion.div
            className={faceClass}
            style={{ backgroundColor: color, color: ink, transform: reduceMotion ? undefined : "rotateY(180deg)" }}
            initial={false}
            animate={reduceMotion ? { opacity: flipped ? 1 : 0 } : undefined}
          >
            <p className="text-sm font-bold uppercase tracking-widest opacity-80">What {domain.shortName} looks for</p>
            <p className="mt-3 text-xl font-bold leading-snug">{domain.tagline}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {domain.skills.slice(0, SKILLS_ON_CARD).map((skill) => (
                <span key={skill} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </button>
    </motion.div>
  );
}

const LeadsSection = ({ crew }: { crew: DomainCrew }) => {
  const domains = useDomains();
  if (crew.status !== "ready") return null;
  const leads = collectLeads(crew, domains);
  if (leads.length === 0) return null;

  return (
    <section id="leads" className="scroll-mt-16 bg-gray-50 dark:bg-black py-20 sm:py-28 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Meet the leads</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2" />
          <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">The people steering each domain. Hover or tap a card to flip it.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {leads.map((lead, i) => (
            <LeadCard key={lead.member._id} {...lead} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadsSection;
