"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";

interface WellnessWelcomeProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WellnessWelcome = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WellnessWelcomeProps) => {
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden bg-[#FAF5F5]">
      {/* Subtle ambient background - soft pink glow */}
      <motion.div
        className="absolute inset-0 opacity-[0.15]"
        animate={{
          background: [
            "radial-gradient(circle at 50% 40%, #E8C4C4 0%, transparent 60%)",
            "radial-gradient(circle at 50% 40%, #D4C4E8 0%, transparent 60%)",
            "radial-gradient(circle at 50% 40%, #E8C4C4 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-12 sm:py-16">
        {/* Top section with breathing animation */}
        <div className="flex flex-1 flex-col items-center justify-center space-y-10 sm:space-y-12">
          {/* Breathing circle - soft pink/purple gradient */}
          <motion.div
            className="relative"
            animate={{
              scale: breathPhase === "inhale" ? 1.15 : 0.95,
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
            }}
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: "linear-gradient(135deg, #E8C4C4 0%, #D4C4E8 50%, #B8D4C8 100%)",
              }}
              animate={{
                opacity: breathPhase === "inhale" ? 0.4 : 0.2,
                scale: breathPhase === "inhale" ? 1.3 : 1.1,
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full"
              style={{
                background: "linear-gradient(135deg, #E8C4C4 0%, #D4C4E8 50%, #F5E6E6 100%)",
                boxShadow: "0 20px 60px rgba(232, 196, 196, 0.4)",
              }}
              animate={{
                opacity: breathPhase === "inhale" ? 1 : 0.85,
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
              
              {/* Center heart icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathPhase === "inhale" ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="h-16 w-16 sm:h-20 sm:w-20 text-white fill-white/80" strokeWidth={1.5} />
                </motion.div>
              </div>

              {/* Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-6 w-6 text-[#D4C4E8]" fill="#D4C4E8" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Breathing instruction */}
          <motion.p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#A67C7C" }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {breathPhase === "inhale" ? "Breathe in" : "Breathe out"}
          </motion.p>

          {/* Title and subtitle */}
          <div className="space-y-4 text-center max-w-md px-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Your Pregnancy
              <br />
              <span className="bg-gradient-to-r from-[#E8C4C4] via-[#D4C4E8] to-[#B8D4C8] bg-clip-text text-transparent">
                Wellness Companion
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              A safe space to share, track, and nurture your journey
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center max-w-md px-4">
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <span className="text-sm text-gray-700">💬 Voice Support</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <span className="text-sm text-gray-700">🤰 Pregnancy Care</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <span className="text-sm text-gray-700">💜 Emotional Support</span>
            </div>
          </div>
        </div>

        {/* CTA Button - matching app style */}
        <motion.button
          onClick={onStartCall}
          className="group relative w-full max-w-sm overflow-hidden rounded-2xl px-8 py-5 text-base sm:text-lg font-semibold text-white shadow-xl transition-all hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #E8C4C4 0%, #D4C4E8 100%)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.15 }}
            transition={{ duration: 0.3 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Heart className="h-5 w-5" fill="white" />
            {startButtonText || "Begin Your Session"}
          </span>
        </motion.button>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center max-w-md px-4 mt-4">
          Your conversations are private and secure. We're here to support you.
        </p>
      </div>
    </div>
  );
};
