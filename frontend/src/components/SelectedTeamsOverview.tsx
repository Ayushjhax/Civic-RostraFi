"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetStatus, saveTeams } from "@/store/teamsSlice";
import Image from "next/image";
import { RootState } from "@/store/store";
import { Team } from "@/types/team.types";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  participateInTournament,
  resetTournamentState,
} from "@/store/tournamentSlice";

const createConfetti = () => {
  // Create multiple bursts of confetti
  const count = 200;
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

export function SelectedTeamsOverview() {
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch<any>();
  const router = useRouter();
  // const { tourId } = useParams();
  const params = useParams();
  const tourId = params?.tourId as string | undefined;

  const { teams, loading, success } = useSelector(
    (state: RootState) => state.teams
  );

  const { userId, userWalletAddress } = useAppSelector((state) => state.user);
  const { isParticiapated } = useAppSelector((state) => state.tournaments);

  // Get the points from redux store using the same approach as SolanaNavbar
  const { points } = useAppSelector((state) => state.user);

  const totalSelectedTeams =
    teams.sections?.reduce(
      (total, section) => total + section.selectedTeams.length,
      0
    ) || 0;

  // Calculate total points of selected team members
  const totalTeamPoints =
    teams.sections?.reduce(
      (total, section) =>
        total +
        section.selectedTeams.reduce(
          (sectionTotal, team) => sectionTotal + (team.points || 0),
          0
        ),
      0
    ) || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      createConfetti();

      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="max-w-md w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5"
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Team Created Successfully! 🎉
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to your profile...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ),
        { duration: 2000 }
      );

      // Reset and redirect after delay
      const timer = setTimeout(() => {
        resetTeams();
        router.push(`/user/${userId}`);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const resetTeams = () => {
    dispatch(resetStatus());
    dispatch(resetTournamentState());
    setTeamName("");
    setIsOpen(false);
    // setShowSuccess(false);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    if (totalSelectedTeams === 0) {
      toast.error("Please select at least one team member");
      return;
    }

    console.log(userWalletAddress);

    try {
      // First, dispatch the participation action and await its result
      const participationResult = await dispatch(
        participateInTournament(tourId as string, userWalletAddress)
      );
      console.log(participationResult);

      // Check if participation was successful
      // This assumes your participateInTournament action returns the API response
      if (participationResult && participationResult.success) {
        // Now proceed with saving teams
        const userId1 = localStorage.getItem("UserId") || "";
        await dispatch(
          saveTeams({
            userId: userId1,
            teamName,
            teams,
            walletUserId: userId,
            tournamentId: tourId as string,
            totalPoints: totalTeamPoints, // Pass total team points here
          })
        );
      } else {
        // Handle case where participation failed
        toast.error("Failed to participate in tournament");
      }
    } catch (error) {
      toast.error("Failed to create team");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const SuccessOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-2xl text-center max-w-md w-full relative z-[70]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <Users className="h-10 w-10 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Team Created!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-neutral-600 dark:text-neutral-400"
        >
          Redirecting to your profile...
        </motion.p>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {/* Toggle Button with Notification */}
      <AnimatePresence>
        {(isOpen || showSuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 ${
              showSuccess ? "backdrop-blur-md" : "backdrop-blur-sm"
            }`}
            onClick={() => !showSuccess && setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>

      {/* Toggle Button with Notification */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <div className="relative">
          <Button
            ref={buttonRef}
            onClick={handleToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-12 w-12 group transition-all duration-300 hover:w-40 flex items-center justify-end gap-2 bg-blue-700 dark:bg-blue-800 text-white dark:text-white rounded-l-full shadow-lg pr-2"
          >
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                  onClick={handleToggle}
                >
                  Your Team
                </motion.span>
              )}
            </AnimatePresence>
            {isOpen ? (
              <ChevronRight className="h-5 w-5 transition-transform group-hover:scale-110 ml-auto" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:scale-110 ml-auto" />
            )}
          </Button>

          {totalSelectedTeams > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {totalSelectedTeams}
            </div>
          )}
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div
        ref={sidebarRef}
        className={`fixed right-0 top-0 h-full w-96 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Previous sidebar content remains the same */}
        <div className="flex flex-col h-full p-8 space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Users className="h-8 w-8 text-blue-600" />
              Team Builder
            </h2>
          </div>

          {/* Points display similar to SolanaNavbar */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-gray-800">
            <div className="w-6 h-6 bg-gray-600 flex items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="text-white">{points}</span>
          </div>

          {totalSelectedTeams > 0 && (
            <div className="space-y-4">
              <Input
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full border-2 focus:border-blue-500 rounded-lg py-2"
              />

              {/* Display total team points */}
              <div className="flex items-center justify-between px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Total Team Points:
                </span>
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {totalTeamPoints}
                </span>
              </div>

              <Button
                onClick={handleCreateTeam}
                disabled={isCreating || loading || !teamName.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transform transition-transform hover:scale-105"
              >
                {isCreating || loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          )}

          {totalSelectedTeams === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <Users className="h-16 w-16 text-neutral-400" />
              <p className="text-xl text-neutral-500 dark:text-neutral-400">
                No team members selected yet
              </p>
              <p className="text-sm text-neutral-400">
                Select members to start building your dream team
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              {teams.sections?.map(
                (section) =>
                  section.selectedTeams.length > 0 && (
                    <Card
                      key={section.sectionId}
                      className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border-none shadow-xl"
                    >
                      <CardHeader className="pb-2">
                        <h3 className="font-bold text-xl capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {section.name} Section
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {section.selectedTeams.map((member: Team) => (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={member._id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-100 dark:border-neutral-700"
                          >
                            <div className="relative">
                              <Image
                                src={member.image}
                                alt={member.name}
                                width={56}
                                height={56}
                                className="rounded-full object-cover border-2 border-blue-500"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold text-lg">
                                  {member.name}
                                </p>

                                {/* Points display for each team member */}
                                {member.points && (
                                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="M12 6v6l4 2" />
                                    </svg>
                                    <span className="text-white text-xs">
                                      {member.points}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {member.followers.toLocaleString()} followers
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
