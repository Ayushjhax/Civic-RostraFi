"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import Image from "next/image";
import { motion } from "framer-motion";
import { Team } from "@/types/team.types";

interface TeamDetailsModalProps {
  team: Team | null;
  isSelected: boolean;
  isPending: boolean;
  canAfford: boolean;
  children: React.ReactNode; // This will be the trigger element
  onSelect: () => void;
}

export function TeamDetailsModal({
  team,
  isSelected,
  isPending,
  canAfford,
  children,
  onSelect,
}: TeamDetailsModalProps) {
  if (!team) return null;

  // Create the content for the sticky scroll
  const content = [
    {
      title: team.name,
      description: team.description,
      content: (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="text-purple-400 font-medium">
              Cost: {team.points || 250} points
            </div>
            <button
              onClick={onSelect}
              disabled={!canAfford && !isSelected}
              className={`px-6 py-3 rounded-full font-bold text-white
                ${
                  isSelected
                    ? "bg-red-500 hover:bg-red-600"
                    : isPending
                    ? "bg-yellow-500"
                    : canAfford
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-700 opacity-50 cursor-not-allowed"
                } relative`}
            >
              {isSelected
                ? "Remove from Team"
                : isPending
                ? "Adding to Team..."
                : "Add to Team"}

              {isPending && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-yellow-500 opacity-20"
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
      ),
    },
  ];

  return (
    <Modal>
      <ModalTrigger>{children}</ModalTrigger>
      <ModalBody className="p-0 md:max-w-[50%] z-50">
        <ModalContent className="w-[80vw] h-[80vh] max-w-2xl max-h-[80vh] p-0">
          <div className="w-full h-full overflow-hidden flex flex-col">
            {/* Upper section: Large image */}
            <div className="w-full h-1/2">
              <Image
                src={team.image || "/api/placeholder/400/320"}
                width={600}
                height={300}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Lower section: Sticky scroll with content */}
            <div className="w-full h-1/2">
              <StickyScroll
                content={content}
                contentClassName="w-full px-6 py-8"
              />
            </div>
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
