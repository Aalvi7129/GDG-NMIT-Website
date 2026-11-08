"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  color: string;
  imageSrc: string;
  title: string;
  description: string;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}

export default function ProjectCard({
  id,
  color,
  imageSrc,
  title,
  description,
  isActive,
  onHover,
  onLeave,
}: ProjectCardProps) {
  const router = useRouter();

  return (
    // 🔹 Fixed-size outer container — prevents overlap when scaling
    <div className="relative w-[320px] flex justify-center items-center">
      <motion.div
        animate={{ scale: isActive ? 1.15 : 1 }} // smooth scaling
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.1,
        }}
        onClick={() => router.push(`/projects/${id}`)}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{ transformOrigin: "center center" }}
        className="relative cursor-pointer rounded-2xl shadow-md overflow-hidden bg-white w-[280px] transition-all duration-150 hover:shadow-xl"
      >
        {/* Team image above card */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
          <Image
            src={imageSrc}
            alt="Team"
            width={180}
            height={180}
            className="object-contain"
          />
        </div>

        {/* Top colored part */}
        <div className="h-36" style={{ backgroundColor: color }}></div>

        {/* Bottom content */}
        <div className="p-5 mt-16">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          <div className="flex gap-2 mb-3">
            <span className="bg-gray-200 text-xs px-3 py-1 rounded">xyx</span>
            <span className="bg-gray-200 text-xs px-3 py-1 rounded">xyx</span>
          </div>

          <button className="text-sm font-medium text-gray-800 hover:underline flex items-center gap-1">
            Learn More →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
