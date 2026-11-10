"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { DomainInfo } from "@/data/domains";
import { EASE_OUT, SPRING_PLAYFUL, SPRING_UI } from "@/lib/motion";
import { domainHex, domainInk } from "./domainTheme";
import { AchievementsPanel, OverviewPanel, WorksPanel } from "./DomainTabs";
import DomainSignature from "./DomainSignature";

const NO_MOTION = { duration: 0 } as const;
const CLOSE = { duration: 0.15, ease: EASE_OUT } as const;

// Tabs cross-fade (old and new panel overlap briefly, no waiting for one to
// leave). Switching with the arrow keys is instant, like any keyboard action.
const PANEL_FADE_S = 0.15;
const panelVariants: Variants = {
  hidden: (instant: boolean) => ({ opacity: 0, transition: instant ? NO_MOTION : { duration: PANEL_FADE_S, ease: EASE_OUT } }),
  shown: (instant: boolean) => ({ opacity: 1, transition: instant ? NO_MOTION : { duration: PANEL_FADE_S, ease: EASE_OUT } }),
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "achievements", label: "Achievements" },
  { id: "works", label: "Works" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Overview always; Achievements and Works only once the club has added some. */
function tabsFor(domain: DomainInfo) {
  return TABS.filter(({ id }) => {
    if (id === "achievements") return domain.stats.length > 0 || domain.achievements.length > 0;
    if (id === "works") return domain.works.length > 0;
    return true;
  });
}

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: CLOSE }}
      transition={SPRING_UI}
      className="rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 sm:p-10 text-center"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pick a domain to begin</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Drag a domain into the black hole, or just tap one, to see what it does and the skills it builds.
      </p>
    </motion.div>
  );
}

function TabPanel({ tab, domain }: { tab: TabId; domain: DomainInfo }) {
  switch (tab) {
    case "overview":
      return <OverviewPanel domain={domain} />;
    case "achievements":
      return <AchievementsPanel domain={domain} />;
    case "works":
      return <WorksPanel domain={domain} />;
  }
}

interface DomainDetailProps {
  domain: DomainInfo | undefined;
}

const TAB_KEY_OFFSETS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

const DomainDetail = ({ domain }: DomainDetailProps) => {
  const [tab, setTab] = useState<TabId>("overview");
  // Whether the last tab change came from the keyboard (then nothing animates).
  const [byKeyboard, setByKeyboard] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = domain ? tabsFor(domain) : TABS;
  // A domain without the picked tab's content falls back to Overview.
  const activeTab: TabId = tabs.some(({ id }) => id === tab) ? tab : "overview";
  const showTabs = tabs.length > 1;

  // WAI-ARIA tabs pattern: arrows/Home/End move between tabs and activate them.
  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const offset = TAB_KEY_OFFSETS[event.key];
    const target =
      event.key === "Home" ? 0 : event.key === "End" ? last : offset !== undefined ? (index + offset + tabs.length) % tabs.length : -1;
    if (target < 0) return;
    event.preventDefault();
    setByKeyboard(true);
    setTab(tabs[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <AnimatePresence mode="wait">
      {!domain ? (
        <EmptyState />
      ) : (
        <motion.article
          key={domain.id}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97, transition: CLOSE }}
          transition={SPRING_UI}
          className="rounded-3xl border-2 border-black dark:border-white/80 bg-white dark:bg-g-quite-black p-5 sm:p-8"
          style={{ boxShadow: `10px 10px 0 ${domainHex(domain)}` }}
          aria-labelledby="domain-detail-title"
        >
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              {/* h2: the page's h1 is the hero, and nothing between them is a heading. */}
              <h2 id="domain-detail-title" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {domain.name}
              </h2>
              <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">{domain.tagline}</p>
            </div>
            <motion.div
              initial={{ rotate: 12, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ ...SPRING_PLAYFUL, delay: 0.1 }}
              className="shrink-0"
            >
              <DomainSignature domain={domain} />
            </motion.div>
          </header>

          {showTabs && (
          <div role="tablist" aria-label={`${domain.name} details`} className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-gray-100 dark:bg-black/60 p-1.5">
            {tabs.map(({ id, label }, index) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`domain-tab-${id}`}
                  aria-selected={isActive}
                  aria-controls="domain-tab-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => {
                    setByKeyboard(false);
                    setTab(id);
                  }}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className="relative flex-1 min-w-[45%] sm:min-w-0 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
                  style={{ color: isActive ? domainInk(domain) : undefined }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="domain-tab-pill"
                      className="absolute inset-0 rounded-xl border-2 border-black"
                      style={{ backgroundColor: domainHex(domain) }}
                      transition={byKeyboard ? NO_MOTION : SPRING_UI}
                    />
                  )}
                  <span className={`relative inline-flex items-center justify-center gap-1.5 ${isActive ? "" : "text-gray-600 dark:text-gray-300"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          )}

          {/* One grid cell, so the leaving and arriving panels overlap while they cross-fade. */}
          <div
            id="domain-tab-panel"
            role={showTabs ? "tabpanel" : undefined}
            aria-labelledby={showTabs ? `domain-tab-${activeTab}` : undefined}
            className={`mt-6 grid ${showTabs ? "min-h-[280px]" : ""}`}
          >
            <AnimatePresence initial={false} custom={byKeyboard}>
              <motion.div
                key={`${domain.id}-${activeTab}`}
                className="[grid-area:1/1]"
                custom={byKeyboard}
                variants={panelVariants}
                initial="hidden"
                animate="shown"
                exit="hidden"
              >
                <TabPanel tab={activeTab} domain={domain} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  );
};

export default DomainDetail;
