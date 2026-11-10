"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { DOMAIN_COLOR_HEX } from "@/data/domains";
import Modal, { isModalOpen } from "../Modal";
import DinoGame from "./DinoGame";

// Hidden dino game: opens when someone types "dino" anywhere on the page, or
// taps the GDG logo in the /domain orbit three times (openDinoGame), which is
// how phones get in.

const DINO_EVENT = "gdg:dino-game";
const SECRET = "dino";
const TITLE_COLORS = [DOMAIN_COLOR_HEX.blue, DOMAIN_COLOR_HEX.red, DOMAIN_COLOR_HEX.yellow, DOMAIN_COLOR_HEX.green];

export function openDinoGame() {
  window.dispatchEvent(new Event(DINO_EVENT));
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

const DinoEasterEgg = () => {
  const [open, setOpen] = useState(false);

  // Triggers: the secret word (typed outside any input field), or openDinoGame().
  useEffect(() => {
    let typed = "";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || isTypingTarget(event.target) || isModalOpen()) return;
      typed = (typed + event.key.toLowerCase()).slice(-SECRET.length);
      if (typed === SECRET) {
        typed = "";
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(DINO_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(DINO_EVENT, onOpen);
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      labelledBy="dino-title"
      panelClassName="w-full max-w-3xl rounded-3xl border-2 border-black bg-white p-4 sm:p-6 text-black shadow-[10px_10px_0_#4285f4]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-widest text-gray-500">YOU FOUND THE SECRET</p>
          <h2 id="dino-title" className="text-2xl sm:text-3xl font-bold">
            {"Dino Run".split("").map((char, i) => (
              <span key={i} style={{ color: char === " " ? undefined : TITLE_COLORS[i % TITLE_COLORS.length] }}>
                {char}
              </span>
            ))}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close game"
          className="grid place-items-center w-11 h-11 shrink-0 cursor-pointer rounded-full border-2 border-black bg-white shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <X aria-hidden className="w-5 h-5" />
        </button>
      </div>

      <DinoGame />

      <p className="mt-4 text-center text-sm text-gray-600">
        <kbd className="rounded border border-gray-400 px-1.5 font-mono text-xs">Space</kbd> /{" "}
        <kbd className="rounded border border-gray-400 px-1.5 font-mono text-xs">↑</kbd> / tap to jump ·{" "}
        <kbd className="rounded border border-gray-400 px-1.5 font-mono text-xs">Esc</kbd> to close
      </p>
    </Modal>
  );
};

export default DinoEasterEgg;
