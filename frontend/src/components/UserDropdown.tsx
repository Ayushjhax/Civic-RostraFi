"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, User } from "lucide-react";

export const UserProfileButton = () => {
  const { user, signOut } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  console.log("User:", user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      console.log("Sign out successful");
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Get username (or truncated wallet address if username not available)
  const displayName = user?.name;

  // Helper function to truncate wallet address
  function truncateAddress(address: any) {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleToggleDropdown}
          className="flex items-center space-x-2 bg-black bg-opacity-40 hover:bg-opacity-60 backdrop-blur-sm py-2 px-4 rounded-xl border border-gray-700 transition-all duration-300 text-white"
        >
          <div className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-8 h-8">
            <User size={16} className="text-white" />
          </div>
          <span className="max-w-24 truncate">{displayName}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 py-2 bg-black bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm text-gray-300">Signed in as</p>
                <p className="text-sm font-medium text-white truncate mt-1">
                  {displayName}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-150 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen Logout Loader */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-24 h-24"
            >
              {/* Spinner */}
              <div className="absolute inset-0">
                <div className="w-full h-full rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-indigo-500 animate-spin" />
              </div>
              {/* Gradient ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent bg-clip-border animate-pulse"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #6366f1, #a855f7, #ec4899)",
                  maskImage: "radial-gradient(transparent 60%, black 70%)",
                  WebkitMaskImage:
                    "radial-gradient(transparent 60%, black 70%)",
                }}
              />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xl font-medium text-white"
            >
              Signing Out...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserProfileButton;
