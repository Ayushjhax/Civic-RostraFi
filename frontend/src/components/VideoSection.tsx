"use client";
import React from "react";

export const VideoSection = () => {
  return (
    <>
      <div className="bg-slate-950 min-h-screen flex items-center justify-center p-8 pb-32">
        {/* Video Container with White Glow */}
        <div className="relative w-full max-w-5xl">
          {/* White glow effect - increased opacity and reduced blur */}
          <div className="absolute inset-0 bg-white blur-lg opacity-70 rounded-[2.5rem]"></div>

          {/* Additional subtle glow layer */}
          <div className="absolute inset-0 bg-white blur-2xl opacity-40 rounded-[2.5rem]"></div>

          {/* Video container */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden">
            <div className="rounded-[2.5rem]">
              {/* Video - removed muted attribute to enable sound */}
              <video
                autoPlay
                loop
                className="w-full h-full object-cover rounded-[2.5rem]"
                controls
              >
                <source src="https://res.cloudinary.com/djohjwkn6/video/upload/v1747426168/mmmm_dsdbdw.mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};