// "use client";
// import React from "react";
// import { ChevronDown } from "lucide-react";

// const AnimatedScrollButton = () => {
//   const scrollToContent = () => {
//     // Target the element right after AuroraBack
//     const targetElement = document.querySelector(".relative.mb-4");

//     if (targetElement) {
//       targetElement.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//   };

//   return (
//     <div className="w-full flex justify-center my-4 relative z-10 mb-14">
//       <button
//         onClick={scrollToContent}
//         className="
//           flex flex-col items-center justify-center
//           bg-white hover:bg-gray-100
//           px-6 py-3 rounded-full
//           text-black text-lg font-medium tracking-wide
//           border border-black/20
//           shadow-sm
//           transition-all duration-300 hover:scale-105
//           animate-bounce
//         "
//       >
//         <span>Tournament Awaits</span>
//         <ChevronDown
//           className="mt-1 animate-pulse"
//           size={20}
//           strokeWidth={1.5}
//           color="black"
//         />
//       </button>
//     </div>
//   );
// };

// export default AnimatedScrollButton;
