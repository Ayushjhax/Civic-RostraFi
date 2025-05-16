// "use client";
// import React from "react";
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalTrigger,
// } from "./ui/animated-modal";
// import PlatformCard from "./Cards";
// import { useAppSelector } from "@/hooks/reduxHooks";

// export function TournamentModal() {
//   const { tournaments, loading, openRegistrationTournaments } = useAppSelector(
//     (state) => state.tournaments
//   );
//   console.log(openRegistrationTournaments);

//   return (
//     <div>
//       <Modal>
//         <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group/modal-btn rounded-full w-32 h-14 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
//           <span className="absolute group-hover/modal-btn:translate-x-32 text-center transition-transform duration-500">
//             Tournaments
//           </span>
//           <div className="-translate-x-32 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition-transform duration-500 text-2xl">
//             🏆
//           </div>
//         </ModalTrigger>
//         <ModalBody className="p-0 ">
//           <ModalContent className="w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black overflow-auto">
//             <div className="w-full h-full flex flex-col">
//               {/* Fixed Header */}
//               <div className="text-center p-8 pb-4 border-b border-gray-800 flex-shrink-0">
//                 <h2 className="text-3xl font-bold text-white mb-2">
//                   Active Tournaments
//                 </h2>
//                 <p className="text-gray-400">
//                   Join or create a team to participate in our ongoing
//                   tournaments
//                 </p>
//               </div>

//               {/* Scrollable Content */}
//               <div className="flex-1 overflow-y-auto scrollbar-thumb-gray-600 scrollbar-track-gray-900">
//                 <div className="px-4 pt-4 pb-8">
//                   <div className="flex flex-wrap justify-center gap-6 items-start">
//                     {loading ? (
//                       <div className="text-white">Loading tournaments...</div>
//                     ) : tournaments.length > 0 ? (
//                       openRegistrationTournaments.map((tournament) => {
//                         return (
//                           <div
//                             key={tournament._id}
//                             className="transform hover:-translate-y-2 transition-transform duration-300"
//                           >
//                             <PlatformCard
//                               platform={tournament.platform}
//                               image={tournament.image}
//                               icon={tournament.icon}
//                               tournamentData={tournament}
//                             />
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="text-white">
//                         No active tournaments found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Fixed Footer */}
//               <div className="p-8 pt-4 border-t border-gray-800 text-center flex-shrink-0">
//                 <p className="text-gray-400 text-sm">
//                   New tournaments are added weekly. Stay tuned for more
//                   opportunities!
//                 </p>
//               </div>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// }

// export default TournamentModal;

"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import PlatformCard from "./Cards";
import { useAppSelector } from "@/hooks/reduxHooks";

export function TournamentModal() {
  const { tournaments, loading, openRegistrationTournaments } = useAppSelector(
    (state) => state.tournaments
  );
  console.log(openRegistrationTournaments);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-animate occasionally to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-0 transition-opacity duration-500 ${
            isAnimating ? "opacity-30" : ""
          } group-hover:opacity-30 z-10 pointer-events-none`}
        ></div>

        <div
          className={`absolute w-full h-16 bg-white/10 -skew-y-12 -top-20 blur-xl ${
            isAnimating ? "animate-lightSweep" : ""
          } group-hover:animate-lightSweep pointer-events-none`}
        ></div>

        <img
          src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913"
          alt="Tournament"
          className="w-full h-auto object-cover transition-all duration-500"
        />
      </div>

      <Modal>
        <div
          onMouseEnter={() => setIsAnimating(true)}
          onMouseLeave={() => setIsAnimating(false)}
        >
          <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group rounded-full w-48 h-16 shadow-xl relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-blue-500/20 blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                isAnimating ? "opacity-100" : ""
              }`}
            ></div>

            <div
              className={`absolute w-16 h-full bg-white/20 -skew-x-12 -left-32 group-hover:left-64 transition-all duration-700 ${
                isAnimating ? "left-64" : "-left-32"
              }`}
            ></div>

            <div className="flex items-center justify-center gap-2 z-10">
              <span className="font-bold text-xl transition-all duration-300 group-hover:text-white">
                Tournaments
              </span>

              <div
                className={`text-3xl ml-1 transition-all duration-500 ${
                  isAnimating ? "scale-125 animate-pulse" : ""
                } group-hover:scale-125 group-hover:animate-pulse`}
              >
                🏆
              </div>
            </div>

            <div
              className={`absolute inset-0 rounded-full border-2 border-blue-400/0 group-hover:border-blue-400/70 transition-all duration-500 ${
                isAnimating ? "border-blue-400/70 scale-105" : ""
              } group-hover:scale-105`}
            ></div>

            <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.7 + 0.3,
                    animation: `float ${
                      Math.random() * 2 + 2
                    }s ease-in-out infinite`,
                  }}
                ></div>
              ))}
            </div>
          </ModalTrigger>
        </div>
        <ModalBody className="p-0 ">
          <ModalContent className="w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black overflow-auto">
            <div className="w-full h-full flex flex-col">
              <div className="text-center p-8 pb-4 border-b border-gray-800 flex-shrink-0">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Active Tournaments
                </h2>
                <p className="text-gray-400">
                  Join or create a team to participate in our ongoing
                  tournaments
                </p>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                <div className="px-4 pt-4 pb-8">
                  <div className="flex flex-wrap justify-center gap-6 items-start">
                    {loading ? (
                      <div className="text-white">Loading tournaments...</div>
                    ) : openRegistrationTournaments.length > 0 ? (
                      openRegistrationTournaments.map((tournament) => {
                        return (
                          <div
                            key={tournament._id}
                            className="transform hover:-translate-y-2 transition-transform duration-300"
                          >
                            <PlatformCard
                              platform={tournament.platform}
                              image={tournament.image}
                              icon={tournament.icon}
                              tournamentData={tournament}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-white">
                        No active tournaments found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-gray-800 text-center flex-shrink-0">
                <p className="text-gray-400 text-sm">
                  New tournaments are added weekly. Stay tuned for more
                  opportunities!
                </p>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default TournamentModal;
