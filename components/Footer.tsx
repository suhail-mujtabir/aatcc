// components/Footer.tsx
"use client";

import { FaFacebook, FaInstagram, FaLinkedin} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-10 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left side: Organization info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            AATCC Student Chapter
          </h3>
          <p className="text-sm leading-relaxed">
            Advancing textile innovation and community growth through collaboration, learning, and events.
          </p>
        </div>

        {/* Middle: Quick links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/events" className="hover:text-white">Events</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Right side: Social links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Follow Us</h3>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-blue-500"><FaFacebook /></a>
            <a href="#" className="hover:text-pink-500"><FaInstagram /></a>
            <a href="#" className="hover:text-blue-400"><FaLinkedin /></a>
            <a href="#" className="hover:text-blue-500"><MdEmail /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} AATCC Student Chapter — All Rights Reserved
      </div>
    </footer>
  );
}
