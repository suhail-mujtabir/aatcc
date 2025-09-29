// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "about", label: "About", page: "/about" },
  {
    id: "activities",
    label: "Activities",
    page: "/overview",
    children: [
      { id: "events", label: "Events", page: "/overview#events" },
      { id: "workshops", label: "Workshops", page: "/overview#workshops" },
      { id: "industrial-visit", label: "Industrial Visit", page: "/overview#industrial-visit" },
    ],
  },
  { id: "hof", label: "Hall of Fame", page: "/hof" },
  { id: "news", label: "News", page: "/news" },
  { id: "contact", label: "Contact", page: "/contact" },
];

// Smooth scroll helpers
const SCROLL_DURATION = 1000;
const NAVBAR_OFFSET = 80;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY: number, duration = SCROLL_DURATION) {
  const startY = window.scrollY || window.pageYOffset;
  const diff = targetY - startY;
  let startTime: number | null = null;

  return new Promise<void>((resolve) => {
    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (!isHome) return; // if not on home, let normal link work

    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();

    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - NAVBAR_OFFSET;
      await smoothScrollTo(targetY, SCROLL_DURATION);
      history.replaceState(null, "", `#${id}`);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/85 backdrop-blur-md" : "bg-transperent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-white">
        <a
          href="/"
          className="text-2xl font-bold hover:text-green-400 transition-colors duration-500"
        >
          Student Org
        </a>

        <ul className="flex items-center space-x-8">
          {NAV_ITEMS.map((it) => (
            <li key={it.id} className="relative">
              <div className="group inline-block">
                <a
                  href={isHome ? `#${it.id}` : it.page}
                  onClick={(e) => handleClick(e, it.id)}
                  className="px-1 py-1 text-white font-medium"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-green-400">
                    {it.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
                    style={{ transformOrigin: "center" }}
                  />
                </a>

                {/* Dropdown only for Overview */}
                {it.children && (
                  <ul className="absolute left-0 mt-2 w-48 bg-black/90 rounded-lg shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top">
                    {it.children.map((child) => (
                      <li key={child.id}>
                        <a
                          href={child.page}
                          className="block px-4 py-2 text-white hover:bg-green-600 rounded-lg"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
