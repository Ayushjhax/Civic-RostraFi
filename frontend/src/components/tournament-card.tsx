"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticipantsDialog from "./participants-dialog";

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

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const [showParticipants, setShowParticipants] = useState(false);

  const getStatusBadge = () => {
    if (tournament.isOngoing) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Ongoing
        </Badge>
      );
    }
    if (tournament.isRegistrationOpen) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Registration Open
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-300 border-gray-600">
        Upcoming
      </Badge>
    );
  };

  const timeRemaining = () => {
    const endDate = new Date(tournament.endDate);
    if (endDate > new Date()) {
      return formatDistanceToNow(endDate, { addSuffix: true });
    }
    return "Ended";
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:border-purple-800 group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={tournament.image || "/placeholder.svg"}
          alt={tournament.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm p-1 flex items-center justify-center">
            <Image
              src={tournament.icon || "/placeholder.svg"}
              alt={tournament.platform}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <Badge
            variant="secondary"
            className="font-medium bg-white/10 backdrop-blur-sm text-white border-0"
          >
            {tournament.platform}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold mb-1 text-white line-clamp-1">
            {tournament.name}
          </h3>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-300">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              <span>
                Prize Pool:{" "}
                <span className="text-white font-semibold">
                  {`${tournament.prizePool} Sol`}
                </span>
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              <span>
                Ends:{" "}
                <span className="text-white font-semibold">
                  {timeRemaining()}
                </span>
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-purple-500"
          onClick={() => setShowParticipants(true)}
        >
          <Users className="w-4 h-4" />
          <span>View Participants</span>
        </Button>
      </div>

      <ParticipantsDialog
        tournamentId={tournament._id}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        tournamentName={tournament.name}
      />
    </div>
  );
}
