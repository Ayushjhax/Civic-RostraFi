"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Award,
  Plus,
  Check,
  X,
  TrendingUp,
  Zap,
  Star,
  DollarSign,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchContent,
  fetchUserVotes,
  voteOnContent,
} from "@/store/contentSlice";
import { removeUserPoints, userWalletConnect } from "@/store/userSlice";

// Types based on the actual data structure
interface Influencer {
  _id: string;
  id: string;
  title: string;
  image: string;
  description: string;
  voteCost: number;
  points: number;
  duration: number;
  timeRemaining: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isExpired: boolean;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  yesPercentage: number;
  noPercentage: number;
}

interface UserBet {
  influencerId: string;
  betType: "yes" | "no";
  points: number;
}

// Function to determine the category based on the influencer's title or description
const determineCategory = (influencer: Influencer): string => {
  const title = influencer.title.toLowerCase();
  const desc = influencer.description.toLowerCase();

  if (
    title.includes("elon") ||
    desc.includes("tweet") ||
    desc.includes("tech")
  ) {
    return "Tech";
  } else if (desc.includes("followers") || desc.includes("social media")) {
    return "Entertainment";
  } else if (
    desc.includes("match") ||
    desc.includes("game") ||
    desc.includes("win")
  ) {
    return "Sports";
  } else if (
    desc.includes("brand") ||
    desc.includes("partnership") ||
    desc.includes("launch")
  ) {
    return "Business";
  }

  // Default category
  return "Entertainment";
};

// Function to format time remaining in a human-readable format
const formatTimeRemaining = (timeRemaining: number): string => {
  const seconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} left`;
  }
};

// Function to calculate popularity based on votes
const calculatePopularity = (influencer: Influencer): number => {
  // If there are no votes, return a default value
  if (influencer.totalVotes === 0) {
    return 50; // Default 50% popularity
  }

  // Calculate as percentage of yes votes or use a more complex algorithm
  return (
    influencer.yesPercentage ||
    (influencer.yesVotes / influencer.totalVotes) * 100
  );
};

export default function Home() {
  const { points } = useAppSelector((state) => state.user);
  console.log(points);

  const [userPoints, setUserPoints] = useState<number>(points);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [betType, setBetType] = useState<"yes" | "no" | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAlert, setShowPointsAlert] = useState(false);
  const { width, height } = useWindowSize();
  const [timeUpdater, setTimeUpdater] = useState(0);

  const dispatch = useAppDispatch();
  const { content, userVotes } = useAppSelector((state) => state.content);
  const { userId } = useAppSelector((state) => state.user);
  const [userId1, setUserId1] = useState<string | null>(null);
  useEffect(() => {
    setUserId1(localStorage.getItem("UserId"));
  }, []);

  console.log("User votes:", userVotes);
  console.log("jhjshj");

  // Update time remaining every second
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeUpdater((prev) => prev + 1);
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  // Fetch content and user votes on mount
  useEffect(() => {
    dispatch(userWalletConnect(userId1 as string));
    dispatch(fetchContent());
    dispatch(fetchUserVotes(userId));
  }, [dispatch, userId, userId1]);

  // Update userBets state based on fetched userVotes
  useEffect(() => {
    if (userVotes && userVotes.length > 0) {
      const formattedBets = userVotes.map((vote) => ({
        influencerId: vote.content._id || vote.content.id,
        betType: vote.voteType,
        points: vote.pointsSpent,
      }));

      setUserBets(formattedBets);
    }
  }, [userVotes]);

  // Check if user has already bet on an influencer using Redux state
  const hasUserBetOn = (influencerId: string) => {
    return userVotes.some(
      (vote) =>
        vote.content._id === influencerId || vote.content.id === influencerId
    );
  };

  // Get user's bet type on an influencer using Redux state
  const getUserBetType = (influencerId: string) => {
    const vote = userVotes.find(
      (vote) =>
        vote.content._id === influencerId || vote.content.id === influencerId
    );
    return vote ? vote.voteType : null;
  };

  const handleBet = (influencer: Influencer, type: "yes" | "no") => {
    // Check if user has already bet on this influencer
    if (hasUserBetOn(influencer._id || influencer.id)) {
      setShowPointsAlert(true);
      setTimeout(() => setShowPointsAlert(false), 3000);
      return;
    }

    // Check if user has enough points
    if (points < influencer.voteCost) {
      setShowPointsAlert(true);
      setTimeout(() => setShowPointsAlert(false), 3000);
      return;
    }

    setSelectedInfluencer(influencer);
    setBetType(type);
    setShowDialog(true);
  };

  const confirmBet = () => {
    if (selectedInfluencer && betType && userId) {
      // Dispatch the vote action to Redux
      dispatch(
        voteOnContent({
          userId: userId,
          contentId: selectedInfluencer._id || selectedInfluencer.id,
          voteType: betType,
          pointsSpent: selectedInfluencer.voteCost,
        })
      );

      // Deduct points
      // setUserPoints(points - selectedInfluencer.voteCost);
      const removedPoints = points - selectedInfluencer.voteCost;
      dispatch(removeUserPoints(removedPoints));

      // Add to user bets locally (this will be updated by the effect when userVotes updates)
      setUserBets([
        ...userBets,
        {
          influencerId: selectedInfluencer._id || selectedInfluencer.id,
          betType: betType,
          points: selectedInfluencer.voteCost,
        },
      ]);

      // Close dialog
      setShowDialog(false);

      // Show notification and confetti
      setNotificationMessage(
        `You bet ${betType.toUpperCase()} on ${selectedInfluencer.title} for ${
          selectedInfluencer.voteCost
        } points!`
      );
      setShowNotification(true);
      setShowConfetti(true);

      // Hide notification and confetti after 4 seconds
      setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => setShowConfetti(false), 1000);
      }, 4000);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Tech":
        return <Zap className="h-4 w-4" />;
      case "Entertainment":
        return <Star className="h-4 w-4" />;
      case "Sports":
        return <TrendingUp className="h-4 w-4" />;
      case "Business":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      {/* Header */}
      <header className="container mx-auto py-8 px-4">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl z-0"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-lg pb-2">
              Bet on Influencers
            </h1>
            <p className="text-center text-gray-400 max-w-xl mx-auto mt-2">
              Place your bets on the future actions of top influencers and win
              big!
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 border-purple-700 bg-purple-950/50"
            >
              <TrendingUp className="h-4 w-4 mr-1 text-pink-500" />
              <span>Hot Bets</span>
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 border-blue-700 bg-blue-950/50"
            >
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              <span>Ending Soon</span>
            </Badge>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-full px-5 py-3 flex items-center gap-3 border border-gray-700 shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Your Balance</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {points}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-yellow-400" />
                  </div>
                  <Button
                    size="sm"
                    className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-md shadow-purple-900/20"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Buy Points
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your betting points balance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Points Alert */}
      <AnimatePresence>
        {showPointsAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Alert className="bg-red-900/90 border-red-700 text-white max-w-md">
              <AlertDescription className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-400" />
                {hasUserBetOn(selectedInfluencer?._id || "")
                  ? "You've already placed a bet on this influencer!"
                  : "Not enough points! You need more points to place this bet."}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content &&
            content.map((influencer: Influencer) => {
              const hasBet = hasUserBetOn(influencer._id || influencer.id);
              const userBetType = getUserBetType(
                influencer._id || influencer.id
              );
              const category = determineCategory(influencer);
              const popularity = calculatePopularity(influencer);
              // Calculate remaining time dynamically
              const timeLeft = formatTimeRemaining(
                influencer.timeRemaining - timeUpdater * 1000
              );

              return (
                <motion.div
                  key={influencer._id || influencer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card
                    className={`bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 overflow-hidden h-full transition-all duration-300 ${
                      hasBet
                        ? userBetType === "yes"
                          ? "border-l-4 border-l-green-500 shadow-lg shadow-green-900/10"
                          : "border-l-4 border-l-red-500 shadow-lg shadow-red-900/10"
                        : "hover:shadow-lg hover:shadow-purple-900/20"
                    }`}
                  >
                    <div className="relative h-48">
                      <Image
                        src={influencer.image || "/placeholder.svg"}
                        alt={influencer.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gray-800/80 backdrop-blur-sm border-gray-700 px-2 py-1 flex items-center gap-1">
                          {getCategoryIcon(category)}
                          {category}
                        </Badge>
                      </div>

                      {/* User Bet Badge */}
                      {hasBet && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={`px-2 py-1 flex items-center gap-1 ${
                              userBetType === "yes"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }`}
                          >
                            {userBetType === "yes" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            You bet {userBetType}
                          </Badge>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-xl text-white">
                          {influencer.title}
                        </h3>
                      </div>
                    </div>

                    <CardContent className="pt-4 pb-2">
                      <p className="text-gray-300 mb-4 text-sm">
                        {influencer.description}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-gray-800/50 text-blue-400 border-blue-900"
                        >
                          <Clock className="h-3 w-3" /> {timeLeft}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {influencer.voteCost} points
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Yes Votes</span>
                          <span className="text-gray-300">
                            {influencer.yesPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={influencer.yesPercentage || 50}
                          className="h-1.5"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-0">
                      {hasBet ? (
                        <div className="w-full p-2 bg-gray-800/50 rounded-md text-center text-sm text-gray-400">
                          You already placed a {userBetType?.toUpperCase()} bet
                          on this influencer
                        </div>
                      ) : (
                        <>
                          <Button
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 border-0"
                            onClick={() => handleBet(influencer, "yes")}
                            disabled={points < influencer.voteCost}
                          >
                            Yes
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-0"
                            onClick={() => handleBet(influencer, "no")}
                            disabled={points < influencer.voteCost}
                          >
                            No
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {/* No Points Message */}
        {points === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              You're out of points!
            </h3>
            <p className="text-gray-400 mb-4">
              Purchase more points to continue betting on your favorite
              influencers.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" /> Buy More Points
            </Button>
          </motion.div>
        )}

        {/* No Data Message */}
        {(!content || content.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              No active bets available!
            </h3>
            <p className="text-gray-400 mb-4">
              Check back soon for new influencer betting opportunities.
            </p>
          </motion.div>
        )}
      </main>

      {/* Transaction Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Confirm Your Bet
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to place a bet on {selectedInfluencer?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Bet Type:</span>
              <Badge
                className={`px-3 py-1 ${
                  betType === "yes" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {betType?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Points to Deduct:</span>
              <span className="font-bold text-yellow-400 text-lg">
                {selectedInfluencer?.voteCost}
              </span>
            </div>

            <Separator className="my-4 bg-gray-700" />

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Your Total Points:</span>
              <span className="font-bold text-yellow-400 text-lg">
                {points}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Balance After Bet:</span>
              <span className="font-bold text-yellow-400 text-lg">
                {selectedInfluencer
                  ? points - selectedInfluencer.voteCost
                  : points}
              </span>
            </div>

            <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Need more points?</span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Buy Points
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-900/20"
              onClick={confirmBet}
            >
              Approve Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-purple-500 shadow-xl shadow-purple-500/30 rounded-lg p-5 max-w-md overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-600/20 rounded-full blur-2xl"></div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 flex-shrink-0">
                  {betType === "yes" ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-1">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                      Bet Placed Successfully!
                    </span>
                  </h4>
                  <p className="text-gray-300">{notificationMessage}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Award className="h-4 w-4" />
                      <span>
                        New Balance:{" "}
                        {points - (selectedInfluencer?.voteCost || 0)} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated stars */}
              <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">
                <Star className="h-4 w-4" />
              </div>
              <div
                className="absolute bottom-2 left-10 text-purple-400 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                <Star className="h-3 w-3" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}