"use client";

import { useState, useRef, useId, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTeams } from "@/store/teamsSlice";
import { Team } from "@/types/team.types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAppSelector } from "@/hooks/reduxHooks";
import { addUserPoints, removeUserPoints } from "@/store/userSlice";
import toast from "react-hot-toast";
import { useOutsideClick } from "../hooks/use-outside-click";
import { useParams } from "next/navigation";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Coins } from "lucide-react";

type SelectionState = {
  isPending: boolean;
  isSelected: boolean;
};

interface SelectionMap {
  [key: string]: SelectionState;
}

interface WobbleTeamSectionProps {
  sectionName: string;
  teamsSectionId: string;
  teams: Team[];
}

export function WobbleTeamSection({
  sectionName,
  teams,
  teamsSectionId,
}: WobbleTeamSectionProps) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team[]>([]);
  const [selectionStates, setSelectionStates] = useState<SelectionMap>({});
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  const dispatch = useDispatch();
  // const { tourId } = useParams();
  const params = useParams();
  const tourId = params?.tourId as string | undefined;

  const { points } = useAppSelector((state) => state.user);

  const handleTeamUpdate = (selectedTeam: Team[]) => {
    dispatch(
      setTeams({
        sectionName,
        sectionId: teamsSectionId,
        selectedTeam,
      })
    );
  };

  useOutsideClick(ref, () => setActiveTeam(null));

  // Close dialog when escape key is pressed
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDialogOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleTeamSelection = (member: Team) => {
    const currentState = selectionStates[member.name] || {
      isPending: false,
      isSelected: false,
    };

    if (currentState.isSelected) {
      // Remove from team and restore points
      const updatedTeam = selectedTeam.filter(
        (teamMember) => teamMember.name !== member.name
      );
      setSelectedTeam(updatedTeam);
      setSelectionStates({
        ...selectionStates,
        [member.name]: { isPending: false, isSelected: false },
      });
      handleTeamUpdate(updatedTeam);

      // Restore points when removing a team member - now tournament specific
      const pointsToRestore = member.points || 250;
      dispatch(addUserPoints(pointsToRestore));

      toast.success(
        `Removed ${member.name}. +${pointsToRestore} points returned.`
      );

      // Show points info when a team member is removed
      setShowPointsInfo(true);
      setTimeout(() => setShowPointsInfo(false), 3000);
    } else {
      // Check if we have enough points
      const memberPoints = member.points || 250;
      if (points < memberPoints) {
        toast.error(
          `Not enough points! You need ${memberPoints} points to select ${member.name}.`
        );

        // Show points info when selection fails due to insufficient points
        setShowPointsInfo(true);
        setTimeout(() => setShowPointsInfo(false), 3000);
        return;
      }

      // Start selection process
      setSelectionStates({
        ...selectionStates,
        [member.name]: { isPending: true, isSelected: false },
      });

      // Animate and then add to team after delay
      setTimeout(() => {
        const updatedTeam = [...selectedTeam, member];
        setSelectedTeam(updatedTeam);
        setSelectionStates({
          ...selectionStates,
          [member.name]: { isPending: false, isSelected: true },
        });
        handleTeamUpdate(updatedTeam);

        // Deduct points when adding a team member - now tournament specific

        dispatch(removeUserPoints(memberPoints));

        toast.success(
          `Added ${member.name} to your team. -${member.points || 250} points.`
        );

        // Show points info when a team member is added
        setShowPointsInfo(true);
        setTimeout(() => setShowPointsInfo(false), 3000);
      }, 800);
    }
  };

  const getMemberState = (member: Team): SelectionState => {
    return (
      selectionStates[member.name] || { isPending: false, isSelected: false }
    );
  };

  // Check if we can afford this team member
  const canAfford = (member: Team): boolean => {
    const memberPoints = member.points || 250;
    return points >= memberPoints || getMemberState(member).isSelected;
  };

  // Handle opening the team details dialog
  const handleOpenDialog = (team: Team) => {
    if (canAfford(team) || getMemberState(team).isSelected) {
      setActiveTeam(team);
      setDialogOpen(true);
    }
  };

  // Generate a background color for each card based on the team name
  const getCardBackground = (teamName: string) => {
    // Simple hash function to get a consistent color
    const hash = teamName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const hue = Math.abs(hash % 360);

    // Defined list of background colors for visual consistency
    const bgColors = [
      "bg-blue-900",
      "bg-purple-900",
      "bg-pink-800",
      "bg-indigo-900",
      "bg-cyan-900",
      "bg-emerald-900",
      "bg-amber-900",
      "bg-rose-900",
    ];

    return bgColors[Math.abs(hash) % bgColors.length];
  };

  return (
    <div className="px-2 md:px-4 lg:px-6 max-w-full mx-auto">
      {/* Section Header */}
      <div className="mb-4 flex justify-between items-center">
        <AnimatePresence>
          {showPointsInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full"
            >
              <span className="text-purple-400 font-medium">
                Points Remaining:
              </span>
              <span className="text-purple-300 font-bold">{points}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team Grid - Optimized for more cards per row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {teams.map((member) => {
          const isSelected = getMemberState(member).isSelected;
          const canSelectTeam = canAfford(member) || isSelected;

          return (
            <motion.div
              key={`card-${member.name}-${id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: teams.indexOf(member) * 0.1,
              }}
            >
              <WobbleCard
                containerClassName={`w-full h-[320px] relative transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "ring-4 ring-green-500 ring-opacity-50"
                    : !canSelectTeam
                    ? "opacity-70 grayscale"
                    : ""
                }`}
                className="cursor-pointer relative"
              >
                {/* Rest of the card content remains the same as in the previous implementation */}
                <div className="absolute inset-0 bg-[rgb(21,22,22)] bg-opacity-100"></div>

                <div className="absolute inset-0 h-3/5 overflow-hidden">
                  {member.image && (
                    <div className="relative w-full h-full">
                      <Image
                        src={member.image}
                        layout="fill"
                        objectFit="cover"
                        alt={member.name}
                        className="opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgb(21,22,22)]"></div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 p-4 flex flex-col h-full">
                  <div className="mt-auto pt-28">
                    <h2 className="text-lg font-semibold text-white mb-1 truncate text-left pl-1">
                      {member.name}
                    </h2>

                    <div className="flex items-center gap-1 text-yellow-300 font-medium mb-3 pl-1">
                      <Coins size={16} />
                      <span>{member.points || 250}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canSelectTeam) {
                          if (isSelected) {
                            handleTeamSelection(member);
                          } else {
                            handleOpenDialog(member);
                          }
                        }
                      }}
                      disabled={!canSelectTeam && !isSelected}
                      className={`w-full py-2 rounded-lg font-medium transition-all
                      ${
                        isSelected
                          ? "bg-red-500/80 hover:bg-red-500 text-white"
                          : !canSelectTeam
                          ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                          : "bg-green-500/80 hover:bg-green-500 text-white"
                      }
                    `}
                    >
                      {isSelected ? "Remove" : "Select"}
                    </button>
                  </div>
                </div>
              </WobbleCard>
            </motion.div>
          );
        })}
      </div>

      {/* Team Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-black border border-gray-800 text-white p-0 max-w-3xl mx-auto overflow-hidden rounded-xl shadow-2xl"
          ref={ref}
        >
          {activeTeam && (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/80 z-10"></div>
                <Image
                  src={activeTeam.image}
                  width={400}
                  height={400}
                  alt={activeTeam.name}
                  className="w-full h-64 md:h-full object-cover shadow-inner"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">{activeTeam.name}</h2>

                <div className="flex items-center gap-2 text-yellow-300 font-medium mb-6">
                  <Coins size={20} />
                  <span>{activeTeam.points || 250} points</span>
                </div>

                <p className="text-gray-300 mb-8 flex-grow">
                  {activeTeam.description}
                </p>

                <button
                  onClick={() => {
                    if (
                      canAfford(activeTeam) ||
                      getMemberState(activeTeam).isSelected
                    ) {
                      handleTeamSelection(activeTeam);
                      setTimeout(() => setDialogOpen(false), 800);
                    }
                  }}
                  disabled={
                    !canAfford(activeTeam) &&
                    !getMemberState(activeTeam).isSelected
                  }
                  className={`px-6 py-3 rounded-lg font-bold text-white w-full
                    ${
                      getMemberState(activeTeam).isSelected
                        ? "bg-red-500 hover:bg-red-600"
                        : getMemberState(activeTeam).isPending
                        ? "bg-yellow-500"
                        : canAfford(activeTeam)
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-700 opacity-50 cursor-not-allowed"
                    } relative`}
                >
                  {getMemberState(activeTeam).isSelected
                    ? "Remove from Team"
                    : getMemberState(activeTeam).isPending
                    ? "Adding to Team..."
                    : "Add to Team"}

                  {getMemberState(activeTeam).isPending && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-yellow-500 opacity-20"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
