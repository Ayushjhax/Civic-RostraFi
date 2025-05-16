"use client";

import { useState, useEffect } from "react";
import GlowingContainer from "@/components/GlowingContainer";
import { RulesModel } from "@/components/RulesModel";
import { TeamsHeader } from "@/components/TeamsHeader";
import { TeamSection } from "@/components/teamsSection";
import { ColourfulText } from "@/components/ui/colourful-text";
import { Cover } from "@/components/ui/cover";
import { SelectedTeamsOverview } from "@/components/SelectedTeamsOverview";
import { AuroraBack } from "@/components/aroraBack";
import SolanaNavbar from "@/components/SolanaBar";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addUserPoints, userWalletConnect } from "@/store/userSlice";
import CelebrationDialog from "@/components/CelebrationDialog";
import { useParams } from "next/navigation";
import Link from "next/link";
import { WobbleTeamSection } from "@/components/Wobbles";

export interface Team {
  _id: string;
  name: string;
  image: string;
  description: string;
  followers: number;
  points: number;
}
export interface Section {
  name: string;
  sectionId: string;
  // selectedTeams: Team[];
  _id: string;
  teams: Team[];
}

export default function Page() {
  const [teamsData, setTeamsData] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  // const { tourId } = useParams();

  const params = useParams();
  const tourId = params?.tourId as string | undefined;

  useEffect(() => {
    async function fetchTeamsData() {
      try {
        setIsLoading(true);
        const res = await fetch("https://be1.rostrafi.fun/api/v1/sections");

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log(data);
        setTeamsData(data);
      } catch (error) {
        console.error("Failed to fetch teams data:", error);
        setError("Failed to load teams data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamsData();
  }, []);

  const { userId, userWalletAddress, currentTournament } = useAppSelector(
    (state) => state.user
  );
  console.log(currentTournament);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(userWalletConnect(localStorage.getItem("UserId") || ""));
  }, [dispatch]);

  useEffect(() => {
    const isVisited = async () => {
      const tournamentId = tourId;
      if (!tournamentId || !userWalletAddress || !userId) return;

      try {
        const requestUrl = `https://be1.rostrafi.fun/api/v1/compitition/tournaments/${tournamentId}/visit`;

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: userWalletAddress,
            userId: userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to record tournament visit");
        }

        console.log(data);
        if (data.isFirstVisit) {
          setPointsAwarded(data.pointsAwarded || 0);
          setShowCelebration(true);
          dispatch(addUserPoints(data.pointsAwarded));
        }

        if (data.isParticipant) {
          setIsParticipant(true);
        }

        return data;
      } catch (e) {
        if (e instanceof Error) {
          console.log(e);
          console.log(e.message);
        } else {
          console.log("An unknown error occurred");
        }
      }
    };

    isVisited();
  }, [tourId, userWalletAddress, userId, dispatch]);

  const handleCloseCelebration = () => {
    console.log("Closing celebration");
    setShowCelebration(false);
  };

  console.log(teamsData);

  return (
    <div className="bg-black mb-6 ">
      <SolanaNavbar />
      <TeamsHeader />
      <AuroraBack />

      {isParticipant ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="relative max-w-2xl w-full text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur-3xl opacity-30 animate-pulse" />
            <div className="relative z-10 bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-cyan-500/10">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-20 h-20 mb-4">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                  Tournament Entry Confirmed!
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  You've successfully entered the tournament with your selected
                  teams. Sit back and watch the competition unfold on the
                  blockchain!
                </p>
                <Link
                  href="/user"
                  className="inline-block px-8 py-3 text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                >
                  View Profile Dashboard
                </Link>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <div className="flex items-center text-cyan-400">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span>Entry Locked</span>
                </div>
                <div className="flex items-center text-purple-400">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>NFT Badge Earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-2xl" />
            <h1 className="relative group text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              <span className="relative inline-block">
                <Cover>Create Your</Cover>
              </span>{" "}
              Ultimate <ColourfulText text="Influencer Lineup" />
            </h1>
          </div>

          {isLoading ? (
            <div className="text-white text-center py-10">
              Loading teams data...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : (
            teamsData.map((section) => (
              <div
                key={section._id}
                className="flex justify-start flex-col w-full mt-10"
              >
                <TeamSection
                  teamSectionName={section.name}
                  teamsSectionId={section._id}
                />
                <GlowingContainer>
                  <WobbleTeamSection
                    sectionName={section.name}
                    teamsSectionId={section._id}
                    teams={section.teams}
                  />
                </GlowingContainer>
              </div>
            ))
          )}

          <RulesModel />
          <SelectedTeamsOverview />
        </>
      )}

      {showCelebration && (
        <CelebrationDialog
          points={pointsAwarded}
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
