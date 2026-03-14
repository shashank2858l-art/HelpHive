import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Preloader() {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'launching' | 'done'

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Transition out after 2.5 seconds (gives time for the drawing animation, holding, then exiting)
    const launchTimer = setTimeout(() => {
      setPhase('launching');
    }, 2800);

    // Unmount
    const doneTimer = setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
    }, 3600);

    return () => {
      clearTimeout(launchTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0A1015] via-[#101820] to-[#0A1015]"
      initial={{ opacity: 1 }}
      animate={phase === 'launching' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center justify-center relative">
        {/* Animated Custom Logo SVG */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.1))" }}
          >
            <defs>
              <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#138808" />
                <stop offset="100%" stopColor="#0B8043" />
              </linearGradient>
            </defs>

            {/* Step 1: Saffron Ribbon (Draws Left to Right) */}
            <motion.path
              d="M 15 50 A 35 35 0 0 1 85 50 A 35 20 0 0 0 15 50 Z"
              fill="url(#saffronGrad)"
              initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Step 2: Green Ribbon (Draws Right to Left) */}
            <motion.path
              d="M 85 50 A 35 35 0 0 1 15 50 A 35 20 0 0 0 85 50 Z"
              fill="url(#greenGrad)"
              initial={{ clipPath: "inset(0% 0% 0% 100%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
            />

            {/* Step 3: Ashoka Chakra (Reveals completely perfectly framed in the center) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{
                opacity: { duration: 0.5, delay: 1.2 },
                rotate: { duration: 25, repeat: Infinity, ease: "linear" } // Slow rotation starts immediately once revealed
              }}
              style={{ originX: "50px", originY: "50px" }}
            >
              <circle cx="50" cy="50" r="14" stroke="#000080" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="11" stroke="#000080" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="2" fill="#000080" />
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 11 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={50 + 11 * Math.sin((i * 15 * Math.PI) / 180)}
                  stroke="#000080"
                  strokeWidth="0.8"
                />
              ))}
            </motion.g>
          </svg>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
        >
          <h2 className="font-outfit text-sm md:text-base tracking-[0.3em] text-white/80 uppercase font-medium text-center">
            Launching HelpHive...
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}
