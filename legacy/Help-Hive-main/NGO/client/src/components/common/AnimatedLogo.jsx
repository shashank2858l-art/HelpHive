import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedLogo({ className = "w-10 h-10" }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center cursor-pointer ${className}`}
      whileHover="hover"
      initial="initial"
      animate="animate"
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={{
          hover: { scale: 1.08, filter: "drop-shadow(0px 0px 12px rgba(0, 0, 128, 0.4))" }
        }}
        transition={{ duration: 0.3 }}
      >
        <defs>
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9933"/>
            <stop offset="100%" stopColor="#FF6B00"/>
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#138808"/>
            <stop offset="100%" stopColor="#0B8043"/>
          </linearGradient>
        </defs>

        {/* Saffron Ribbon */}
        <motion.path
          d="M 15 50 A 35 35 0 0 1 85 50 A 35 20 0 0 0 15 50 Z"
          fill="url(#saffronGrad)"
        />

        {/* Green Ribbon */}
        <motion.path
          d="M 85 50 A 35 35 0 0 1 15 50 A 35 20 0 0 0 85 50 Z"
          fill="url(#greenGrad)"
        />

        {/* Ashoka Chakra */}
        <motion.g
          variants={{
            animate: { rotate: 360, transition: { duration: 25, repeat: Infinity, ease: "linear" } },
            hover: { rotate: 360, transition: { duration: 6, repeat: Infinity, ease: "linear" } }
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
      </motion.svg>
    </motion.div>
  );
}
