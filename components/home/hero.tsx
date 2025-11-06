"use client";

import { motion } from "framer-motion";
import RotatingText from "./RotatingText";

interface HeroProps {
  handleScrollClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Hero({ handleScrollClick }: HeroProps) {
  return (
    <div
      className="relative h-screen flex items-center justify-center text-center text-white water hero-with-overlay"
      style={{ backgroundImage: "url(/hero-textile.jpg)" }}
    >
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight"
        >
          AATCC AUST Student Chapter
        </motion.h1>

        {/* Animated Subtext */}
        <motion.div
          className=" mb-6 sm:mb-8 flex items-center justify-center text-white lg:text-xl sm:text-3xl"
          layout="position" // This animates the centering of the entire block
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            // Spring for the layout (centering) animation
            layout: { type: "spring", stiffness: 300, damping: 30 },
            // Transition for the initial fade-in
            default: { duration: 0.8, delay: 0.2 },
          }}
        >
          <motion.div
            className="inline-flex items-center overflow-hidden"
            layout="position" // This animates the total width of the "A Hub for [Text]" block
          >
            <motion.span
              layout="position" // This animates the position of the static text
        
            >
              A Hub for
            </motion.span>

            {/* This is the key: No 'layout' prop here.
              The component itself is handling its width animation,
              and the parent motion elements are reacting to it.
            */}
            <RotatingText
              texts={["Creativity!", "Teamwork", "Collaboration", "Growth","Innovation", "Textile-Tech", "Networking"]}
              mainClassName="inline-flex rounded-lg px-2 overflow-hidden"
              staggerFrom="first"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              // This prop is passed to RotatingText to use for its *internal*
              // width and character slide animations.
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}