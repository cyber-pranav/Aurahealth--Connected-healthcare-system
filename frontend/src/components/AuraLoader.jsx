import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Synchronizing your care...",
  "Analyzing your health data...",
  "Running predictive diagnostics...",
  "Securing communication channels...",
  "Connecting to your doctor..."
];

export default function AuraLoader({ onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle messages every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f7f9fb] via-[#eceef0] to-[#d7e2ff] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Orbs */}
      <motion.div 
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#aeedd5]/20 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.05, 1], x: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-5%] left-[-10%] w-[600px] h-[600px] bg-[#0059ba]/10 rounded-full blur-[140px]"
        animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Glassmorphic Background Cards */}
      <motion.div 
        className="absolute top-1/4 left-20 w-48 h-64 rounded-xl rotate-12 opacity-30 border border-white/20"
        style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(40px)' }}
        animate={{ y: [0, 15, 0], rotate: [12, 14, 12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-20 w-56 h-40 rounded-xl -rotate-6 opacity-20 border border-white/20"
        style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(40px)' }}
        animate={{ y: [0, -10, 0], rotate: [-6, -4, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative flex flex-col items-center justify-center w-full max-w-lg px-8 py-24 text-center z-10">
        
        {/* Branding header */}
        <motion.header 
          className="mb-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-sans text-3xl font-extrabold tracking-tighter text-[#0059ba]">
            AuraHealth Sync
          </h1>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <span className="h-[1px] w-8 bg-[#424753]/20"></span>
            <p className="font-sans text-xs uppercase tracking-widest text-[#424753]/60">
              The Intelligent Ethereal
            </p>
            <span className="h-[1px] w-8 bg-[#424753]/20"></span>
          </div>
        </motion.header>

        {/* Central Aura Animation */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          
          {/* Outer Ripple 1 */}
          <motion.div 
            className="absolute w-32 h-32 rounded-full border border-[#0059ba]/30"
            animate={{ scale: [1, 3], opacity: [0.8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
          />
          {/* Outer Ripple 2 */}
          <motion.div 
            className="absolute w-32 h-32 rounded-full border border-[#2c6956]/20"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 4, delay: 1.5, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Central Glass Core Layer */}
          <div 
            className="w-48 h-48 rounded-full flex items-center justify-center border border-white/60 relative z-10 shadow-[0_20px_40px_rgba(0,89,186,0.06)]"
            style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(40px)' }}
          >
            {/* Glowing Core Pulse */}
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#0059ba] flex items-center justify-center"
              animate={{ 
                scale: [0.95, 1.1, 0.95], 
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 0 0 rgba(79, 142, 247, 0)",
                  "0 0 50px 20px rgba(79, 142, 247, 0.3)",
                  "0 0 0 0 rgba(79, 142, 247, 0)"
                ]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
          </div>

          {/* Drifting Sparkles */}
          <motion.div 
            className="absolute top-4 right-8 w-2 h-2 bg-[#2c6956] rounded-full blur-[1px]"
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 left-4 w-1.5 h-1.5 bg-[#2c72d9] rounded-full blur-[1px]"
            animate={{ y: [0, 8, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Dynamic Loading Text & Progress */}
        <section className="w-full max-w-xs space-y-8">
          <div className="space-y-4 h-12 flex flex-col justify-end">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="font-sans text-lg font-semibold text-[#191c1e] tracking-tight"
              >
                {messages[messageIndex]}
              </motion.p>
            </AnimatePresence>
            
            {/* Minimal Progress Line */}
            <div className="relative w-full h-1 bg-[#e6e8ea] rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r from-transparent via-[#0059ba] to-transparent"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Health Context Chips */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#c2c6d5]/20 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2c6956]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-medium text-[#424753]">Vitals Check</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#c2c6d5]/20 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0059ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-[#424753]">AI Insights</span>
            </div>
          </motion.div>
        </section>

        {/* Footer Guarantee */}
        <motion.footer 
          className="mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="font-sans text-xs text-[#424753]/50 max-w-xs mx-auto italic">
            Your data is encrypted with clinical-grade intelligence and ethereal care.
          </p>
        </motion.footer>

      </main>
    </motion.div>
  );
}
