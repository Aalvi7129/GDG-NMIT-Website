"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Popup() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");

    if (!hasSeenPopup) {
      setShowPopup(true);
      sessionStorage.setItem("hasSeenPopup", "true");

      const removeTimer = setTimeout(() => {
        sessionStorage.removeItem("hasSeenPopup");
      }, 30 * 60 * 1000);

      return () => clearTimeout(removeTimer);
    }
  }, []);

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg p-4"
          onClick={() => setShowPopup(false)}
          aria-hidden={!showPopup}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f] rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-2xl overflow-auto border border-[#1f1f1f] shadow-[0_0_25px_rgba(66,133,244,0.55)]"
          >
            <button
              onClick={() => setShowPopup(false)}
              aria-label="Close popup"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-300 hover:text-white text-3xl sm:text-4xl leading-none cursor-pointer focus:outline-none"
            >
              ×
            </button>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 mb-2">
                GDGoC 2026-27
              </h3>
              <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
                  Google Cloud: Learn with Communities
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                  Join GDG on Campus NMIT for hands-on Google Cloud and Generative AI skill labs. Earn official digital badges, track your chapter progress, and qualify for exclusive swags!
                </p>

                <div className="mt-5 sm:mt-7 flex justify-center items-center">
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      router.push("/upcomingevent");
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-green-400 text-white hover:cursor-pointer transition-all"
                  >
                    Know More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
