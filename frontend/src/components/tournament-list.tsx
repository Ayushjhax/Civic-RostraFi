"use client";

import { useEffect, useState } from "react";
import TournamentCard from "./tournament-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/hooks/reduxHooks";

export interface Tournament {
  createdAt: string;
  endDate: string;
  icon: string;
  id: string;
  image: string;
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  name: string;
  participated: string[];
  platform: string;
  pointsForVisit: number;
  prizePool: number;
  registrationEndDate: string;
  registrationTimeLimit: number;
  startDate: string;
  timeLimit: number;
  updatedAt: string;
  visited: string[];
  __v: number;
  _id: string;
}

export default function TournamentList() {
  //   const [tournaments1, setTournaments] = useState<Tournament[]>([]);
  //   const [loading, setLoading] = useState(true);
  const { tournaments, loading } = useAppSelector((state) => state.tournaments);
  //   console.log(tournaments);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900"
          >
            <Skeleton className="h-48 w-full bg-gray-800" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-8 w-3/4 bg-gray-800" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3 bg-gray-800" />
                <Skeleton className="h-4 w-1/3 bg-gray-800" />
              </div>
              <Skeleton className="h-10 w-full mt-4 bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
