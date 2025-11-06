// components/ThemeToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Import the local primitive
import {
  ThemeToggler as ThemeTogglerPrimitive,
  type ThemeTogglerProps as ThemeTogglerPrimitiveProps,
  type ThemeSelection,
  type Resolved,
} from "@/components/animate-ui/primitives/effects/theme-toggler";

/** Helper: compute next theme in ['light', 'dark'] cycle */
const getNext = (current: ThemeSelection, modes: ThemeSelection[] = ["light", "dark"]) => {
  const i = modes.indexOf(current);
  if (i === -1) return modes[0];
  return modes[(i + 1) % modes.length];
};

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animatingTheme, setAnimatingTheme] = useState<ThemeSelection | null>(null);

  useEffect(() => setMounted(true), []);

  const theme: ThemeSelection = isDark ? "dark" : "light";
  const resolvedTheme: Resolved = theme as Resolved;

  /** Adapter for the primitive to call your toggleTheme at midpoint */
  const setThemeAdapter = (next: ThemeSelection) => {
    const nextIsDark = next === "dark";
    if (nextIsDark !== isDark) {
      toggleTheme();
    }
  };

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-transparent text-white w-9 h-9" aria-hidden>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <ThemeTogglerPrimitive
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setThemeAdapter}
      direction="ltr"
    >
      {({ effective, resolved, toggleTheme: primitiveToggle }) => (
        <button
          onClick={() => {
            const next = getNext(effective, ["light", "dark"]);
            setAnimatingTheme(next); // start icon fade
            Promise.resolve(primitiveToggle(next)).finally(() => setAnimatingTheme(null)); // reset after animation
          }}
          className="p-2 rounded-lg bg-transparent text-white cursor-pointer hover:text-green-400 transition-colors duration-200 hover:border-white/50 relative w-9 h-9 flex items-center justify-center"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
        >
          <div className="relative z-10 flex items-center justify-center w-5 h-5">
            {/* Moon Icon */}
            <div
              className={`absolute transition-opacity duration-700 ${
                animatingTheme === "dark" || (!animatingTheme && isDark) ? "opacity-100" : "opacity-0"
              }`}
            >
              <Moon className="w-5 h-5" />
            </div>
            {/* Sun Icon */}
            <div
              className={`absolute transition-opacity duration-700 ${
                animatingTheme === "light" || (!animatingTheme && !isDark) ? "opacity-100" : "opacity-0"
              }`}
            >
              <Sun className="w-5 h-5" />
            </div>
          </div>
        </button>
      )}
    </ThemeTogglerPrimitive>
  );
}
