"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const highlights = [
  {
    title: "Hands-on Workshops",
    description:
      "Run by Googlers, alumni, and industry mentors to help members ship projects and learn by doing.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M754-81q-8 0-15-2.5T726-92L522-296q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l85-85q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l204 204q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13l-85 85q-6 6-13 8.5T754-81Zm-549 1q-8 0-15.5-3T176-92l-84-84q-6-6-9-13.5T80-205q0-8 3-15t9-13l212-212h85l34-34-165-165h-57L80-765l113-113 121 121v57l165 165 116-116-43-43 56-56H495l-28-28 142-142 28 28v113l56-56 142 142q17 17 26 38.5t9 45.5q0 24-9 46t-26 39l-85-85-56 56-42-42-207 207v84L233-92q-6 6-13 9t-15 3Z" />
      </svg>
    ),
    accent: { bg: "bg-g-blue", fg: "text-white" },
  },
  {
    title: "Study Jams & Sprints",
    description:
      "Collaborative learning tracks across Android, web, cloud, and AI that end with showcase nights.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="m98-537 168-168q14-14 33-20t39-2l52 11q-54 64-85 116t-60 126L98-537Zm205 91q23-72 62.5-136T461-702q88-88 201-131.5T873-860q17 98-26 211T716-448q-55 55-120 95.5T459-289L303-446Zm276-120q23 23 56.5 23t56.5-23q23-23 23-56.5T692-679q-23-23-56.5-23T579-679q-23 23-23 56.5t23 56.5ZM551-85l-64-147q74-29 126.5-60T730-377l10 52q4 20-2 39.5T718-252L551-85ZM162-318q35-35 85-35.5t85 34.5q35 35 35 85t-35 85q-25 25-83.5 43T87-74q14-103 32-161t43-83Z" />
      </svg>
    ),
    accent: { bg: "bg-g-green", fg: "text-white" },
  },
  {
    title: "Inclusive Community",
    description:
      "An open, supportive space where every background, skill level, and perspective adds to the story.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M40-160v-160q0-34 23.5-57t56.5-23h131q20 0 38 10t29 27q29 39 71.5 61t90.5 22q49 0 91.5-22t70.5-61q13-17 30.5-27t36.5-10h131q34 0 57 23t23 57v160H640v-91q-35 25-75.5 38T480-200q-43 0-84-13.5T320-252v92H40Zm440-160q-38 0-72-17.5T351-386q-17-25-42.5-39.5T253-440q22-37 93-58.5T480-520q63 0 134 21.5t93 58.5q-29 0-55 14.5T609-386q-22 32-56 49t-73 17ZM160-440q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T280-560q0 50-34.5 85T160-440Zm640 0q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T920-560q0 50-34.5 85T800-440ZM480-560q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-680q0 50-34.5 85T480-560Z" />
      </svg>
    ),
    accent: { bg: "bg-g-yellow", fg: "text-white" },
  },
  {
    title: "Campus Impact",
    description:
      "From flagship fests to micro-meetups, we energise the campus with tech experiments and inspiration.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M852-212 732-332l56-56 120 120-56 56ZM708-692l-56-56 120-120 56 56-120 120Zm-456 0L132-812l56-56 120 120-56 56ZM108-212l-56-56 120-120 56 56-120 120Zm125 92 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
      </svg>
    ),
    accent: { bg: "bg-g-red", fg: "text-white" },
  },
];

const About = () => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      // Ensure body scroll is restored on unmount
      document.body.style.overflow = "auto";
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(false));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-close-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-10 w-10 z-[101] shadow-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setActive(false)}
              aria-label="Close"
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-image-${id}`}
              ref={ref}
              className="w-full max-w-[1000px] max-h-[80vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="/assets/img3.webp"
                  alt="Speaker presenting at a GDG NMIT session"
                  width={1000}
                  height={700}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="pt-16 bg-white dark:bg-g-almost-black text-neutral-900 dark:text-neutral-100 font-sans">
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <header className="max-w-3xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 mb-3">
              Who We Are
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              About Us
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-3"></div>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              GDG NMIT is a vibrant developer-led community where curiosity meets
              craft. We build together, learn out loud, and make space for ideas
              that push campus innovation forward.
            </p>
          </header>

          <div className="space-y-12">
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] items-start">
              <aside className="order-1 lg:order-2 lg:pl-6">
                <motion.div 
                  layoutId={`card-image-${id}`}
                  className="relative w-full max-w-[500px] mx-auto lg:mx-0 cursor-pointer group"
                  onClick={() => setActive(true)}
                >
                  <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-g-blue/20 via-g-yellow/20 to-g-red/20 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>

                  <div className="relative rounded-[28px] overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src="/assets/img3.webp"
                      alt="Speaker presenting at a GDG NMIT session"
                      width={500}
                      height={667}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </motion.div>
              </aside>

              <article className="order-2 lg:order-1 space-y-8 text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <p>
                  From ideation jams to production-ready launches, our members
                  explore the full stack of Google technologies. We design
                  sessions that demystify the latest tooling and transform
                  inspiration into working prototypes.
                </p>
                <p>
                  Collaboration sits at the centre of our culture. Designers
                  sketch alongside developers, cloud engineers pair with ML
                  enthusiasts, and newcomers find mentors who help them chart a
                  confident learning path.
                </p>
                <p>
                  Beyond the code, GDG NMIT celebrates people. We cultivate
                  psychological safety, champion diverse voices, and host
                  gatherings that feel as energising as they are educational. If
                  you have an idea, a question, or a breakthrough to share, there
                  is a seat for you here.
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-g-almost-black/60 p-6"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`inline-flex w-12 aspect-square items-center justify-center rounded-full ${item.accent.bg} shrink-0`}
                          aria-hidden="true"
                        >
                          <span className={`text-xl ${item.accent.fg}`}>
                            {item.icon}
                          </span>
                        </span>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;