"use client";
import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT, SPRING_UI } from "@/lib/motion";

// Shared pop-up: backdrop, Esc / backdrop-click to close, focus kept inside,
// page scroll locked while open, focus returned (without scrolling) on close.

// Opening settles with a quick, bounce-free spring; closing is quicker still.
const BACKDROP_IN = { duration: 0.2, ease: EASE_OUT } as const;
const CLOSE = { duration: 0.15, ease: EASE_OUT } as const;
const NO_MOTION = { duration: 0 } as const;
const PANEL_HIDDEN = { opacity: 0, scale: 0.96, y: 8 } as const;
const PANEL_SHOWN = { opacity: 1, scale: 1, y: 0 } as const;

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// One page-wide scroll lock shared by every open modal, so closing modals in
// any order always restores the original overflow.
let openModals = 0;
let overflowBeforeLock = "";

function lockScroll() {
  if (openModals === 0) {
    overflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openModals += 1;
}

function unlockScroll() {
  openModals = Math.max(0, openModals - 1);
  if (openModals === 0) document.body.style.overflow = overflowBeforeLock;
}

/** True while any modal dialog is showing. */
export function isModalOpen(): boolean {
  return openModals > 0;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that names the dialog. */
  labelledBy: string;
  panelClassName: string;
  /** Extra keyboard handling while open (e.g. arrow keys in a lightbox). */
  onKeyDown?: (event: KeyboardEvent) => void;
  /** Appear and disappear with no animation (for keyboard-opened UI like Ctrl+K). */
  instant?: boolean;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, labelledBy, panelClassName, onKeyDown, instant = false, children }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // Only a press that starts on the backdrop closes it (not a drag out of the panel).
  const pressStartedOnBackdrop = useRef(false);
  const handlers = useRef({ onClose, onKeyDown });

  useEffect(() => {
    handlers.current = { onClose, onKeyDown };
  }, [onClose, onKeyDown]);

  useEffect(() => {
    if (!open) return;
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handlers.current.onClose();
        return;
      }
      handlers.current.onKeyDown?.(event);
      const panel = panelRef.current;
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0] ?? panel;
      const last = focusable[focusable.length - 1] ?? panel;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      returnFocusTo?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/75 backdrop-blur-sm p-4"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: instant ? NO_MOTION : CLOSE }}
          transition={BACKDROP_IN}
          onPointerDown={(event) => {
            pressStartedOnBackdrop.current = event.target === event.currentTarget;
          }}
          onClick={(event) => {
            if (pressStartedOnBackdrop.current && event.target === event.currentTarget) onClose();
            pressStartedOnBackdrop.current = false;
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={`outline-none ${panelClassName}`}
            initial={instant ? false : PANEL_HIDDEN}
            animate={PANEL_SHOWN}
            exit={{ ...PANEL_HIDDEN, transition: instant ? NO_MOTION : CLOSE }}
            transition={SPRING_UI}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
