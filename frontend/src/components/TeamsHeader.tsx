"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
// import SearchComponent from "./SearchComponent";

export function TeamsHeader() {
  const words = [
    {
      text: "Select,",
    },
    {
      text: "build,",
    },
    {
      text: "win",
    },
    {
      text: "with",
    },
    {
      text: "RostraFi.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[25rem]">
      <TypewriterEffectSmooth words={words} />
      {/* <SearchComponent /> */}
    </div>
  );
}
