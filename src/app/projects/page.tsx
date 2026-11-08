"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import Loader from "@/components/Loader";

const projects = [
  {
    id: "1",
    color: "#FFD43B",
    imageSrc: "/team1.png",
    title: "Project 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    id: "2",
    color: "#74ACFF",
    imageSrc: "/team2.png",
    title: "Project 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    id: "3",
    color: "#27C5A1",
    imageSrc: "/team3.png",
    title: "Project 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    id: "4",
    color: "#FF9F68",
    imageSrc: "/team2.png",
    title: "Project 4",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    id: "5",
    color: "#FFD43B",
    imageSrc: "/team1.png",
    title: "Project 5",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
];

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isHoverDisabled, setIsHoverDisabled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = () => {
    if (currentIndex < projects.length - 3) setCurrentIndex(currentIndex + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (isLoading) {
    return <Loader className="fixed inset-0 z-[9999] bg-white dark:bg-g-almost-black" />;
  }

  return (
    <div className="relative min-h-screen flex flex-col px-10 py-20 bg-grid overflow-hidden">
      <div className="pt-4 px-8 sm:px-12 lg:px-16 xl:px-20 mb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2"></div>
      </div>

      {/* Carousel */}
      <div className="relative w-full max-w-9xl flex items-center justify-center mt-8">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          onMouseEnter={() => setIsHoverDisabled(true)}
          onMouseLeave={() => setIsHoverDisabled(false)}
          disabled={currentIndex === 0}
          className={`absolute left-0 z-20 bg-gray-200 hover:bg-gray-300 p-3 rounded-full shadow transition ${
            currentIndex === 0 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Track - Show 3 cards at a time */}
        <div className="overflow-visible w-full max-w-5xl px-8">
          <motion.div
            className="flex gap-10 transition-transform duration-300"
            animate={{ x: `-${currentIndex * 350}px` }}
          >
            {projects.map((p, index) => {
              // Default: middle visible card is "active"
              const middleVisibleIndex = currentIndex + 1;

              // Determine which card should be large
              const isFocused = focusedIndex === index;
              const isCenter =
                focusedIndex === null && index === middleVisibleIndex;

              const scale = isFocused || isCenter ? 1.15 : 0.9;
              const zIndex = isFocused || isCenter ? 10 : 5;

              return (
                <motion.div
                  key={p.id}
                  animate={{ scale }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ zIndex }}
                  onMouseEnter={() => {
                    if (!isHoverDisabled) setFocusedIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (!isHoverDisabled) setFocusedIndex(null);
                  }}
                >
                  <ProjectCard
                    {...p}
                    isActive={focusedIndex === index}
                    onHover={() => {
                      if (!isHoverDisabled) setHoveredIndex(index);
                    }}
                    onLeave={() => setFocusedIndex(null)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          onMouseEnter={() => setIsHoverDisabled(true)}
          onMouseLeave={() => setIsHoverDisabled(false)}
          disabled={currentIndex === projects.length - 3}
          className={`absolute right-0 z-20 bg-gray-200 hover:bg-gray-300 p-3 rounded-full shadow transition ${
            currentIndex === projects.length - 3
              ? "opacity-40 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
