"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Wallet,
  Trophy,
  Settings,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
  Heart,
  MessageSquare,
  Eye,
  Share2,
  Users,
  BarChart,
  History,
  SwitchCamera,
  Copy,
  Loader,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchUserTournaments,
  Tournament,
  userCurrentTournaments,
  userWalletConnect,
} from "@/store/userSlice";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationComponent } from "@/components/Notification";
import { WalletDialog } from "@/components/WalletDialog";
import Navbar from "@/components/Navbar";
import UserProfileButton from "@/components/UserDropdown";
import { useUser } from "@civic/auth-web3/react";
import { set } from "date-fns";

// Add these interfaces at the top of your file
interface Team {
  _id: string;
  id: string;
  name: string;
  image: string;
  description?: string;
  points: number;
  twitterId: string;
  createdAt: string;
  updatedAt: string;
  audio?: string;
  followers?: number;
}

interface SectionId {
  _id: string;
  id: string;
  name: string;
}

interface TournamentSection {
  _id: string;
  id: string;
  name: string;
  sectionId: SectionId;
  selectedTeams: Team[];
}

interface TournamentId {
  _id: string;
  id: string;
  name: string;
  endDate: string;
  startDate: string;
  icon: string;
  image: string;
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  platform: string;
  prizePool: number;
  registrationEndDate: string;
}

interface UserCurrentTournament {
  _id: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  sections: TournamentSection[];
  teamName: string;
  totalFollowers: number;
  tournamentId: TournamentId;
  userId: string;
  walletUserId: string;
  twitterStats?: TwitterStats1;
  __v: number;
}

interface TwitterStats1 {
  posts: number;
  likes: number;
  comments: number;
  retweets: number;
  views: number;
  recentTweets: Tweet[];
}

interface TwitterStats {
  viewCount: number;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
  tweetCount: number;
}

interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  author: TweetAuthor;
  metrics: {
    likeCount: number;
    replyCount: number;
    retweetCount: number;
    viewCount: number;
  };
}

interface TweetAuthor {
  name: string;
  image: string;
  section: string;
}

interface TwitterData {
  stats: TwitterStats;
  tweets: Tweet[];
  lastUpdated: string;
}

// WobbleCard component
const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };
  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        "mx-auto w-full bg-indigo-800 relative rounded-2xl overflow-hidden",
        containerClassName
      )}
    >
      <div
        className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]  sm:mx-0 sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)",
        }}
      >
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
          className={cn("h-full px-4 py-6 sm:px-6", className)}
        >
          <Noise />
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
      style={{
        backgroundImage: "url(/noise.webp)",
        backgroundSize: "30%",
      }}
    ></div>
  );
};

interface TeamCardProps {
  team: Team;
  section: {
    name: string;
  };
  tournament: string; // tournamentId
}

// TeamCard component
// Modified TeamCard component with Twitter API integration
const TeamCard = ({ team, section, tournament }: TeamCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [twitterData, setTwitterData] = useState<TwitterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch Twitter data when team card is clicked
  const fetchTwitterData = async () => {
    try {
      setIsLoading(true);
      console.log(tournament);
      console.log(team.twitterId);

      // Get tournamentId and teamId from props
      const tournamentId = tournament; // Assuming tournament prop contains the tournamentId
      const twitterId = team.twitterId; // Assuming team has twitterId property

      if (!tournamentId || !twitterId) {
        console.error("Missing tournamentId or twitterId");
        return;
      }

      // Make API call to fetch Twitter data
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/userTeams/twitter/${tournamentId}/${twitterId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Twitter data: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setTwitterData(data.data);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching Twitter data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog open - fetch data when opening
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    fetchTwitterData();
  };

  const sectionColors: { [key: string]: string } = {
    diamond:
      "from-blue-900 to-blue-800 bg-blue-500/20 text-blue-300 border-blue-500/30",
    premium:
      "from-purple-900 to-purple-800 bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const colorClass = sectionColors[section.name] || "from-gray-900 to-gray-800";

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={handleDialogOpen}>
            <WobbleCard
              containerClassName={`bg-gradient-to-br ${
                colorClass.split(" ")[0]
              } ${colorClass.split(" ")[1]} w-full h-40`}
              className="p-4 h-full"
            >
              <div className="flex h-full">
                <div className="relative h-full aspect-square overflow-hidden rounded-xl mr-4">
                  <Image
                    src={team.image || "/placeholder.svg"}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {team.name}
                    </h3>
                    <Badge className="mt-1 bg-white/20 text-white">
                      {section.name.charAt(0).toUpperCase() +
                        section.name.slice(1)}
                    </Badge>
                    <p className="text-white/70 text-sm line-clamp-2 mt-1">
                      {team.description || "No description available"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-white/90">
                      <span className="font-semibold">{team.points || 0}</span>{" "}
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                </div>
              </div>
            </WobbleCard>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={team.image} />
                <AvatarFallback>
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {team.name}
              <Badge
                className={`ml-2 ${colorClass.split(" ")[2]} ${
                  colorClass.split(" ")[3]
                } ${colorClass.split(" ")[4]} border`}
              >
                {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="relative rounded-xl overflow-hidden h-56">
              <Image
                src={team.image || "/placeholder.svg"}
                alt={team.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h2 className="text-xl font-bold text-white">{team.name}</h2>
                <p className="text-white/70 text-sm mt-1">
                  {team.description ||
                    "A competitive team looking to make its mark."}
                </p>
              </div>
            </div>

            {/* Twitter Stats Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Twitter Stats</h3>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : twitterData ? (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    {
                      icon: <Eye size={18} />,
                      label: "Views",
                      value: twitterData.stats.viewCount.toLocaleString(),
                    },
                    {
                      icon: <Heart size={18} />,
                      label: "Likes",
                      value: twitterData.stats.likeCount.toLocaleString(),
                    },
                    {
                      icon: <MessageSquare size={18} />,
                      label: "Replies",
                      value: twitterData.stats.replyCount.toLocaleString(),
                    },
                    {
                      icon: <RefreshCw size={18} />,
                      label: "Retweets",
                      value: twitterData.stats.retweetCount.toLocaleString(),
                    },
                    {
                      icon: <TrendingUp size={18} />,
                      label: "Tweets",
                      value: twitterData.stats.tweetCount.toLocaleString(),
                    },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-[#1a1a1a] border-white/10">
                      <CardContent className="p-3 flex flex-col items-center justify-center">
                        <div className="text-white/60 mb-1">{stat.icon}</div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-white/60">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border-white/10 rounded-lg p-4 text-center text-white/70">
                  No Twitter data available for this team
                </div>
              )}
            </div>

            {/* Recent Tweets Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Tweets</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader className="h-8 w-8 text-white animate-spin" />
                  </div>
                ) : twitterData &&
                  twitterData.tweets &&
                  twitterData.tweets.length > 0 ? (
                  twitterData.tweets.map((tweet, i) => (
                    <Card key={i} className="bg-[#1a1a1a] border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={team.image} />
                            <AvatarFallback>
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {team.name}
                          </span>
                          <span className="text-xs text-white/50">
                            {new Date(tweet.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">{tweet.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Heart size={12} />
                            {tweet.metrics.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {tweet.metrics.replyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw size={12} />
                            {tweet.metrics.retweetCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {tweet.metrics.viewCount}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="bg-[#1a1a1a] border-white/10 rounded-lg p-4 text-center text-white/70">
                    No tweets available
                  </div>
                )}
              </div>
            </div>

            {/* Last Updated Info */}
            {twitterData && (
              <div className="text-xs text-white/50 text-right">
                Last updated:{" "}
                {new Date(twitterData.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface TournamentCardProps {
  tournament: UserCurrentTournament;
}

// Tournament Card component
const TournamentCard = ({ tournament }: TournamentCardProps) => {
  const [loading, setLoading] = useState(false);
  console.log(tournament);

  const endDate = new Date(tournament.tournamentId.endDate);
  const startDate = new Date(tournament.tournamentId.startDate);
  const now = new Date();
  const remainingDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimeStatus = () => {
    if (remainingDays <= 0) {
      return "Ended recently";
    } else if (remainingDays === 1) {
      return "Ends tomorrow";
    } else {
      return `Ends in ${remainingDays} days`;
    }
  };

  const getStartTimeStatus = () => {
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (now < startDate) {
      if (daysUntilStart <= 0) {
        return "Starting soon";
      } else if (daysUntilStart === 1) {
        return "Starts tomorrow";
      } else {
        return `Starts in ${daysUntilStart} days`;
      }
    }
    return null;
  };

  // Combine all teams from all sections
  const allTeams = tournament.sections.flatMap((section) =>
    section.selectedTeams.map((team) => ({
      ...team,
      section: section.sectionId.name,
    }))
  );

  // Use the Twitter stats provided directly from the backend
  const tweetStats = tournament.twitterStats || {
    posts: 0,
    likes: 0,
    comments: 0,
    retweets: 0,
    views: 0,
    recentTweets: [],
  };

  // Format time since tweet was posted
  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="bg-[#111] border-white/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={tournament.tournamentId.image || "/placeholder.svg"}
            alt={tournament.tournamentId.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage src={tournament.tournamentId.icon} />
                <AvatarFallback>
                  {tournament.tournamentId.platform.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <Badge className="bg-white/20 backdrop-blur-md text-white">
                {tournament.tournamentId.platform}
              </Badge>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white">
                {tournament.tournamentId.name}
              </h3>
              <Badge
                className={
                  tournament.tournamentId.isOngoing
                    ? "bg-white text-black"
                    : "bg-gray-600"
                }
              >
                {tournament.tournamentId.isOngoing ? "Active" : "Completed"}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-white/70">
                {getStartTimeStatus() || getTimeStatus()}
              </div>
              <div className="text-sm text-white/70">
                Prize: {tournament.tournamentId.prizePool} SOL
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          {/* If tournament hasn't started, show a special message */}
          {now < startDate && (
            <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-white/70" />
                  <span className="font-medium">Tournament Starts Soon</span>
                </div>
                <div className="text-sm text-white/50 mt-2">
                  Start Date: {startDate.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/10 rounded-full p-1.5">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">
              Your Team: {tournament.teamName}
            </span>
          </div>

          {/* Tournament Stats */}
          <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-white/70" />
                  Tournament Stats
                </h3>
                <Badge className="bg-white/10 text-white">
                  {tournament.tournamentId.name}
                </Badge>
              </div>

              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader className="h-6 w-6 text-white animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      {
                        label: "Teams",
                        value: allTeams.length,
                        icon: <Users className="h-3 w-3" />,
                      },
                      {
                        label: "Posts",
                        value: tweetStats.posts,
                        icon: <TrendingUp className="h-3 w-3" />,
                      },
                      {
                        label: "Likes",
                        value: tweetStats.likes,
                        icon: <Heart className="h-3 w-3" />,
                      },
                      {
                        label: "Comments",
                        value: tweetStats.comments,
                        icon: <MessageSquare className="h-3 w-3" />,
                      },
                      {
                        label: "Views",
                        value: tweetStats.views,
                        icon: <Eye className="h-3 w-3" />,
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-2 text-center"
                      >
                        <div className="text-gray-400 text-xs flex items-center justify-center gap-1 mb-1">
                          {stat.icon}
                          {stat.label}
                        </div>
                        <div className="text-white font-semibold">
                          {stat.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-white/50 mt-2">
                    Tracking since:{" "}
                    {new Date(tournament.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tournament Recent Posts */}
          <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-white/70" />
                Recent Tournament Activity
              </h3>

              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader className="h-6 w-6 text-white animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tweetStats.recentTweets.length > 0 ? (
                    tweetStats.recentTweets.map((tweet, i) => (
                      <Card
                        key={tweet.id || i}
                        className="bg-black/30 border-white/5"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={tweet.author.image} />
                              <AvatarFallback>
                                {tweet.author.name
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {tweet.author.name}
                            </span>
                            <Badge className="text-xs bg-white/10 text-white/80">
                              {tweet.author.section.charAt(0).toUpperCase() +
                                tweet.author.section.slice(1)}
                            </Badge>
                            <span className="text-xs text-white/50 ml-auto">
                              {formatTimeSince(tweet.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-white/80">
                            {tweet.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Heart size={12} />
                              {tweet.metrics.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              {tweet.metrics.replyCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw size={12} />
                              {tweet.metrics.retweetCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {tweet.metrics.viewCount}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-4 text-white/50">
                      No recent tweets found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Teams */}
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-white/70" />
            Tournament Teams
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {allTeams.map((team, teamIndex) => (
              <TeamCard
                key={teamIndex}
                team={team}
                section={{ name: team.section }}
                tournament={tournament.tournamentId._id}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Define base interfaces for nested objects
interface TournamentDetails {
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

interface TeamMember {
  audio?: string;
  createdAt: string;
  description: string;
  followers: number;
  id: string;
  image: string;
  name: string;
  points: number;
  twitterId: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

interface Section {
  id: string;
  name: string;
  sectionId: string;
  selectedTeams: TeamMember[];
  _id: string;
}

interface UserTeam {
  createdAt: string;
  id: string;
  isActive: boolean;
  sections: Section[];
  teamName: string;
  totalFollowers: number;
  tournamentId: string;
  updatedAt: string;
  userId: string;
  walletUserId: string;
  __v: number;
  _id: string;
}

// Main interface for the tournament data
interface UserTournament {
  userTeam: UserTeam;
  tournamentDetails: TournamentDetails;
  isActive: boolean;
  isOngoing: boolean;
}

export default function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const dispatch = useAppDispatch();
  const user = useUser();

  // const { userId } = useParams();

  const params = useParams();
  const userId = params?.userId as string | undefined;

  // State for dialog controls
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [tournamentDialogOpen, setTournamentDialogOpen] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>("0");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { userCurrentTournament, points, tournaments, userTournaments } =
    useAppSelector((state) => state.user);

  const typedUserTournaments: UserTournament[] = userTournaments || [];
  const walletUserId = localStorage.getItem("UserId");

  const fetchWalletBalance = async (address: string) => {
    try {
      // Use the Connection class from @solana/web3.js instead of solana.Connection
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      const publicKey = new PublicKey(address);
      const balanceInLamports = await connection.getBalance(publicKey);

      const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
      // console.log("Wallet balance in SOL:", balanceInSol);
      setBalance(balanceInSol.toFixed(3));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    dispatch(userWalletConnect(walletUserId as string));
    dispatch(userCurrentTournaments(walletUserId as string, userId as string));

    // dispatch(fetchUserTournaments(walletUserId as string));
  }, [userId, walletUserId, dispatch]);

  useEffect(() => {
    if (walletUserId) {
      fetchWalletBalance(walletUserId);
    }
  }, []);

  const handleOpenWalletDialog = () => {
    fetchWalletBalance(walletUserId as string);
    setWalletDialogOpen(false);
  };

  // Function to handle opening tournament dialog
  const handleOpenTournamentDialog = () => {
    // Fetch user tournaments data before opening dialog
    dispatch(fetchUserTournaments(walletUserId as string));
    setTournamentDialogOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-black text-white overflow-hidden"
      ref={containerRef}
    >
      {/* Animated Background */}
      <Navbar />
      <div className="absolute flex flex-row gap-3 top-4 right-4 z-50">
        <UserProfileButton />
      </div>
      <motion.div
        className="relative h-64 overflow-hidden"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black">
          {/* Animated Stars/Sparkles */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.7, 0.2, 0.7],
                scale: [1, Math.random() * 1.5 + 0.5, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}

          {/* Glowing Lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                width: "100%",
                top: `${20 + i * 15}%`,
                opacity: 0.2,
                left: 0,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Profile Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-full border-2 border-white/20 p-1 bg-black relative z-10"
            >
              <div className="rounded-full overflow-hidden relative h-32 w-32">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-[#111]">CG</AvatarFallback>
                </Avatar>
              </div>

              {/* Animated Rings */}
              {[40, 30, 20, 10].map((delay, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-full border border-white/5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}

              <motion.div
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-black"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="bg-black rounded-full p-1">
                  <Star className="h-5 w-5 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-center"
          >
            <motion.h1
              className="text-2xl font-bold text-white"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {`rostera/${walletUserId}`}
            </motion.h1>

            <div className="flex items-center justify-center gap-2 mt-2">
              {/* Wallet - Now Clickable */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
                onClick={() => setWalletDialogOpen(true)}
              >
                <Wallet className="h-4 w-4 text-white/70" />
                <span>{balance}</span>
              </motion.div>

              {/* Points */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"
              >
                <Trophy className="h-4 w-4 text-white/70" />
                <span>{points || 0} Points</span>
              </motion.div>

              {/* New Transactions Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
                onClick={() => setTransactionsDialogOpen(true)}
              >
                <History className="h-4 w-4 text-white/70" />
                <span>Transactions</span>
              </motion.div>

              {/* Settings - Now Clickable */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
                onClick={() => setSettingsDialogOpen(true)}
              >
                <Settings className="h-4 w-4 text-white/70" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        <NotificationComponent userId={`${userId}`} />

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stats Cards - Tournaments Card Now Clickable */}
            {[
              {
                title: "Total Tournaments",
                value: `${tournaments}`,
                icon: <Trophy className="h-5 w-5 text-white/70" />,
                trend: `+${tournaments} this month`,
                trendUp: true,
                onClick: handleOpenTournamentDialog, // Using the new handler
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ x: 20 * i, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer"
                onClick={stat.onClick}
              >
                <WobbleCard
                  containerClassName="bg-gradient-to-br from-[#1a1a1a] to-black"
                  className="p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                        {stat.icon}
                        {stat.title}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        stat.trendUp
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {stat.trend}
                    </div>
                  </div>
                </WobbleCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Current Tournaments */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-white/70" />
              Your Tournaments
            </h2>
          </div>

          <div className="space-y-8">
            {Array.isArray(userCurrentTournament) &&
              userCurrentTournament.map(
                (tournament: UserCurrentTournament, index: number) => (
                  <TournamentCard key={index} tournament={tournament} />
                )
              )}
          </div>
        </motion.div>
      </div>

      {/* Wallet Dialog */}

      <WalletDialog
        isOpen={walletDialogOpen}
        onClose={handleOpenWalletDialog}
      />

      {/* Tournament Dialog - Updated */}
      <Dialog
        open={tournamentDialogOpen}
        onOpenChange={setTournamentDialogOpen}
      >
        <DialogContent className="bg-[#111] border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Tournament Details
            </DialogTitle>
          </DialogHeader>

          {typedUserTournaments && userTournaments.length > 0 ? (
            <div className="space-y-4">
              {typedUserTournaments.map((tournament, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {tournament.tournamentDetails.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {tournament.isActive && tournament.isOngoing ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                              Inactive
                            </span>
                          )}
                          <span className="text-xs text-white/60">
                            {new Date(
                              tournament.tournamentDetails.startDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              tournament.tournamentDetails.endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tournament.userTeam && (
                    <div className="border-t border-white/10 pt-3">
                      <div className="text-white/60 text-sm mb-2">
                        Your Team
                      </div>
                      <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg">
                        <div className="font-medium">
                          {tournament.userTeam.teamName}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-white/60">
                            {tournament.userTeam.sections.reduce(
                              (total, section) =>
                                total + section.selectedTeams.length,
                              0
                            )}{" "}
                            players
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/40" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                    <div className="bg-black/60 p-3 rounded-lg">
                      <div className="text-white/60 text-xs mb-1">
                        Current Status
                      </div>
                      <div className="font-bold">
                        {tournament.tournamentDetails.isOngoing
                          ? "Ongoing"
                          : "Completed"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">
                No Tournaments
              </h3>
              <p className="text-white/60 text-sm">
                You haven't joined any tournaments yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog
        open={transactionsDialogOpen}
        onOpenChange={setTransactionsDialogOpen}
      >
        <DialogContent className="bg-[#111] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/5 hover:bg-white/10 border-white/10 text-white flex-1"
              >
                All
              </Button>
              <Button variant="ghost" className="text-white/70 flex-1">
                Deposits
              </Button>
              <Button variant="ghost" className="text-white/70 flex-1">
                Withdrawals
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                {
                  type: "Deposit",
                  amount: "+1.5 SOL",
                  date: "Feb 20, 2025",
                  status: "Completed",
                },
                {
                  type: "Withdraw",
                  amount: "-0.8 SOL",
                  date: "Feb 15, 2025",
                  status: "Completed",
                },
                {
                  type: "Tournament Prize",
                  amount: "+0.7 SOL",
                  date: "Feb 10, 2025",
                  status: "Completed",
                },
                {
                  type: "Tournament Entry",
                  amount: "-0.1 SOL",
                  date: "Feb 5, 2025",
                  status: "Completed",
                },
              ].map((tx, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-xs text-white/60">{tx.date}</div>
                  </div>
                  <div
                    className={
                      tx.amount.startsWith("+")
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
            >
              Export Transactions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="bg-[#111] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white/70">
                Display Name
              </Label>
              <Input
                id="displayName"
                defaultValue={`rostera/${walletUserId}`}
                className="bg-black/40 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-black/40 border-white/10"
                value={user?.user?.email}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="/placeholder.svg?height=64&width=64"
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-[#111]">CG</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white/10 text-white"
                >
                  Change
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <SwitchCamera />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <SwitchCamera />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                className="bg-white/5 hover:bg-white/10 border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button className="bg-white text-black hover:bg-white/90">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
