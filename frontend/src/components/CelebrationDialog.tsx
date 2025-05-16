"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

interface CelebrationDialogProps {
  points: number;
  onClose?: () => void;
}

export const CelebrationDialog = ({
  points,
  onClose,
}: CelebrationDialogProps) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      createConfetti();

      // Create additional confetti burst every second for 3 seconds
      const interval = setInterval(() => {
        createConfetti(0.5); // Less confetti for subsequent bursts
      }, 1000);

      // Clear interval after 3 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 3000);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // Call onClose immediately instead of with a timeout
    if (onClose) onClose();
  };

  const createConfetti = (intensity = 1) => {
    // Create multiple bursts of confetti
    const count = 200 * intensity;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.2,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#3b82f6", "#8b5cf6"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#06b6d4", "#10b981"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#eab308", "#f472b6"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#22c55e", "#ef4444"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
            onClick={handleClose}
          />

          {/* Dialog - positioned in the center */}
          <motion.div
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md"
            initial={{
              scale: 0.8,
              opacity: 0,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: 1,
              opacity: 1,
              x: "-50%",
              y: "-50%",
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              x: "-50%",
              y: "-50%",
            }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 p-0.5">
              {/* Content container */}
              <div className="relative bg-gray-900 rounded-lg p-6 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-200 z-10"
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-6 py-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-16 h-16 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full text-blue-400"
                      fill="currentColor"
                    >
                      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.5-6H14a1 1 0 0 1 0 2H8.5a1 1 0 0 1 0-2zm0-4H14a1 1 0 0 1 0 2H8.5a1 1 0 0 1 0-2zm0-4H14a1 1 0 0 1 0 2H8.5a1 1 0 1 1 0-2z" />
                    </svg>
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl font-bold text-white">
                      Congratulations!
                    </h2>
                    <p className="text-gray-400 mt-1">
                      You've received tokens for your participation
                    </p>
                  </motion.div>

                  {/* Points */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.7,
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-center"
                  >
                    <span className="text-4xl font-mono font-bold text-blue-400">
                      +{points}
                    </span>
                    <span className="block text-sm text-gray-400 mt-1">
                      POINTS EARNED
                    </span>
                  </motion.div>

                  {/* Continue button */}
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={handleClose}
                    className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300"
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CelebrationDialog;
