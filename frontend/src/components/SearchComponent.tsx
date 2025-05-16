"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

export default function SearchComponent() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <AnimatePresence>
        <motion.div
          key="search"
          layout
          initial={false}
          animate={{
            scale: isSearchActive ? 1 : 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className={`z-50 ${
            isSearchActive
              ? "fixed inset-0 flex items-center justify-center"
              : "relative"
          }`}
        >
          <motion.div
            layout
            className={`relative flex items-center w-full max-w-xl rounded-full bg-zinc-900 ${
              isSearchActive ? "shadow-2xl" : ""
            }`}
            style={{
              backgroundColor: "rgb(39 39 42)",
            }}
            animate={{
              width: isSearchActive ? "70vw" : "100%",
              height: isSearchActive ? "60px" : "45px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full focus:outline-none text-gray-100 placeholder-gray-400 bg-transparent text-base"
              onClick={(e) => {
                e.stopPropagation();
                if (!isSearchActive) toggleSearch();
              }}
            />
            <button
              className={`px-3 py-2 rounded-full transition-colors duration-200 text-gray-300 ${
                isHovered && !isSearchActive ? "bg-zinc-800" : ""
              }`}
              onClick={toggleSearch}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isSearchActive ? (
                <X className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={toggleSearch}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
