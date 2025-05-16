"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Spotlight } from "./ui/Spotlight";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import { useRouter } from "next/navigation";
import { MultiStepLoader } from "./ui/multi-step-loader";
import { useMotionValue, useMotionTemplate, motion } from "motion/react";
import { ColourfulText } from "./ui/colourful-text";

// Combined EvervaultCard and login functionality
export const LoginCard = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    let str = generateRandomString(1500);
    setRandomString(str);
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    const str = generateRandomString(1500);
    setRandomString(str);
  }

  return (
    <div className="p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative">
      <div
        onMouseMove={onMouseMove}
        className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex flex-col items-center justify-center h-full"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8">
          <div className="space-y-4 text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/60 text-sm">
              Form teams of influencers from X, TikTok, and Instagram to compete
              for virality on the Solana blockchain.
            </p>
          </div>

          <button
            onClick={onClick}
            disabled={loading}
            className="relative h-12 w-48 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-700 text-white font-bold hover:opacity-90 transition duration-300"
          >
            {loading ? "Connecting..." : "Sign in with Civic"}
          </button>

          {loading && (
            <div className="mt-4 flex gap-2 items-center justify-center text-[12px] text-center text-white/60">
              <svg
                className="text-white/60 animate-spin"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
              >
                <path
                  d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={5}
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={5}
                  strokeLinejoin="round"
                  className="text-white"
                ></path>
              </svg>
              Please wait while we sign you in...
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              Powered by Solana • Secure blockchain • Transparent rewards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function CardPattern({ mouseX, mouseY, randomString }: any) {
  let maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={style}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

export function SpotlightLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useUser();

  const loadingStates = [
    {
      text: "Logging in securely...",
    },
    {
      text: "Connecting to Civic's secure wallet",
    },
    {
      text: "Verifying your credentials",
    },
    {
      text: "Blockchain authentication in progress",
    },
    {
      text: "Civic provides embedded wallet for seamless experience",
    },
    {
      text: "Ensuring secure Solana transactions",
    },
    {
      text: "Getting your profile ready",
    },
    {
      text: "Welcome to RostraFi!",
    },
  ];

  const connectWallet = async () => {
    if (loading) return;

    try {
      await user.signIn();
      console.log("User signed in successfully");
      // Don't set loading here - it will be set in the useEffect after authentication is complete
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  // Handle navigation when loader completes
  const handleLoaderComplete = () => {
    router.push("/");
  };

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (user.authStatus === "authenticated") {
        console.log("User authenticated:", user.user);

        if (!userHasWallet(user)) {
          try {
            console.log("Creating wallet...");
            await user.createWallet();
            console.log("Wallet created successfully");

            // Only set loading to true AFTER wallet is created
            setLoading(true);
          } catch (error) {
            console.error("Error creating wallet:", error);
            setLoading(false);
            return;
          }
        } else {
          // User already has wallet, show loading animation
          console.log("User already has wallet");
          setLoading(true);
        }
      }
    };

    handleUserAuthentication();
  }, [user, router]);

  console.log(user);
  console.log("Loading state:", loading);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black/[0.96] antialiased">
      {/* Show the full-page loader when loading animation should be displayed */}
      {loading && user.authStatus === "authenticated" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={true}
            duration={1000}
            loop={false}
            onComplete={handleLoaderComplete}
          />
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 flex flex-col items-center justify-center h-full">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl mb-12">
          <ColourfulText text="RostraFi" /> <br />
          <span className="text-3xl md:text-5xl mt-2 block">
            The Future of Social Influence
          </span>
        </h1>

        <div className="border border-white/20 bg-black/50 flex flex-col items-center max-w-md mx-auto p-4 relative h-[20rem] rounded-xl  w-full">
          <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
          <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
          <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
          <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

          <LoginCard onClick={connectWallet} loading={loading} />
        </div>
      </div>
    </div>
  );
}
