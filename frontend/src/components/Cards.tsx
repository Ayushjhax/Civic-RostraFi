import React from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import Image from "next/image";
import { Clock, Users, Check, CalendarClock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/store/tournamentSlice";
import { useRouter } from "next/navigation";
import { setCurrentTournament } from "@/store/userSlice";

interface PlatformCardProps {
  platform: string;
  image: string;
  icon: string;
  tournamentData: Tournament;
  href?: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  image,
  icon,
  tournamentData,
  href = "twitterTeams",
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userWalletAddress } = useAppSelector((state) => state.user);
  console.log(tournamentData);

  const calculateTimeRemaining = () => {
    const now = new Date();
    let targetDate;
    let eventType = "";

    // Check if registration is open but tournament hasn't started
    if (tournamentData.isRegistrationOpen && !tournamentData.isOngoing) {
      targetDate = new Date(tournamentData.registrationEndDate);
      eventType = "registration";
    }
    // Check if tournament is pending (after registration, before start)
    else if (
      !tournamentData.isRegistrationOpen &&
      !tournamentData.isOngoing &&
      tournamentData.isActive
    ) {
      targetDate = new Date(tournamentData.startDate);
      eventType = "tournament";
    }
    // Check if tournament is ongoing
    else if (tournamentData.isOngoing) {
      targetDate = new Date(tournamentData.endDate);
      eventType = "end";
    }
    // Default case
    else {
      return { hours: 0, minutes: 0, totalMinutes: 0, eventType: "none" };
    }

    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    return {
      hours: Math.floor(diffMinutes / 60),
      minutes: diffMinutes % 60,
      totalMinutes: diffMinutes,
      eventType,
    };
  };

  const timeRemaining = calculateTimeRemaining();

  const formatTimeRemaining = (): string => {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
  };

  const participantsCount = tournamentData.participated
    ? tournamentData.participated.length
    : 0;

  const hasUserParticipated =
    userWalletAddress &&
    tournamentData.participated &&
    tournamentData.participated.some(
      (participant) =>
        (typeof participant === "string" &&
          participant === userWalletAddress) ||
        (typeof participant === "object" &&
          (participant as { walletAddress: string }).walletAddress ===
            userWalletAddress)
    );

  const getPlatformStyles = (
    platform: string
  ): { background: string; text: string } => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return {
          background: "bg-gray-900",
          text: "text-white",
        };
      case "instagram":
        return {
          background:
            "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          text: "text-white",
        };
      case "tiktok":
        return {
          background: "bg-[#010101]",
          text: "text-white",
        };
      default:
        return {
          background: "bg-gray-600",
          text: "text-white",
        };
    }
  };

  const platformStyles = getPlatformStyles(platform);

  // Handle action dispatch and routing
  const handleCreateTeam = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userWalletAddress) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a team.",
      });
      return;
    }

    // Dispatch action to store selected tournament data before navigation
    dispatch(setCurrentTournament(tournamentData._id));

    // Navigate to the destination route
    router.push(`${href}/${tournamentData._id}`);
  };

  // Determine button text and state based on tournament status and user participation
  const getButtonConfig = () => {
    // If user has already participated
    if (hasUserParticipated) {
      return {
        text: "Already Participated",
        enabled: false,
        className: "bg-green-600 text-white cursor-not-allowed",
        icon: <Check className="w-4 h-4 mr-1" />,
      };
    }

    // Handle other tournament states
    if (!tournamentData.isActive) {
      return {
        text: "Tournament Ended",
        enabled: false,
        className: "bg-gray-500 text-white cursor-not-allowed opacity-70",
        icon: null,
      };
    } else if (tournamentData.isRegistrationOpen && !tournamentData.isOngoing) {
      return {
        text: "Register Now",
        enabled: true,
        className: `${platformStyles.background} ${platformStyles.text} hover:opacity-90`,
        icon: null,
      };
    } else if (
      !tournamentData.isRegistrationOpen &&
      !tournamentData.isOngoing
    ) {
      return {
        text: "Coming Soon",
        enabled: false,
        className: "bg-amber-500 text-white cursor-not-allowed",
        icon: null,
      };
    } else if (tournamentData.isOngoing) {
      return {
        text: "Create Team",
        enabled: true,
        className: `${platformStyles.background} ${platformStyles.text} hover:opacity-90`,
        icon: null,
      };
    } else {
      return {
        text: "Create Team",
        enabled: false,
        className: "bg-gray-500 text-white cursor-not-allowed",
        icon: null,
      };
    }
  };

  const buttonConfig = getButtonConfig();

  // Get status badge text
  const getStatusBadge = () => {
    if (hasUserParticipated) {
      return {
        text: "Participated",
        className: "bg-green-600 text-white",
      };
    } else if (!tournamentData.isActive) {
      return {
        text: "Ended",
        className: "bg-red-500 text-white",
      };
    } else if (tournamentData.isRegistrationOpen && !tournamentData.isOngoing) {
      return {
        text: "Registration Open",
        className: "bg-blue-500 text-white",
      };
    } else if (!tournamentData.isOngoing) {
      return {
        text: "Coming Soon",
        className: "bg-amber-500 text-white",
      };
    } else if (tournamentData.isOngoing) {
      return {
        text: "Live",
        className: "bg-green-500 text-white",
      };
    } else {
      return {
        text: "",
        className: "",
      };
    }
  };

  const statusBadge = getStatusBadge();

  // Get timer description based on event type
  const getTimerDescription = () => {
    switch (timeRemaining.eventType) {
      case "registration":
        return "Registration closes in";
      case "tournament":
        return "Tournament starts in";
      case "end":
        return "Tournament ends in";
      default:
        return tournamentData.isActive
          ? "Tournament Live!"
          : "Tournament Ended";
    }
  };

  console.log(tournamentData);

  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-black/80 relative group/card border-white/[0.2] w-[20rem] h-[26rem] rounded-xl p-4 border">
        {/* Status Badge */}
        {statusBadge.text && (
          <CardItem translateZ="80" className="absolute top-4 left-4 z-10">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.className}`}
            >
              {statusBadge.text}
            </div>
          </CardItem>
        )}

        {/* Platform Icon */}
        <CardItem translateZ="50" className="absolute top-4 right-4 w-8 h-8">
          <Image
            src={icon}
            width={32}
            height={32}
            alt={`${platform} icon`}
            className="rounded-full"
          />
        </CardItem>

        {/* Title */}
        <CardItem translateZ="50" className="text-xl font-bold text-white mb-2">
          {tournamentData.name || `${platform} Tournament`}
        </CardItem>

        {/* Main Image */}
        <CardItem translateZ="100" className="w-full mt-2">
          <Image
            src={image}
            height={400}
            width={400}
            className="h-44 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={`${platform} tournament`}
          />
        </CardItem>

        {/* Information Section */}
        <div className="space-y-2 mt-4">
          {/* Time Remaining */}
          <CardItem
            translateZ="50"
            className="flex items-center text-white/90 text-base"
          >
            {timeRemaining.eventType === "registration" ? (
              <CalendarClock className="w-4 h-4 mr-2" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            <span className="font-medium">
              {timeRemaining.totalMinutes > 0 ? (
                <>
                  {getTimerDescription()}: {formatTimeRemaining()}
                </>
              ) : (
                getTimerDescription()
              )}
            </span>
          </CardItem>

          {/* Participants Count */}
          <CardItem
            translateZ="50"
            className="flex items-center text-white/90 text-base"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {participantsCount} participants
            </span>
          </CardItem>

          {/* Prize Pool */}
          <CardItem
            translateZ="50"
            className="text-base text-white/90 font-medium"
          >
            Prize Pool: {tournamentData.prizePool} SOL
          </CardItem>
        </div>

        {/* Action Button - Centered */}
        <div className="flex justify-center mt-4">
          <CardItem
            translateZ={20}
            as="button"
            onClick={buttonConfig.enabled ? handleCreateTeam : undefined}
            className={`px-6 py-1.5 rounded-lg ${buttonConfig.className} text-sm font-bold transition-opacity flex items-center justify-center`}
          >
            {buttonConfig.icon}
            {buttonConfig.text}
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default PlatformCard;
