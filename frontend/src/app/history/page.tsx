"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Zap,
  Calendar,
  Clock,
  X,
  Check,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabsShade";
import { Skeleton } from "@/components/ui/skeleton";
import confetti from "canvas-confetti";

// Types
interface Participant {
  _id: string;
  walletAddress: string;
  points: number;
  id: string;
}

interface Tournament {
  _id: string;
  id: string;
  name: string;
  timeLimit: number;
  registrationTimeLimit: number;
  startDate: string;
  prizePool: number;
  image: string;
  icon: string;
  platform: string;
  endDate: string;
  registrationEndDate: string;
  pointsForVisit: number;
  visited: Participant[];
  participated: Participant[];
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  walletAddress: string;
  score: number;
  prize: number;
  paid: boolean;
}

interface LeaderboardData {
  success: boolean;
  tournament: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    prizePool: number;
    isActive: boolean;
    isOngoing: boolean;
  };
  status: string;
  calculatedAt: string;
  distributed: boolean;
  leaderboard: LeaderboardEntry[];
}

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tournaments data
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(
          "https://be1.rostrafi.fun/api/v1/compitition/tournaments/?active=false"
        );
        const data = await res.json();

        // Filter inactive tournaments with participants
        const inactiveTournaments = data.data.filter(
          (tournament: Tournament) =>
            !tournament.isActive &&
            tournament.participated &&
            tournament.participated.length > 0
        );

        setTournaments(inactiveTournaments);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Fetch leaderboard data when a tournament is selected
  const fetchLeaderboard = async (tournamentId: string) => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(
        `https://be1.rostrafi.fun/api/v1/compitition/tournaments/${tournamentId}/leaderboard`
      );
      const data = await res.json();
      console.log(data);
      setLeaderboardData(data);

      // Trigger confetti when leaderboard loads
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Handle tournament selection
  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDialogOpen(true);
    fetchLeaderboard(tournament.id);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  // Truncate wallet address
  const truncateWallet = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Group tournaments by platform
  const groupedTournaments = tournaments.reduce((acc, tournament) => {
    const platform = tournament.platform;
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(tournament);
    return acc;
  }, {} as Record<string, Tournament[]>);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-black"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              PAST <span className="text-amber-500">CONQUESTS</span>
            </h2>
            <p className="text-gray-400 mt-2">
              Explore completed tournaments and their champions
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden"
                >
                  <Skeleton className="h-60 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Past Tournaments</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                There are no completed tournaments with participants yet. Check
                back later!
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedTournaments).map(
                ([platform, platformTournaments], platformIndex) => (
                  <div key={platform} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * platformIndex }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={
                            platformTournaments[0].icon ||
                            "/placeholder.svg?height=100&width=100"
                          }
                          alt={platform}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-bold">
                        {platform}{" "}
                        <span className="text-amber-500">Tournaments</span>
                      </h3>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {platformTournaments.map((tournament, index) => (
                        <motion.div
                          key={tournament.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                          whileHover={{
                            y: -5,
                            boxShadow:
                              "0 10px 30px -10px rgba(245, 158, 11, 0.3)",
                          }}
                          className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 cursor-pointer"
                          onClick={() => handleTournamentClick(tournament)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                          <div className="h-60 bg-cover bg-center transition-transform duration-500 group-hover:scale-105">
                            <Image
                              src={
                                tournament.image ||
                                "/placeholder.svg?height=600&width=800"
                              }
                              alt={tournament.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute top-4 right-4 z-20">
                            <div className="bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Trophy className="h-3 w-3" /> COMPLETED
                            </div>
                          </div>
                          <div className="relative z-20 p-6 -mt-20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-purple-500/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                                <Zap className="h-3 w-3 mr-1" />{" "}
                                {tournament.prizePool} Sol
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                              {tournament.name}
                            </h3>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(tournament.startDate)} -{" "}
                                  {formatDate(tournament.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>
                                  {tournament.participated.length} Participants
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center text-amber-500 font-medium">
                              View Leaderboard{" "}
                              <ArrowUpRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tournament Dialog */}
      <AnimatePresence>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* Add right before </DialogContent> */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #111827;
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #374151;
              border-radius: 20px;
              transition: background 0.2s;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #4b5563;
            }
          `}</style>
          <DialogContent
            className="w-[95%] max-w-[1000px] h-[90vh] max-h-[900px] bg-gray-900 border-gray-800 text-white p-0 overflow-hidden rounded-lg 
    fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
    flex flex-col"
          >
            {selectedTournament && (
              <>
                <div className="relative h-[200px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
                  <Image
                    src={
                      selectedTournament.image ||
                      "/placeholder.svg?height=1200&width=1600"
                    }
                    alt={selectedTournament.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-500">
                      <Image
                        src={
                          selectedTournament.icon ||
                          "/placeholder.svg?height=100&width=100"
                        }
                        alt={selectedTournament.platform}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-amber-500 font-medium">
                        {selectedTournament.platform}
                      </div>
                      <h2 className="text-2xl font-bold">
                        {selectedTournament.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow overflow-auto">
                  <Tabs defaultValue="leaderboard" className="w-full h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="leaderboard" className="text-base">
                        Leaderboard
                      </TabsTrigger>
                      <TabsTrigger value="details" className="text-base">
                        Tournament Details
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaderboard" className="mt-0 h-full">
                      {leaderboardLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="space-y-2 mt-6">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        </div>
                      ) : leaderboardData &&
                        leaderboardData.leaderboard.length > 0 ? (
                        <div>
                          <div className="h-full overflow-auto custom-scrollbar">
                            <div className="text-gray-400 mb-1">
                              Final standings calculated on
                            </div>
                            <div className="text-lg font-medium">
                              {formatDateTime(leaderboardData.calculatedAt)}
                            </div>
                            {leaderboardData.distributed && (
                              <div className="mt-2 flex items-center gap-2 text-green-500">
                                <Check className="h-5 w-5" />
                                <span>Rewards have been distributed</span>
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden rounded-lg border border-gray-800">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-800/50">
                                    <th className="px-6 py-4 text-left">
                                      Rank
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Team
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Wallet
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Score
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Prize
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {leaderboardData.leaderboard.map((entry) => (
                                    <motion.tr
                                      key={entry.rank}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: entry.rank * 0.1,
                                      }}
                                      className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                                    >
                                      <td className="px-6 py-4">
                                        <div className="flex items-center">
                                          <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                                              entry.rank === 1
                                                ? "bg-amber-500 text-black"
                                                : entry.rank === 2
                                                ? "bg-gray-300 text-black"
                                                : entry.rank === 3
                                                ? "bg-amber-700 text-white"
                                                : "bg-gray-700 text-white"
                                            }`}
                                          >
                                            {entry.rank}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 font-bold">
                                        {entry.teamName}
                                      </td>
                                      <td className="px-6 py-4 font-mono">
                                        {truncateWallet(entry.walletAddress)}
                                      </td>
                                      <td className="px-6 py-4 font-bold">
                                        {entry.score.toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-amber-500 font-bold">
                                          {entry.prize} Sol
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        {entry.paid ? (
                                          <span className="inline-flex items-center gap-1 text-green-500">
                                            <Check className="h-4 w-4" /> Paid
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-gray-400">
                                            <Clock className="h-4 w-4" />{" "}
                                            Pending
                                          </span>
                                        )}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Award className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">
                            No Leaderboard Data
                          </h3>
                          <p className="text-gray-400 max-w-md mx-auto">
                            Leaderboard data is not available for this
                            tournament yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 h-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-bold mb-2">
                            Tournament Info
                          </h3>
                          <div className="space-y-2">
                            {/* Simplified tournament information with smaller text */}
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">
                                Platform
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-6 w-6 rounded-full overflow-hidden">
                                  <Image
                                    src={
                                      selectedTournament.icon ||
                                      "/placeholder.svg?height=100&width=100"
                                    }
                                    alt={selectedTournament.platform}
                                    width={24}
                                    height={24}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <span className="text-sm font-bold">
                                  {selectedTournament.platform}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">Status</span>
                              <span className="text-lg font-bold text-gray-400">
                                Completed
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">Prize Pool</span>
                              <span className="text-lg font-bold">
                                {selectedTournament.prizePool} Sol
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">
                                Points for Visit
                              </span>
                              <span className="text-lg font-bold">
                                {selectedTournament.pointsForVisit} points
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold mb-2">Timeline</h3>
                          <div className="relative border-l-2 border-gray-700 pl-6 space-y-6">
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Registration Start
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.createdAt)}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Registration End
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(
                                    selectedTournament.registrationEndDate
                                  )}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Tournament Start
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.startDate)}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Tournament End
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.endDate)}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-bold mb-2">
                          Participation Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Reduced participation statistics */}
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-2 text-center"
                          >
                            <div className="text-xl font-bold text-amber-500 mb-1">
                              {selectedTournament.visited?.length || 0}
                            </div>
                            <div className="text-xs text-gray-400">
                              Visitors
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.participated?.length || 0}
                            </div>
                            <div className="text-gray-400">Participants</div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.registrationTimeLimit}h
                            </div>
                            <div className="text-gray-400">
                              Registration Period
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.timeLimit}h
                            </div>
                            <div className="text-gray-400">
                              Tournament Duration
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  );
}
