"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import DomainEmblem from "@/components/domain/DomainEmblem";
import { DOMAINS, DOMAIN_COLOR_HEX, type DomainInfo } from "@/data/domains";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const STAGGER_SECONDS = 0.07;
const HERO_SKILL_COUNT = 4;

type TileSize = "hero" | "wide" | "compact";

// Bento placement, in the order of DOMAINS: Tech gets the big tile.
const LAYOUT: Record<string, { size: TileSize; className: string }> = {
  tech: { size: "hero", className: "md:col-span-2 lg:col-span-3 lg:row-span-2" },
  design: { size: "wide", className: "lg:col-span-3" },
  "pr-marketing": { size: "wide", className: "lg:col-span-3" },
  "scholarship-finance": { size: "compact", className: "lg:col-span-2" },
  documentation: { size: "wide", className: "lg:col-span-4" },
};

const EMBLEM_PX: Record<TileSize, number> = { hero: 136, wide: 92, compact: 92 };
// Smaller emblems on phones keep the stacked tiles compact.
const EMBLEM_CLASS: Record<TileSize, string> = {
  hero: "size-24 sm:size-[136px]",
  wide: "size-16 sm:size-[92px]",
  compact: "size-16 sm:size-[92px]",
};

const pad = (n: number) => String(n).padStart(2, "0");

interface TileProps {
  domain: DomainInfo;
  index: number;
  size: TileSize;
  className: string;
}

const DomainTile = ({ domain, index, size, className }: TileProps) => {
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();
  const color = DOMAIN_COLOR_HEX[domain.color];
  const isHero = size === "hero";
  const isWide = size === "wide";

  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: index * STAGGER_SECONDS }}
      className={className}
    >
      <Link
        href={`/domain#${domain.id}`}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        style={{ "--tile": color } as React.CSSProperties}
        className={`group relative flex h-full overflow-hidden rounded-2xl border-2 border-black bg-white p-5 text-left
          shadow-[6px_6px_0_#000] transition-[transform,box-shadow] duration-200 ease-out
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0_#000]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-g-blue focus-visible:ring-offset-4
          dark:border-white/20 dark:bg-g-quite-black dark:shadow-[6px_6px_0_var(--tile)] dark:hover:shadow-[10px_10px_0_var(--tile)] dark:active:shadow-[4px_4px_0_var(--tile)] dark:focus-visible:ring-offset-g-almost-black
          sm:p-7 ${isHero ? "flex-col justify-between gap-6 sm:gap-8 lg:p-9" : isWide ? "flex-col gap-4 sm:flex-row sm:items-center sm:gap-7" : "flex-col gap-4 sm:gap-5"}`}
      >
        {/* Colour wash in the corner that swells on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 size-56 rounded-full opacity-15 transition-transform duration-500 ease-out group-hover:scale-125 dark:opacity-20"
          style={{ backgroundColor: color }}
        />
        {isHero && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,#ececec_1px,transparent_1px),linear-gradient(to_bottom,#ececec_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] dark:[background-image:linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)]"
            style={{ backgroundSize: "36px 36px" }}
          />
        )}

        <div className={`relative flex items-start justify-between gap-4 ${isWide ? "sm:flex-none" : ""}`}>
          <DomainEmblem domainId={domain.id} active={active} size={EMBLEM_PX[size]} className={`flex-none ${EMBLEM_CLASS[size]}`} />
          {!isWide && (
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400" aria-hidden>
              {pad(index + 1)}
            </span>
          )}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <h3
            className={`font-bold text-gray-900 dark:text-white ${isHero ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
          >
            {domain.name}
          </h3>
          <p className="mt-1 text-sm font-medium sm:text-base" style={{ color }}>
            {domain.tagline}
          </p>
          {size !== "compact" && (
            <p
              className={`mt-3 text-gray-700 dark:text-gray-300 ${isHero ? "text-base leading-relaxed sm:text-lg" : "text-sm leading-relaxed sm:text-base"}`}
            >
              {domain.description}
            </p>
          )}
          {isHero && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${domain.name} skills`}>
              {domain.skills.slice(0, HERO_SKILL_COUNT).map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-black/15 bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 sm:text-sm"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isWide && (
          <ArrowUpRight
            aria-hidden
            className="absolute right-5 top-5 size-5 text-gray-400 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        )}
      </Link>
    </motion.li>
  );
};

const Domain = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-white dark:bg-g-almost-black">
      <div className="pt-8 px-8 sm:pt-12 sm:px-12 lg:pt-16 lg:px-16 xl:px-20 mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h2
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white"
          >
            Domains
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
            className="h-1 w-20 origin-left bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2"
          />
        </div>
        <Link
          href="/domain"
          className="group inline-flex items-center gap-1.5 rounded-full border border-g-gray/60 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200 hover:border-transparent hover:bg-g-blue hover:text-white active:scale-[0.97]"
        >
          Explore domains
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>

      <div className="pt-6 pb-16 px-8 sm:px-12 lg:px-16 xl:px-20">
        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
          {DOMAINS.map((domain, index) => {
            const placement = LAYOUT[domain.id] ?? { size: "wide" as const, className: "lg:col-span-3" };
            return (
              <DomainTile
                key={domain.id}
                domain={domain}
                index={index}
                size={placement.size}
                className={placement.className}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Domain;
