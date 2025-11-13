// components/Footer.tsx

// components/Footer.tsx
"use client";

import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 border-t border-gray-700 dark:bg-dark-panel dark:border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          
          {/* Organization info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 dark:text-white">
              AATCC Student Chapter
            </h3>
            <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0 dark:text-dark-muted">
              Advancing textile innovation and community growth through collaboration, learning, and events.
            </p>
          </div>

          {/* Quick links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li>
                <a href="/" className="hover:text-white transition-colors duration-200 block sm:inline dark:text-gray-300 dark:hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-white transition-colors duration-200 block sm:inline dark:text-gray-300 dark:hover:text-white">
                  Events
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors duration-200 block sm:inline dark:text-gray-300 dark:hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors duration-200 block sm:inline dark:text-gray-300 dark:hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 dark:text-white">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-start space-x-4 sm:space-x-6 text-xl sm:text-2xl">
              <a 
                href="https://www.facebook.com/AATCC.AUST/" 
                className="hover:text-blue-500 transition-colors duration-200 transform hover:scale-110 dark:text-gray-300 dark:hover:text-blue-500"
                aria-label="Facebook"
                target="_blank"
              >
                <FaFacebook />
              </a>
              <a 
                href="https://www.instagram.com/aatcc.aust" 
                className="hover:text-pink-500 transition-colors duration-200 transform hover:scale-110 dark:text-gray-300 dark:hover:text-pink-500"
                aria-label="Instagram"
                target="_blank"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://www.linkedin.com/company/austaatcc" 
                className="hover:text-blue-400 transition-colors duration-200 transform hover:scale-110 dark:text-gray-300 dark:hover:text-blue-400"
                aria-label="LinkedIn"
                target="_blank"
              >
                <FaLinkedin />
              </a>
              <a 
                href="mailto:aatccaust@gmail.com" 
                className="hover:text-blue-500 transition-colors duration-200 transform hover:scale-110 dark:text-gray-300 dark:hover:text-blue-400"
                aria-label="Email"
                target="_blank"
              >
                <MdEmail />
              </a>
            </div>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="text-center text-xs sm:text-sm text-gray-500 mt-8 sm:mt-12 border-t border-gray-700 pt-4 sm:pt-6 dark:text-gray-400 dark:border-gray-600">
          © {currentYear} AATCC Student Chapter — All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
