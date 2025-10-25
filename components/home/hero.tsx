"use client";

import { motion } from "framer-motion";

// The Hero component now receives the scroll handler as a prop
interface HeroProps {
  handleScrollClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Hero({ handleScrollClick }: HeroProps) {
  return (
    <div
  className="relative h-screen flex items-center justify-center text-center text-white water hero-with-overlay"
  style={{ backgroundImage: "url(/hero-textile.jpg)" }}
  id="hero-section"
>
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight"
        >
          AATCC AUST Student Chapter
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
        >
          A hub for creativity, teamwork, and innovation.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="#about"
            onClick={(e) => handleScrollClick(e, 'about')}
            className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            Learn More
          </a>
        </motion.div>
      </div>
    </div>
  );
}