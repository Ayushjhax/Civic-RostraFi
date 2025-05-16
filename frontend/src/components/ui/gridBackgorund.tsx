"use client";
import React from "react";
import { TabsDemo } from "../TabsSection";

export function GridBackgroundDemo() {
  return (
    <div className="h-[45rem] w-full bg-slate-950 relative flex flex-row">
      {/* Left square box background */}
      <div className="w-1/4 h-full bg-slate-950 bg-grid-white/[0.1]">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)]"></div>
      </div>
      
      {/* Center content */}
      <div className="w-2/4 h-full bg-slate-950 bg-grid-white/[0.1] flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)]"></div>
        <div className="relative z-20 w-full">
          <TabsDemo />
        </div>
      </div>
      
      {/* Right square box background */}
      <div className="w-1/4 h-full bg-slate-950 bg-grid-white/[0.1]">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)]"></div>
      </div>
    </div>
  );
}

export default GridBackgroundDemo;