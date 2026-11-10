"use client";
import React, { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import type { SiteContent } from "@/lib/content/defaults";
import { ContentProvider } from "./ContentContext";
import DomainPlayground from "./DomainPlayground";
import PageHero from "@/components/PageHero";
import { PAGE_HEROES } from "@/data/pageHeroes";
import DomainDetail from "./DomainDetail";
import SkillConstellation from "./constellation/SkillConstellation";
import LeadsSection from "./LeadsSection";
import DinoEasterEgg from "./dino/DinoEasterEgg";
import { useDomainCrew } from "./useDomainCrew";

const DEEP_LINK_SCROLL_DELAY_MS = 300;

function scrollToDetail() {
  // A jump instead of a glide for visitors who'd rather not see the page move.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("explore")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

const DomainExplorer = ({ content }: { content: SiteContent }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const findDomain = useCallback((id: string | null) => content.domains.find((d) => d.id === id), [content.domains]);
  const crew = useDomainCrew();

  // Open a domain's details and scroll to them: from the playground (a tap or
  // a throw into the black hole), or a deep link like /domain#tech (home page cards).
  const pickAndScroll = useCallback((id: string) => {
    setSelectedId(id);
    scrollToDetail();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const openFromHash = () => {
      // Domain ids are URL-safe, so no decoding (decodeURIComponent throws on a malformed "%").
      const id = window.location.hash.slice(1);
      if (!findDomain(id)) return;
      setSelectedId(id);
      // Wait for the router's own scroll-to-top after navigation, then scroll down.
      clearTimeout(timer);
      timer = setTimeout(scrollToDetail, DEEP_LINK_SCROLL_DELAY_MS);
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [findDomain]);

  return (
    <ContentProvider content={content}>
    <MotionConfig reducedMotion="user">
      <div className="pt-16">
        <PageHero {...PAGE_HEROES.domains} />
      </div>
      <SkillConstellation onOpenDomain={pickAndScroll} />
      <DomainPlayground onPick={pickAndScroll} />

      {/* The picked domain's details, right under the playground */}
      <section id="explore" className="scroll-mt-20 bg-white dark:bg-g-almost-black px-4 sm:px-8 lg:px-12 pb-16 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <DomainDetail domain={findDomain(selectedId)} />
        </div>
      </section>

      <LeadsSection crew={crew} />
      <DinoEasterEgg />
    </MotionConfig>
    </ContentProvider>
  );
};

export default DomainExplorer;
