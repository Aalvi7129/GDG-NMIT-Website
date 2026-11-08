"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { FaInstagram, FaLinkedin, FaFacebookSquare, FaGithub } from "react-icons/fa";

// Constants
const JUMP_HEIGHT = -80;
let JUMP_DURATION = 0.5;
const OBSTACLE_MIN_DELAY = 3000;
const OBSTACLE_MAX_DELAY = 5000;
const CLOUD_SPAWN_CHANCE = 0.2;
const BIRD_SPAWN_CHANCE = 0.4;
const BIRD_SPACING = 30;
const GRID_ANIMATION_DURATION = 8;
let COLLISION_OFFSETS = { start: 120, end: 50 };
let adjustedDuration = 5;

const preloadedImages = {
  dino1: null as HTMLImageElement | null,
  dino2: null as HTMLImageElement | null,
  dino3: null as HTMLImageElement | null,
  cloud: null as HTMLImageElement | null,
  bird: null as HTMLImageElement | null,
  cactus: null as HTMLImageElement | null,
};

const preloadImages = () => {
  if (typeof window === 'undefined') return;
  
  const imagesToPreload = [
    { key: 'dino1', src: '/assets/dino_frame1.png' },
    { key: 'dino2', src: '/assets/dino_frame2.png' },
    { key: 'dino3', src: '/assets/dino_frame3.png' },
    { key: 'cloud', src: '/assets/cloud.png' },
    { key: 'bird', src: '/assets/bird.png' },
    { key: 'cactus', src: '/assets/vector_light.png' },
  ];

  imagesToPreload.forEach(({ key, src }) => {
    if (!preloadedImages[key as keyof typeof preloadedImages]) {
      const img = new window.Image();
      img.src = src;
      preloadedImages[key as keyof typeof preloadedImages] = img;
    }
  });
};

export default function HomeScreen() {
  const dinoRef = useRef<HTMLDivElement>(null);
  const obstaclesRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);
  const activeBirds = useRef<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const spawnActive = useRef(true);
  const spawnTimeout = useRef<number | null>(null);
  const gridTweenRef = useRef<gsap.core.Tween | null>(null);
  const idleTweenRef = useRef<gsap.core.Tween | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // preload assets
  useEffect(() => {
    preloadImages();
    const timer = setTimeout(() => setImagesLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    const animateDino = () => {
      setCurrentFrame((prev) => (prev % 3) + 1);
      animFrameRef.current = window.setTimeout(animateDino, 100);
    };

    animateDino();

    return () => {
      if (animFrameRef.current) {
        window.clearTimeout(animFrameRef.current);
      }
    };
  }, [imagesLoaded]);

  useEffect(() => {
    if (!imagesLoaded) return;
    gridTweenRef.current = gsap.to(gridRef.current, {
      backgroundPosition: "200px 200px",
      duration: GRID_ANIMATION_DURATION,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    const dinoJump = () => {
      if (isJumping.current || !dinoRef.current) return;

      isJumping.current = true;

      gsap.to(dinoRef.current, {
        y: JUMP_HEIGHT,
        duration: JUMP_DURATION,
        ease: "power1.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          isJumping.current = false;
        },
      });
    };

    const spawnObstacle = () => {
      if (!spawnActive.current) return;

      spawnTimeout.current = null;
      const obstacle = document.createElement("div");
      obstacle.className = "absolute";
      obstaclesRef.current?.appendChild(obstacle);

      const rand = Math.random();
      let imgSrc = "";
      let width = 40;
      let height = 64;
      let bottomPos = 0;
      let isBird = false;
      let isCloud = false;

      if (rand < CLOUD_SPAWN_CHANCE) {
        imgSrc = "/assets/cloud.png";
        width = 100 + Math.random() * 50;
        height = 60;
        bottomPos = 200 + Math.random() * 50;
        isCloud = true;
      } else if (rand < BIRD_SPAWN_CHANCE) {
        imgSrc = "/assets/bird.png";
        width = 64;
        height = 40;
        isBird = true;

        const cactusLeft = 120;
        const cactusWidth = 40;
        const cactusMargin = 80;

        let tries = 0;
        let safe = false;
        let leftPos = 0;
        do {
          bottomPos = 120 + Math.random() * 30;
          leftPos =
            window.innerWidth - Math.random() * (window.innerWidth - 200);
          safe =
            leftPos < cactusLeft - cactusMargin ||
            leftPos > cactusLeft + cactusWidth + cactusMargin;
          tries++;
        } while (
          (!safe ||
            activeBirds.current.some(
              (b) => Math.abs(b - bottomPos) < BIRD_SPACING
            )) &&
          tries < 10
        );
        activeBirds.current.push(bottomPos);
      } else {
        imgSrc = "/assets/vector_light.png";
        width = 40;
        height = 64;
      }

      const img = document.createElement("img");
      img.src = imgSrc;
      img.style.width = "100%";
      img.style.height = "100%";
      obstacle.appendChild(img);

      obstacle.style.width = `${width}px`;
      obstacle.style.height = `${height}px`;
      obstacle.style.left = `${window.innerWidth}px`;
      obstacle.style.bottom = `${bottomPos}px`;

      const duration = isCloud ? 12 + Math.random() * 3 : adjustedDuration;

      gsap.to(obstacle, {
        left: -200,
        duration: duration,
        ease: "linear",
        onUpdate: () => {
          if (!isBird && !isCloud && dinoRef.current) {
            const dinoLeft = dinoRef.current.offsetLeft;
            const obstacleLeft = obstacle.offsetLeft;
            if (
              !isJumping.current &&
              obstacleLeft < dinoLeft + COLLISION_OFFSETS.start &&
              obstacleLeft > dinoLeft + COLLISION_OFFSETS.end
            ) {
              dinoJump();
            }
          }
        },
        onComplete: () => {
          if (isBird) {
            activeBirds.current = activeBirds.current.filter(
              (b) => b !== bottomPos
            );
          }
          obstacle.remove();
        },
      });

      spawnTimeout.current = window.setTimeout(
        spawnObstacle,
        Math.random() * (OBSTACLE_MAX_DELAY - OBSTACLE_MIN_DELAY) +
        OBSTACLE_MIN_DELAY
      );
    };

    const handleVisibilityChange = () => {
      spawnActive.current = document.visibilityState === "visible";

      if (!spawnActive.current) {
        if (spawnTimeout.current) {
          window.clearTimeout(spawnTimeout.current);
          spawnTimeout.current = null;
        }
        gridTweenRef.current?.pause();
      } else {
        if (!spawnTimeout.current) {
          spawnObstacle();
        }
        gridTweenRef.current?.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (document.visibilityState === "visible") spawnObstacle();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (spawnTimeout.current) {
        window.clearTimeout(spawnTimeout.current);
        spawnTimeout.current = null;
      }
      gridTweenRef.current?.kill?.();
      gridTweenRef.current = null;
    };
  }, [imagesLoaded]);

  const adjustForViewport = () => {
    const viewportWidth = window.innerWidth;
    const baseDuration = 5;
    const speedFactor = viewportWidth < 768 ? 0.8 : 1;
    adjustedDuration = baseDuration * speedFactor;

    const baseJumpDuration = 0.5;
    const jumpFactor = viewportWidth < 768 ? 1.2 : 1;
    JUMP_DURATION = baseJumpDuration * jumpFactor;

    const baseCollisionOffsets = { start: 120, end: 50 };
    const collisionFactor = viewportWidth < 768 ? 0.8 : 1;
    COLLISION_OFFSETS = {
      start: baseCollisionOffsets.start * collisionFactor,
      end: baseCollisionOffsets.end * collisionFactor,
    };
  };

  useEffect(() => {
    adjustForViewport();
    window.addEventListener("resize", adjustForViewport);

    return () => {
      window.removeEventListener("resize", adjustForViewport);
    };
  }, []);

  return (
    <main className="w-full relative">
      {/* hidden preload images */}
      <div className="hidden">
        <img src="/assets/dino_frame1.png" alt="" />
        <img src="/assets/dino_frame2.png" alt="" />
        <img src="/assets/dino_frame3.png" alt="" />
        <img src="/assets/cloud.png" alt="" />
        <img src="/assets/bird.png" alt="" />
        <img src="/assets/vector_light.png" alt="" />
      </div>

      <section className="relative w-full overflow-hidden">
        <div
          ref={gridRef}
          className="absolute left-0 top-0 w-full h-full z-0 pointer-events-none
                    bg-white dark:bg-g-almost-black
                    [background-image:linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)]
                    dark:[background-image:linear-gradient(to_right,#555_1px,transparent_1px),linear-gradient(to_bottom,#555_1px,transparent_1px)]"
          style={{ backgroundSize: "40px 40px", opacity: 0.7 }}
        />

        <div className="relative w-full h-80 sm:h-96 md:h-[26rem] lg:h-[28rem]">
          <div className="absolute inset-0 flex items-center justify-around z-30 pointer-events-none">
            <div className="max-w-sm sm:max-w-lg md:max-w-xg lg:max-w-2xl px-4 pt-16">
              <Image
                src="/assets/hero_image.svg"
                alt="GDG Hero"
                width={752}
                height={285}
                priority
                className="w-full h-auto"
              />
            </div>
            <div></div>
          </div>

          {/* Dino with animated frames */}
          <div
            ref={dinoRef}
            className="absolute bottom-0 left-4 sm:left-6 md:left-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 z-10"
          >
            <img
              src={`/assets/dino_frame${currentFrame}.png`}
              alt="Dino"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div ref={obstaclesRef} className="absolute w-full h-full"></div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent opacity-50"></div>

      <div className="min-h-screen w-full flex flex-col lg:flex-row justify-around gap-20 items-center lg:items-center px-4 py-8 md:py-20">
        <div>
          <div className="relative mt-8 sm:mt-0 bg-no-repeat bg-contain hero-illustration w-full h-auto p-2 md:max-w-[480px]">
            <h2 className="pt-1 sm:pt-3 pl-4 text-xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Connect. Learn. Build.
            </h2>

            <p className="mt-2.5 ml-3.5 text-lg sm:text-xl leading-6.5 sm:leading-relaxed break-words text-gray-800 dark:text-gray-200">
              At GDG NMIT – explore Google technologies, exchange expertise, and
              transform ideas into solutions. Through workshops, webinars, and
              tech talks, we Dream, Dare and Do.
            </p>

            <div className="clear-both absolute bottom-1 sm:bottom-4 left-2">
              <div
                className="flex justify-start space-x-4"
                role="group"
                aria-label="Social media links"
              >
                {[
                  {
                    Icon: FaInstagram,
                    color: "hover:text-pink-500 dark:hover:text-pink-400",
                    label: "Instagram",
                    href: "https://www.instagram.com/gdgnmit",
                  },
                  {
                    Icon: FaLinkedin,
                    color: "hover:text-blue-700 dark:hover:text-blue-600",
                    label: "LinkedIn",
                    href: "https://www.linkedin.com/company/google-developer-groups-nmit/posts/?feedView=all",
                  },
                  {
                    Icon: FaGithub,
                    color: "hover:text-grey-500",
                    label: "Github",
                    href: "https://github.com/gdgnmit",
                  },
                ].map(({ Icon, color, label, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Icon
                      className={`size-7 sm:size-7.5 text-gray-600 dark:text-gray-400 ${color}`}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto flex justify-center lg:justify-end p-4">
          <Image
            src="/assets/gdg_community.webp"
            alt="GDG Community illustration"
            width={600}
            height={450}
            className="h-full w-auto md:min-h-[350px] md:mt-0 mt-20 filter drop-shadow-xl"
          />
        </div>
      </div>
    </main>
  );
}