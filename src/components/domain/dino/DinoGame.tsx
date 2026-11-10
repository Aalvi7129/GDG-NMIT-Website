"use client";
import React, { useEffect, useRef } from "react";
import { DOMAIN_COLOR_HEX } from "@/data/domains";
import { createGame, press, step, WORLD, type GameState } from "./engine";

// Canvas renderer + input for the dino game. All rules live in ./engine.

const SPRITES = {
  run: ["/assets/dino_frame1.png", "/assets/dino_frame2.png", "/assets/dino_frame3.png"],
  stand: "/assets/trex_t.png",
  cactus: "/assets/Vector.png",
  bird: "/assets/bird.png",
  cloud: "/assets/cloud.png",
};
const RUN_FRAME_MS = 90;
const MAX_DT_MS = 50; // clamp after a tab switch so nothing teleports
const SUB_STEP_MS = 16; // physics runs in small slices so fast obstacles can't tunnel through
const RESTART_LOCK_MS = 500; // a held or mashed key can't skip the game-over screen
const MAX_TEXT_SCALE = 1.8; // canvas text grows on narrow screens to stay readable
const MILESTONE = 100;
const FLASH_MS = 700;
const FLASH_BLINK_MS = 120;
const BIRD_BOB_PX = 3;
const DASH_SPACING = 40;
const HIGH_SCORE_KEY = "gdg-dino-hi";
const INK = "#535353";
const PAPER = "#ffffff";
const GOOGLE = [DOMAIN_COLOR_HEX.blue, DOMAIN_COLOR_HEX.red, DOMAIN_COLOR_HEX.yellow, DOMAIN_COLOR_HEX.green];
const JUMP_KEYS = new Set(["Space", "ArrowUp", "KeyW"]);

interface Images {
  run: HTMLImageElement[];
  stand: HTMLImageElement;
  cactus: HTMLImageElement;
  bird: HTMLImageElement;
  cloud: HTMLImageElement;
}

interface Hud {
  high: number;
  flashLeft: number;
  milestones: number;
  /** This run beat the previous best. */
  beatHigh: boolean;
  /** performance.now() when the last run ended. */
  overAt: number;
}

function loadImage(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

function readHighScore(): number {
  try {
    return Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0; // storage blocked (private mode etc.): start from zero
  }
}

function saveHighScore(score: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // storage blocked: the high score just won't survive a reload
  }
}

const pad = (n: number) => String(n).padStart(5, "0");

function drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
}

function drawCentered(ctx: CanvasRenderingContext2D, text: string, y: number, font: string, color = INK) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, WORLD.width / 2, y);
}

function draw(ctx: CanvasRenderingContext2D, game: GameState, images: Images, hud: Hud, textScale: number) {
  const { width, groundY } = WORLD;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, WORLD.height);

  game.clouds.forEach((c) => drawImage(ctx, images.cloud, c.x, c.y, c.w, c.h));

  // Ground: a line plus Google-colour dashes that scroll with the world
  ctx.fillStyle = INK;
  ctx.fillRect(0, groundY - 2, width, 2);
  const offset = game.distance % DASH_SPACING;
  const firstDash = Math.floor(game.distance / DASH_SPACING); // world index, so colours scroll with the ground
  for (let i = 0; i * DASH_SPACING - offset < width; i++) {
    const n = firstDash + i;
    ctx.fillStyle = GOOGLE[(n + hud.milestones) % GOOGLE.length];
    ctx.fillRect(i * DASH_SPACING - offset, groundY + 6 + (n % 3) * 4, 10, 3);
  }

  game.obstacles.forEach((o) => {
    if (o.kind === "cactus") {
      drawImage(ctx, images.cactus, o.x, o.y, o.w, o.h);
    } else {
      const bob = Math.sin(game.elapsed / 120) * BIRD_BOB_PX;
      drawImage(ctx, images.bird, o.x, o.y + bob, o.w, o.h);
    }
  });

  const running = game.status === "running" && game.dino.onGround;
  const sprite = running ? images.run[Math.floor(game.elapsed / RUN_FRAME_MS) % images.run.length] : images.stand;
  drawImage(ctx, sprite, game.dino.x, game.dino.y, game.dino.w, game.dino.h);

  // Score, blinking in Google colours for a moment after every 100 points
  const blinkOn = hud.flashLeft > 0 && Math.floor(hud.flashLeft / FLASH_BLINK_MS) % 2 === 0;
  const px = (size: number) => Math.round(size * textScale);
  ctx.font = `bold ${px(16)}px 'Google Sans Code Variable', ui-monospace, monospace`;
  ctx.textAlign = "right";
  const scoreText = pad(game.score);
  ctx.fillStyle = blinkOn ? GOOGLE[hud.milestones % GOOGLE.length] : INK;
  ctx.fillText(scoreText, width - 16, 12 + px(16));
  ctx.fillStyle = "#9aa0a6";
  ctx.fillText(`HI ${pad(hud.high)}`, width - 16 - ctx.measureText(scoreText).width - px(18), 12 + px(16));

  if (game.status === "ready") {
    drawCentered(ctx, "Press Space or tap to start", 92, `bold ${px(20)}px 'Google Sans', sans-serif`);
    drawCentered(ctx, "Jump the cacti. Watch out for birds.", 92 + px(28), `${px(15)}px 'Google Sans', sans-serif`, "#80868b");
  } else if (game.status === "over") {
    drawCentered(ctx, "G A M E   O V E R", 88, `bold ${px(24)}px 'Google Sans Code Variable', ui-monospace, monospace`);
    drawCentered(
      ctx,
      hud.beatHigh ? "New high score!" : "Space or tap to play again",
      88 + px(34),
      `bold ${px(16)}px 'Google Sans', sans-serif`,
      hud.beatHigh ? DOMAIN_COLOR_HEX.green : "#80868b",
    );
  }
}

const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WORLD.width * dpr;
    canvas.height = WORLD.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false; // keep the pixel-art crisp

    const images: Images = {
      run: SPRITES.run.map(loadImage),
      stand: loadImage(SPRITES.stand),
      cactus: loadImage(SPRITES.cactus),
      bird: loadImage(SPRITES.bird),
      cloud: loadImage(SPRITES.cloud),
    };
    let game = createGame();
    let hud: Hud = { high: readHighScore(), flashLeft: 0, milestones: 0, beatHigh: false, overAt: 0 };
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, MAX_DT_MS);
      last = now;
      const wasRunning = game.status === "running";
      for (let left = dt; left > 0; left -= SUB_STEP_MS) {
        game = step(game, Math.min(left, SUB_STEP_MS), Math.random);
      }

      const reached = Math.floor(game.score / MILESTONE);
      hud = reached > hud.milestones
        ? { ...hud, milestones: reached, flashLeft: FLASH_MS }
        : { ...hud, flashLeft: Math.max(0, hud.flashLeft - dt) };
      if (wasRunning && game.status === "over") {
        const beatHigh = game.score > hud.high;
        hud = { ...hud, overAt: now, beatHigh, high: beatHigh ? game.score : hud.high };
        if (beatHigh) saveHighScore(game.score);
      }

      const textScale = Math.min(MAX_TEXT_SCALE, Math.max(1, WORLD.width / (canvas.clientWidth * 1.3)));
      draw(ctx, game, images, hud, textScale);
      frame = requestAnimationFrame(tick);
    };

    const jump = () => {
      if (game.status === "over") {
        if (performance.now() - hud.overAt < RESTART_LOCK_MS) return;
        hud = { ...hud, milestones: 0, flashLeft: 0, beatHigh: false };
      }
      game = press(game);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !JUMP_KEYS.has(event.code)) return;
      // Let Space still activate a focused button (e.g. Close).
      if (event.target instanceof HTMLButtonElement && event.code === "Space") return;
      event.preventDefault();
      if (event.repeat) return; // holding the key doesn't jump (or restart) on its own
      jump();
    };

    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", jump);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", jump);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Dino game. Press Space or the up arrow, or tap, to jump."
      className="block w-full h-auto cursor-pointer select-none touch-none rounded-2xl border-2 border-black"
      style={{ aspectRatio: `${WORLD.width} / ${WORLD.height}` }}
    />
  );
};

export default DinoGame;
