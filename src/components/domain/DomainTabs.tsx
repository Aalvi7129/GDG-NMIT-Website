"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DomainInfo, DomainStat } from "@/data/domains";
import { domainHex, domainInk } from "./domainTheme";
import CountUp from "./CountUp";

const STAGGER = 0.06;

const popIn = (i: number) => ({
  initial: { opacity: 0, y: 14, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 380, damping: 22, delay: i * STAGGER },
});

function StatCounter({ stat, color }: { stat: DomainStat; color: string }) {
  return (
    <div className="rounded-2xl border-2 border-black dark:border-white/80 p-4 text-center" style={{ boxShadow: `4px 4px 0 ${color}` }}>
      <CountUp value={stat.value} suffix={stat.suffix} className="block text-3xl sm:text-4xl font-bold tabular-nums" style={{ color }} />
      <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
    </div>
  );
}

export function OverviewPanel({ domain }: { domain: DomainInfo }) {
  const color = domainHex(domain);

  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">{domain.description}</p>

      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">What you&apos;ll do</h3>
        <ul className="mt-3 space-y-2">
          {domain.whatYouDo.map((item, i) => (
            <motion.li key={item} {...popIn(i)} className="flex items-start gap-3 text-gray-700 dark:text-gray-200">
              <span className="mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-full" style={{ backgroundColor: color, color: domainInk(domain) }}>
                <Check aria-hidden className="w-4 h-4" strokeWidth={3} />
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Skills you&apos;ll build</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {domain.skills.map((skill, i) => (
            <motion.span
              key={skill}
              {...popIn(i)}
              whileHover={{ y: -3, rotate: i % 2 === 0 ? -3 : 3 }}
              className="rounded-full px-3.5 py-1.5 text-sm font-bold border-2 border-black"
              style={{ backgroundColor: color, color: domainInk(domain) }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Tools of the trade</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {domain.tools.map((tool, i) => (
            <motion.span
              key={tool}
              {...popIn(i + domain.skills.length)}
              className="rounded-lg px-3 py-1 text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            >
              {tool}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AchievementsPanel({ domain }: { domain: DomainInfo }) {
  const color = domainHex(domain);

  return (
    <div className="space-y-6">
      {domain.stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {domain.stats.map((stat) => (
            <StatCounter key={stat.label} stat={stat} color={color} />
          ))}
        </div>
      )}
      <ul className="space-y-3">
        {domain.achievements.map((item, i) => (
          <motion.li
            key={item}
            {...popIn(i + 2)}
            whileHover={{ x: 6 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-700 border-l-8 p-4 text-gray-800 dark:text-gray-100"
            style={{ borderLeftColor: color }}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function WorksPanel({ domain }: { domain: DomainInfo }) {
  const color = domainHex(domain);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {domain.works.map((work, i) => (
        <motion.article
          key={work.title}
          {...popIn(i)}
          whileHover={{ y: -6, rotate: i % 2 === 0 ? -1 : 1, boxShadow: `8px 8px 0 ${color}` }}
          className="rounded-2xl border-2 border-black dark:border-white/80 bg-white dark:bg-g-almost-black p-5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#5f6368]"
        >
          <span className="inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: color, color: domainInk(domain) }}>
            {work.kind}
          </span>
          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{work.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{work.description}</p>
        </motion.article>
      ))}
    </div>
  );
}
