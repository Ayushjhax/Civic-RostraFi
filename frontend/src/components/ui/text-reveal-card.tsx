"use client";
import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";

const Stars = () => {
  const randomMove = () => Math.random() * 4 - 2;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();

  return (
    <div className="absolute inset-0">
      {[...Array(80)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: "2px",
            height: "2px",
            backgroundColor: "white",
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block"
        />
      ))}
    </div>
  );
};

const MemoizedStars = memo(Stars);

export const TextRevealEffect = ({ text }: { text: string }) => {
  const [widthPercentage, setWidthPercentage] = useState(0);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [left, setLeft] = useState(0);
  const [localWidth, setLocalWidth] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const { left, width } = textRef.current.getBoundingClientRect();
      setLeft(left);
      setLocalWidth(width);
    }
  }, []);

  const mouseMoveHandler = (event: React.MouseEvent) => {
    const { clientX } = event;
    if (textRef.current) {
      const relativeX = clientX - left;
      setWidthPercentage((relativeX / localWidth) * 100);
    }
  };

  return (
    <div
      ref={textRef}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => {
        setIsMouseOver(false);
        setWidthPercentage(0);
      }}
      onMouseMove={mouseMoveHandler}
      className="relative inline-block cursor-pointer overflow-hidden"
    >
      <motion.div
        animate={
          isMouseOver
            ? {
                opacity: widthPercentage > 0 ? 1 : 0,
                clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
              }
            : {
                clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
              }
        }
        transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
        className="absolute inset-0 z-20 bg-gradient-to-br from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
      >
        {text}
      </motion.div>
      <div className="relative">
        <div className="bg-gradient-to-br from-slate-300/30 to-slate-500/30 bg-clip-text text-transparent">
          {text}
        </div>
        <MemoizedStars />
      </div>
    </div>
  );
};
