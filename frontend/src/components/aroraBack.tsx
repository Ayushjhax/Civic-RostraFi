"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "./ui/aurora-background";
import { Trophy } from "lucide-react";

export function AuroraBack() {
  return (
    <AuroraBackground className="h-[50vh] w-full mb-16 max-w-5xl rounded-2xl mx-auto">
      <div className="relative w-full h-full flex items-center">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col gap-4 items-start justify-center px-8 text-left w-2/3"
        >
          <div className="text-2xl md:text-5xl font-bold dark:text-white">
          Enter the Arena
          </div>
          <div className="flex items-center">
            <div className="bg-indigo-900/20 dark:bg-indigo-600/30 rounded-xl px-4 py-2 inline-flex items-center">
              <span className="font-medium text-lg md:text-3xl dark:text-neutral-200">
                Prize pool of 10
              </span>
              <span className="font-semibold text-lg md:text-3xl ml-2 text-amber-500 dark:text-amber-300">
                SOL
              </span>
            </div>
            <span className="ml-3 text-base md:text-xl text-gray-600 dark:text-gray-400">
              & Airdrops
            </span>
          </div>
          <div className="font-bold text-lg md:text-2xl text-amber-500 dark:text-amber-400 mt-1">
            Ends in 24 hrs
          </div>
        </motion.div>

        {/* Animated Trophy on the right side */}
        <div className="absolute right-8 h-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.1, 1],
              opacity: 1,
              y: [0, -15, 0],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="flex items-center justify-center"
          >
            <Trophy size={120} className="text-yellow-400 drop-shadow-lg" />
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
