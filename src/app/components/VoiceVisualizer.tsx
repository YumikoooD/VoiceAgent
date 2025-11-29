"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { VoiceVisualizationData } from '../hooks/useVoiceVisualization';

interface VoiceVisualizerProps {
  visualizationData: VoiceVisualizationData;
  isActive: boolean;
}

export default function VoiceVisualizer({ 
  visualizationData, 
  isActive,
}: VoiceVisualizerProps) {
  const { volume } = visualizationData;
  
  // Normalize volume for smoother animation (0 to 1)
  const intensity = Math.min(1, volume * 2.5); // Sensitivity
  
  // Dynamic scale based on volume
  const scale = isActive ? 1 + intensity * 0.6 : 1;
  
  // Dynamic color shifting based on intensity
  // Idle: Cool Cyan/Blue
  // Active: Shifts towards Purple/Pink/White
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Core Sphere */}
      <motion.div
        animate={{
          scale: scale,
          filter: `blur(${isActive ? 20 + intensity * 10 : 20}px)`,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5
        }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-80 mix-blend-screen"
      >
        {/* Internal Texture/Movement */}
        <motion.div 
          animate={{
             rotate: 360,
             scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent blur-md"
        />
      </motion.div>

      {/* Outer Glow / Aura */}
      <motion.div
        animate={{
          scale: isActive ? 1.2 + intensity * 0.5 : 1.1,
          opacity: isActive ? 0.4 + intensity * 0.3 : 0.2,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30
        }}
        className="absolute w-32 h-32 rounded-full bg-cyan-500 blur-[60px]"
      />

      {/* Second Aura (Pink/Purple) for complexity when loud */}
      <motion.div
        animate={{
          scale: isActive ? 1.4 + intensity * 0.4 : 0.8,
          opacity: isActive ? 0.3 * intensity : 0,
        }}
        className="absolute w-32 h-32 rounded-full bg-purple-500 blur-[80px]"
      />
      
      {/* Central "Soul" Dot (Sesame-like minimal center) */}
      <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] z-20 opacity-90" />

    </div>
  );
}
