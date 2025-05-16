import React from "react";
import { SparklesCore } from "./ui/sparkles";

type SparklesPreviewProps = {
  teamSectionName: string;
  teamsSectionId: string;
};

export function TeamSection({ teamSectionName }: SparklesPreviewProps) {
  return (
    <div className="h-28 w-full flex flex-col items-start overflow-hidden rounded-md bg-black relative">
      {/* Text with underline gradients and sparkles background */}
      <div className="relative inline-block ml-4 mt-8 ">
        {/* Sparkles contained to text area */}
        <div className="absolute -inset-4">
          <SparklesCore
            background="transparent"
            minSize={1}
            maxSize={1.5}
            particleDensity={500}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
          {/* Radial Gradient adjusted to text area */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(closest-side_at_center,transparent_20%,white)]"></div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white relative z-10">
          {teamSectionName}
        </h1>
        {/* Gradient lines container */}
        <div className="absolute -bottom-2 left-0 w-full h-4 z-10">
          <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-full blur-sm" />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-full" />
          <div className="absolute inset-x-0 top-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[4px] w-2/3 blur-sm mx-auto" />
          <div className="absolute inset-x-0 top-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default TeamSection;
