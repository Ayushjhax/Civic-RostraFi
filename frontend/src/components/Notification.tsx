import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Star, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useSocketNotifications } from "@/hooks/use-notification";

export const NotificationComponent = ({ userId }: { userId: string }) => {
  const { notifications, clearNotification } = useSocketNotifications(userId);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getBackgroundColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600";
      case 3:
        return "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900";
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-white" />;
      case 2:
        return <Award className="h-8 w-8 text-white" />;
      case 3:
        return <Star className="h-8 w-8 text-white" />;
      default:
        return <Sparkles className="h-8 w-8 text-white" />;
    }
  };

  return (
    <>
      {showConfetti && notifications.length > 0 && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            <div
              className={`
                relative 
                w-[90%] 
                max-w-md 
                rounded-2xl 
                shadow-2xl 
                overflow-hidden 
                ${getBackgroundColor(notification.rank)}
              `}
            >
              {/* Animated Background Effect */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Close Button */}
              <button
                onClick={() => {
                  clearNotification(index);
                  setShowConfetti(false);
                }}
                className="absolute top-4 right-4 z-10 text-white hover:text-white/80 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="relative z-10 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="mx-auto w-24 h-24 mb-4 bg-white/20 rounded-full flex items-center justify-center"
                >
                  {getRankIcon(notification.rank)}
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Congratulations!
                </h2>
                <p className="text-white/90 mb-4">{notification.message}</p>

                <div className="bg-white/20 rounded-xl p-4 inline-block">
                  <div className="text-white font-semibold text-lg">
                    {notification.prize} SOL Prize
                  </div>
                  <div className="text-white/80 text-sm">
                    Tournament: {notification.tournamentName}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};
