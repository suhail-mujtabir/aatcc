// components/SnowToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { Snowflake, CloudSnow } from "lucide-react";
import { useSnow } from "@/components/SnowEffect";

export default function SnowToggle() {
  const { showSnow, setShowSnow } = useSnow();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-transparent text-white w-9 h-9" aria-hidden>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowSnow(!showSnow)}
      className="p-2 rounded-lg bg-transparent text-white cursor-pointer hover:text-green-400 transition-colors duration-200 hover:border-white/50 relative w-9 h-9 flex items-center justify-center"
      aria-label={showSnow ? "Disable snow effect" : "Enable snow effect"}
      aria-pressed={showSnow}
    >
      <div className="relative z-10 flex items-center justify-center w-5 h-5">
        {/* Snowflake Icon (Snow On) */}
        <div
          className={`absolute transition-opacity duration-300 ${
            showSnow ? "opacity-100" : "opacity-0"
          }`}
        >
          <Snowflake className="w-5 h-5" />
        </div>
        {/* CloudSnow Icon (Snow Off) */}
        <div
          className={`absolute transition-opacity duration-300 ${
            !showSnow ? "opacity-100" : "opacity-0"
          }`}
        >
          <CloudSnow className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}
