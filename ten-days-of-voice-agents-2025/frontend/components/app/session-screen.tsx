"use client";

import { motion, AnimatePresence } from "motion/react";
import { Mic, Heart } from "lucide-react";

interface SessionScreenProps {
  isAgentSpeaking?: boolean;
  isListening?: boolean;
  conversationText?: string;
  children?: React.ReactNode;
}

export default function SessionScreen({
  isAgentSpeaking = false,
  isListening = false,
  conversationText = "Listening...",
  children,
}: SessionScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF5F5]">
      {/* Subtle ambient background - soft pink glow */}
      <motion.div
        className="absolute inset-0 opacity-[0.12]"
        animate={{
          background: [
            "radial-gradient(circle at 50% 30%, #E8C4C4 0%, transparent 50%)",
            "radial-gradient(circle at 50% 30%, #D4C4E8 0%, transparent 50%)",
            "radial-gradient(circle at 50% 30%, #E8C4C4 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 sm:px-6 py-4 sm:py-6">
        {/* Top animated orb - soft pink/coral theme */}
        <div className="relative z-20 mb-4 sm:mb-6 mt-9">
          <motion.div
            className="relative"
            animate={{
              scale: isAgentSpeaking ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 1.2,
              repeat: isAgentSpeaking ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {/* Glow effect - soft pink */}
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: "linear-gradient(135deg, #E8C4C4 0%, #F5E6E6 100%)",
              }}
              animate={{
                opacity: isAgentSpeaking ? [0.4, 0.7, 0.4] : 0.3,
                scale: isAgentSpeaking ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isAgentSpeaking ? Infinity : 0,
                ease: "easeInOut",
              }}
            />

            {/* Main orb - pink gradient */}
            <motion.div
              className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-full shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #E8C4C4 0%, #D4A5A5 50%, #F5E6E6 100%)",
              }}
              animate={{
                borderRadius: isAgentSpeaking
                  ? [
                      "50% 50% 50% 50%",
                      "45% 55% 50% 50%",
                      "50% 50% 45% 55%",
                      "55% 45% 50% 50%",
                      "50% 50% 50% 50%",
                    ]
                  : "50% 50% 50% 50%",
              }}
              transition={{
                duration: 2,
                repeat: isAgentSpeaking ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute inset-0 bg-white opacity-30"
                animate={{
                  scale: isAgentSpeaking ? [1, 1.5, 1] : 1,
                  opacity: isAgentSpeaking ? [0.3, 0.5, 0.3] : 0.3,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isAgentSpeaking ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Icon - mic when listening, heart when speaking */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mic className="h-12 w-12 sm:h-14 sm:w-14 text-white" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="heart"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className="h-12 w-12 sm:h-14 sm:w-14 text-white fill-white/80" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pulse rings when speaking */}
              {isAgentSpeaking && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/40"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/40"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.5,
                    }}
                  />
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Status text below orb */}
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationText}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-4 text-center"
          >
            <div className="inline-block px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                {conversationText}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Children content */}
        {children && (
          <div className="w-full max-w-2xl mt-8">{children}</div>
        )}
      </div>
    </div>
  );
}
