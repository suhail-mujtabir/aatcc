"use client";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

// --- Smooth scroll helper functions (unchanged) ---
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

async function smoothScrollTo(targetY: number, duration = 1000) {
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
// --- End of smooth scroll helpers ---

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // --- Determine current page for styling ---
  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";

  // Effect to handle scroll behavior on the homepage
  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [isHome]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!isHome) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 80;
      await smoothScrollTo(targetY);
      history.replaceState(null, "", `#${id}`);
    } else {
      window.location.href = `/#${id}`;
    }
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // --- Hide Navbar on the login page ---
  if (isLoginPage) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${
        isDashboard ? 'sticky' : 'fixed'
      } top-0 left-0 w-full z-50 transition-colors duration-500 ${
        !isHome || scrolled ? "bg-black/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-white">
        {/* LOGO + TITLE */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
          <Image
            src="/logo.png"
            alt="AATCC Logo"
            width={40}
            height={40}
            className="rounded-md transition-transform duration-300 group-hover:scale-105 w-8 h-8 sm:w-10 sm:h-10"
          />
          <span className="hidden sm:inline text-lg font-bold tracking-wide hover:text-green-400 transition-colors duration-500 whitespace-nowrap">
            AATCC AUST Student Chapter
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {NAV_ITEMS.map((it) => (
            <li key={it.id} className="relative">
              <div className="group inline-block">
                <a
                  href={isHome ? `#${it.id}` : it.page}
                  onClick={(e) => handleClick(e, it.id)}
                  className="px-1 py-1 text-white font-medium block"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-green-400 text-sm xl:text-base">
                    {it.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
                    style={{ transformOrigin: "center" }}
                  />
                </a>

                {/* Dropdown for Activities */}
                {it.children && (
                  <ul className="absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top border border-gray-700">
                    {it.children.map((child) => (
                      <li key={child.id}>
                        <a
                          href={child.page}
                          className="block px-4 py-3 text-white hover:bg-green-600 transition-colors duration-200 text-sm"
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
          <li><ThemeToggle /></li>
        </ul>

        {/* AUTH BUTTONS - Desktop */}
        <div className="hidden lg:block pl-4 flex-shrink-0">
          {loading ? (
            <div className="h-9 w-24 bg-gray-700/50 rounded-lg"></div>
          ) : user ? (
            <Link
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 mt-16"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 z-50"
            >
              <div className="px-4 py-6 space-y-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.id} className="border-b border-gray-800/50 last:border-b-0">
                    {item.children ? (
                      <div className="pb-2">
                        <button
                          onClick={() => toggleDropdown(item.id)}
                          className="flex items-center justify-between w-full text-left py-3 text-white font-medium text-lg"
                        >
                          {item.label}
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === item.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.id && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 space-y-2 overflow-hidden"
                            >
                              {item.children.map((child) => (
                                <li key={child.id}>
                                  <a
                                    href={child.page}
                                    className="block py-2 text-gray-300 hover:text-green-400 transition-colors duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a
                        href={isHome ? `#${item.id}` : item.page}
                        onClick={(e) => {
                          if (isHome) handleClick(e, item.id);
                          setMobileMenuOpen(false);
                        }}
                        className="block py-3 text-white font-medium text-lg hover:text-green-400 transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-800/50">
                <div className="flex justify-center mb-4">
    <ThemeToggle />
  </div>
                  {loading ? (
                    <div className="h-12 bg-gray-700/50 rounded-lg "></div>
                  ) : user ? (
                    <Link
                      href="/dashboard"
                      className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-center py-3 rounded-lg transition-colors duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center py-3 rounded-lg transition-colors duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}