"use client";
import React, { useState } from "react";
import Image from "next/image";

const Domain = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const domains = [
    {
      src: "/assets/tech-domain.svg",
      alt: "Tech Domain",
      w: 440,
      h: 310.5,
      name: "Technical",
      description:
        "Building cutting-edge solutions, organizing workshops, and driving technical excellence through innovation and collaboration.",
      color: "border-g-green",
    },
    {
      src: "/assets/design-domain.svg",
      alt: "Design Domain",
      w: 344,
      h: 142,
      name: "Design",
      description:
        "Crafting beautiful experiences through UI/UX design, branding, and creative content that inspire and engage users.",
      color: "border-g-blue",
    },
    {
      src: "/assets/social-domain.svg",
      alt: "Social Media Domain",
      w: 500.5,
      h: 169,
      name: "Social Media",
      description:
        "Engaging our community across platforms and amplifying our presence online through creative campaigns and storytelling.",
      color: "border-g-yellow",
    },
    {
      src: "/assets/content-domain.svg",
      alt: "Content Domain",
      w: 484,
      h: 212,
      name: "Content & Documentation",
      description:
        "Creating engaging stories, blogs, and documentation to inspire and educate the community with clarity and creativity.",
      color: "border-g-red",
    },
    {
      src: "/assets/pr-domain.svg",
      alt: "PR Domain",
      w: 444,
      h: 212,
      name: "PR & Marketing",
      description:
        "Building relationships, managing communications, and amplifying our message to the world with strategy and impact.",
      color: "border-g-green",
    },
    {
      src: "/assets/operations-domain.svg",
      alt: "Operations Domain",
      w: 474,
      h: 142,
      name: "Operations",
      description:
        "Orchestrating amazing events, hackathons, and meetups that bring the community together with seamless execution.",
      color: "border-g-blue",
    },
  ];

  return (
    <section className="min-h-screen bg-white dark:bg-g-almost-black">
      <div className="pt-8 px-8 sm:pt-12 sm:px-12 lg:pt-16 lg:px-16 xl:px-20 mb-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          Domains
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2"></div>
      </div>

      <div className="pt-6 pb-12 px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
          {domains.map((domain, index) => (
            <div
              key={domain.alt}
              className="relative flex items-center justify-center h-[280px] sm:h-[300px] md:h-[280px] lg:h-[360px] group cursor-pointer overflow-visible"
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Domain Image - visible by default, hidden on hover/tap */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
                  activeIndex === index ? "opacity-0" : "group-hover:opacity-0"
                }`}
              >
                <Image
                  src={domain.src}
                  alt={domain.alt}
                  width={domain.w}
                  height={domain.h}
                  className="object-contain"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>

              {/* Domain Description Card - hidden by default, visible on hover/tap */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ease-in-out flex items-center justify-center p-4 sm:p-6 md:p-5 lg:p-8 ${
                  activeIndex === index
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div
                  className="w-full h-full rounded-xl border-2 border-black bg-white p-6 sm:p-7 md:p-6 lg:p-8 flex flex-col justify-center"
                  style={{
                    boxShadow: `-12px 12px 0px ${
                      domain.color === "border-g-blue"
                        ? "#4285F4"
                        : domain.color === "border-g-red"
                        ? "#EA4335"
                        : domain.color === "border-g-yellow"
                        ? "#FBBC04"
                        : "#34A853"
                    }`,
                  }}
                >
                  <h3 className="text-2xl sm:text-3xl md:text-xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-3 lg:mb-4">
                    {domain.name}
                  </h3>
                  <p className="text-lg sm:text-xl md:text-base lg:text-xl text-gray-700 leading-relaxed sm:leading-normal md:leading-relaxed lg:leading-snug">
                    {domain.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Domain;
