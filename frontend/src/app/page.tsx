"use client";

import { FeaturesSectionDemo } from "@/components/BentoGrid";
// import { HomeBackGround } from "@/components/HomeBackground";
const HomeBackGround = dynamic(() => import("@/components/HomeBackground"), {
  ssr: false,
});

import Navbar from "@/components/Navbar";
import TournamentList from "@/components/tournament-list";
import { VideoSection } from "@/components/VideoSection";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchOpenRegistrationTournaments,
  fetchTournaments,
} from "@/store/tournamentSlice";
import { useUser } from "@civic/auth-web3/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Award, Trophy } from "lucide-react";
import { setIsNewUser } from "@/store/userSlice";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import UserProfileButton from "@/components/UserDropdown";

export default function Home() {
  const dispatch = useAppDispatch();
  const { isNewUser, points } = useAppSelector((state) => state.user);
  const [showDialog, setShowDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const user = useUser();
  const router = useRouter();
  console.log("user civic", user);

  useEffect(() => {
    dispatch(fetchTournaments());
    dispatch(fetchOpenRegistrationTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (!user.user) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isNewUser) {
      setShowDialog(true);

      // Reset isNewUser in Redux after 4 seconds
      const timer = setTimeout(() => {
        dispatch(setIsNewUser(false));
        setShowDialog(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isNewUser, dispatch]);

  useEffect(() => {
    if (showDialog) {
      createConfetti();

      // Create smaller confetti bursts every second for 3 seconds
      const interval = setInterval(() => {
        createConfetti(0.4);
      }, 800);

      // Clear interval after 3 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 3000);
    }
  }, [showDialog]);

  const handleCloseDialog = () => {
    setShowDialog(false);
    dispatch(setIsNewUser(false));
  };

  const createConfetti = (intensity = 1) => {
    if (typeof window === "undefined") return;
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
      colors: ["#6366f1", "#f472b6"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#22d3ee", "#10b981"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#fbbf24", "#ec4899"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#4ade80", "#f87171"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#60a5fa", "#c084fc", "#0ea5e9", "#34d399"],
    });
  };

  return (
    <div className="w-full min-h-screen bg-black">
      <Navbar />
      <div className="absolute flex flex-row gap-3 top-4 right-4 z-50">
        <UserProfileButton />
        <WalletConnectButton />
      </div>
      <HomeBackGround />

      {/* Welcome Dialog for New Users */}
      {isMounted && (
        <AnimatePresence>
          {showDialog && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 pointer-events-auto"
                onClick={handleCloseDialog}
              />

              {/* Dialog */}
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
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 p-0.5 shadow-xl">
                  {/* Content container */}
                  <div className="relative bg-white rounded-2xl p-6 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-indigo-200 to-transparent rounded-full opacity-70" />
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-gradient-to-tr from-pink-200 to-transparent rounded-full opacity-70" />

                    {/* Close button */}
                    <button
                      onClick={handleCloseDialog}
                      className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all duration-200 z-10"
                    >
                      <X size={18} />
                    </button>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-5 py-3">
                      {/* Icon */}
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                      >
                        <Trophy className="w-10 h-10 text-white" />
                      </motion.div>

                      {/* Text */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                          Welcome to the Arena!
                        </h2>
                        <p className="text-gray-600 mt-1">
                          You've received bonus tokens to get started
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
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-8 py-4 text-center shadow-sm"
                      >
                        <span className="text-5xl font-mono font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          +{points || 100}
                        </span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Award size={14} className="text-indigo-500" />
                          <span className="text-sm font-medium text-gray-600">
                            TOKENS EARNED
                          </span>
                        </div>
                      </motion.div>

                      {/* Continue button */}
                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        onClick={handleCloseDialog}
                        className="mt-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Start Playing
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <div className="m-0 p-0">
        <VideoSection />
      </div>

      <div className="w-full bg-black pt-0 pb-0 -mt-24">
        <FeaturesSectionDemo />
      </div>

      <div className="w-full h-48 bg-black"></div>

      <main className="w-full bg-black text-white pb-8 flex justify-center relative">
        <div className="w-full max-w-7xl px-4 mx-auto flex flex-col items-center">
          <div className="w-full max-w-4xl text-left mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Active Tournaments
            </h1>
            <p className="text-gray-400">
              Pick your Rostra dream team and bet on their likes, views, and
              comments.
            </p>
          </div>
          <div className="w-full max-w-4xl">
            <TournamentList />
          </div>
        </div>
      </main>
    </div>
  );
}
