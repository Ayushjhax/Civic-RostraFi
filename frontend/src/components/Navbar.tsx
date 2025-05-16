"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userId } = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    const localStorageUserId = localStorage.getItem("UserId");
    setIsAuthenticated(!!(localStorageUserId && userId));
  }, [userId]);

  const handleProfileNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push(`/user/${userId}`);
    } else {
      alert("Please log in to access your profile");
    }
  };

  return (
    <div
      className={cn("fixed top-6 inset-x-0 max-w-2xl mx-auto z-40", className)}
    >
      <Menu setActive={setActive}>
        {/* Home Menu Item */}
        <MenuItem setActive={setActive} active={active} item="Home">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/">Home</HoveredLink>
            {/* Disabled items */}
            <div className="text-gray-500 cursor-not-allowed">Features</div>
            <div className="text-gray-500 cursor-not-allowed">About</div>
          </div>
        </MenuItem>

        {/* Betting Menu Item */}
        <MenuItem setActive={setActive} active={active} item="Betting">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="https://rostrafi.fun/bettings">
              Bettings
            </HoveredLink>
            {/* Disabled items */}
            <div className="text-gray-500 cursor-not-allowed">
              Upcoming Matches
            </div>
            <div className="text-gray-500 cursor-not-allowed">Leaderboard</div>
          </div>
        </MenuItem>

        {/* Profile Menu Item */}
        <div onClick={handleProfileNavigation}>
          <MenuItem setActive={setActive} active={active} item="Profile">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="#" onClick={handleProfileNavigation}>
                Profile Overview
              </HoveredLink>
              {/* Disabled items */}
              <div className="text-gray-500 cursor-not-allowed">Settings</div>
              <div className="text-gray-500 cursor-not-allowed">
                Tournaments
              </div>
            </div>
          </MenuItem>
        </div>

        {/* Leaderboard Menu Item */}
        <MenuItem setActive={setActive} active={active} item="Leaderboard">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="https://rostrafi.fun/history">
              Past Leaderboard
            </HoveredLink>
            {/* Disabled items */}
            <div className="text-gray-500 cursor-not-allowed">
              Global Leaderboard
            </div>
            <div className="text-gray-500 cursor-not-allowed">
              Monthly Rankings
            </div>
            <div className="text-gray-500 cursor-not-allowed">
              Tournament Leaderboards
            </div>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default Navbar;
