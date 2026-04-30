'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInterfaceProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  statusText: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  isListening,
  isSpeaking,
  onToggleListen,
  statusText
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 p-10 md:p-16">
      <div className="relative group">
        {/* Decorative background glow */}
        <div className={`absolute inset-0 blur-3xl transition-all duration-1000 opacity-20 ${isListening ? 'bg-amber-500' : 'bg-amber-200'}`} />

        {/* Pulsing rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0.1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-amber-500 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.4, opacity: 0.05 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 bg-amber-400 rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Mic Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleListen}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
            isListening 
              ? 'bg-amber-500 text-white shadow-amber-500/40 ring-8 ring-amber-500/10' 
              : 'bg-white text-amber-500 shadow-gray-200 hover:shadow-amber-100'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 to-white/20 pointer-events-none" />
          {isListening ? (
             <motion.div
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               <Mic className="w-10 h-10" />
             </motion.div>
          ) : (
            <MicOff className="w-10 h-10 opacity-40" />
          )}
        </motion.button>
      </div>

      <div className="text-center space-y-3 z-10">
        <AnimatePresence mode="wait">
          <motion.h3 
            key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'ready'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-3xl md:text-4xl font-serif italic text-gray-800"
          >
            {isListening ? "I'm listening..." : isSpeaking ? "One moment..." : "Talk to me"}
          </motion.h3>
        </AnimatePresence>
        <motion.p 
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase"
        >
          {statusText}
        </motion.p>
      </div>

      {/* Visualizer bars with varied heights */}
      <div className="flex items-end space-x-1.5 h-12">
        {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3].map((height, i) => (
          <motion.div
            key={i}
            animate={isListening || isSpeaking ? {
              height: [8, 48 * height, 12, 48 * height * 0.5, 16, 8],
              opacity: [0.3, 1, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }
            } : { height: 6, opacity: 0.1 }}
            className={`w-2 rounded-full transition-colors duration-500 ${isListening || isSpeaking ? 'bg-amber-400' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};
