"use client";
import ThemeToggle from "./ThemeToggle";
import SnowToggle from "./SnowToggle";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "about", label: "About", page: "/about" },
  {
    id: "activities",
    label: "Activities",
    page: "/activities",
    children: [
      { id: "events", label: "Events", page: "/activities?category=events" },
      { id: "workshops", label: "Workshops", page: "/activities?category=workshop" },
      { id: "industrial-visit", label: "Industrial Visit", page: "/activities?category=industrial-visit" },
    ],
  },
  { id: "hof", label: "Hall of Fame", page: "/hof" },
  { id: "news", label: "News", page: "/news" },
  { id: "contact", label: "Contact", page: "/contact" },
  {id: "weave", label:"Weave", page:"/weave"}
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAbout = pathname === "/about";

  // Pages that should have transparent navbar initially
  const hasScrollBehavior = isHome || isAbout;

  // Handle scroll behavior on pages with hero sections
  useEffect(() => {
    if (hasScrollBehavior) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [hasScrollBehavior]);

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

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          ease: "easeOut",
          delay: isHome ? 4.5 : 0  // Only delay on homepage
        }}
        className={`${
          isDashboard ? 'sticky' : 'fixed'
        } top-0 left-0 w-full z-50 transition-colors duration-500 ${
          !hasScrollBehavior || scrolled ? "bg-black/85 backdrop-blur-md" : "bg-transparent"
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
              priority
              quality={90}
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
                  <Link
                    href={it.page}
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
                  </Link>

                  {/* Dropdown for Activities */}
                  {it.children && (
                    <ul className="absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top border border-gray-700">
                      {it.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.page}
                            className="block px-4 py-3 text-white hover:bg-green-600 transition-colors duration-200 text-sm"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
            <li><SnowToggle /></li>
            <li><ThemeToggle /></li>
          </ul>

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
                                    <Link
                                      href={child.page}
                                      className="block py-2 text-gray-300 hover:text-green-400 transition-colors duration-200"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.page}
                          className="block py-3 text-white font-medium text-lg hover:text-green-400 transition-colors duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobile Auth Buttons */}
                  <div className="pt-4 border-t border-gray-800/50">
                    <div className="flex justify-center gap-2 mb-4">
                      <SnowToggle />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for pages that don't have hero sections */}
      {!isHome && !isDashboard && !isAbout && (
        <div className="dark:bg-gray-950 h-[62px]" />
      )}
    </>
  );
}