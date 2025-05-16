import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

interface Notification {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  rank: number;
  prize: number;
  message: string;
}

export const useSocketNotifications = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Ensure we only connect if userId is available
    if (!userId) return;

    // Create socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://be1.rostrafi.fun",
      {
        withCredentials: true,
        // Add any additional connection options
        query: { userId },
      }
    );

    // Connect event
    newSocket.on("connect", () => {
      console.log("Socket connected");

      // Join user's personal room
      newSocket.emit("join", userId);
    });

    // Listen for prize disbursed events
    newSocket.on("prizeDisbursed", (notification: Notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error", error);
    });

    // Set socket state
    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Method to clear a specific notification
  const clearNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    notifications,
    clearNotification,
    socket,
  };
};
