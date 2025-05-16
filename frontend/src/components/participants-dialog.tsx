"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export interface Participant {
  createdAt: string;
  id: string;
  isActive: boolean;
  lastActivity: string;
  walletAddress: string;
  __v: number;
  _id: string;
}

interface ParticipantsDialogProps {
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
  tournamentName: string;
}

export default function ParticipantsDialog({
  tournamentId,
  isOpen,
  onClose,
  tournamentName,
}: ParticipantsDialogProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
    }
  }, [isOpen]); // Removed unnecessary tournamentId dependency

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // In a real app, replace with your actual API call
      const response = await fetch(
        `https://be1.rostrafi.fun/api/v1/compitition/tournaments/${tournamentId}/participants`
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tournaments");
      }

      setParticipants(data.data);
      setLoading(false);

      // For demo purposes, using sample data
      //   setTimeout(() => {
      //     setParticipants([
      //       {
      //         createdAt: "2025-02-25T13:17:51.818Z",
      //         id: "67bdc2ff094274e78cbe267b",
      //         isActive: true,
      //         lastActivity: "2025-03-02T10:24:05.997Z",
      //         walletAddress: "EwhrLp8RRmD3qMmBessxRLL8qrgHVT6jodAdswErXabL",
      //         __v: 44,
      //         _id: "67bdc2ff094274e78cbe267b",
      //       },
      //       {
      //         createdAt: "2025-02-26T09:22:33.456Z",
      //         id: "67bdc2ff094274e78cbe267c",
      //         isActive: true,
      //         lastActivity: "2025-03-01T15:30:12.123Z",
      //         walletAddress: "8JKLp8RRmD3qMmBessxRLL8qrgHVT6jodAdswErXabM",
      //         __v: 22,
      //         _id: "67bdc2ff094274e78cbe267c",
      //       },
      //       {
      //         createdAt: "2025-02-27T14:45:10.789Z",
      //         id: "67bdc2ff094274e78cbe267d",
      //         isActive: true,
      //         lastActivity: "2025-03-02T08:15:45.678Z",
      //         walletAddress: "9POQp8RRmD3qMmBessxRLL8qrgHVT6jodAdswErXabN",
      //         __v: 18,
      //         _id: "67bdc2ff094274e78cbe267d",
      //       },
      //     ]);
      //     setLoading(false);
      //   }, 1000);
    } catch (error) {
      console.error("Error fetching participants:", error);
      setLoading(false);
    }
  };

  //   console.log(participants);

  const getInitials = (address: string) => {
    return address.substring(0, 2);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const formatLastActive = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Participants - {tournamentName}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-1 bg-gray-800" />
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-purple-900/50 text-purple-200">
                      {getInitials(participant.walletAddress)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {truncateAddress(participant.walletAddress)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Last active: {formatLastActive(participant.lastActivity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No participants found for this tournament.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
