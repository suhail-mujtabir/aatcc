// components/testimonials/SocialLinks.tsx
"use client";

import { Linkedin, Facebook, Mail } from 'lucide-react';

interface SocialLinksProps {
  linkedin?: string;
  facebook?: string;
  email?: string;
}

export default function SocialLinks({ linkedin, facebook, email }: SocialLinksProps) {
  return (
    <div className="flex items-center gap-3 justify-center md:justify-start">
      {linkedin && linkedin !== '' && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 hover:bg-blue-600 dark:hover:bg-red-600 text-blue-700 dark:text-blue-200 hover:text-white dark:hover:text-white transition-all duration-300 rounded-full p-3 hover:scale-125 shadow-md hover:shadow-lg"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      )}

      {facebook && facebook !== '' && facebook !== '#' && (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook Profile"
          className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 hover:bg-blue-600 dark:hover:bg-red-600 text-blue-700 dark:text-blue-200 hover:text-white dark:hover:text-white transition-all duration-300 rounded-full p-3 hover:scale-125 shadow-md hover:shadow-lg"
        >
          <Facebook className="w-5 h-5" />
        </a>
      )}

      {email && email !== '' && (
        <a
          href={`mailto:${email}`}
          aria-label="Send Email"
          className="flex items-center justify-center bg-green-100 dark:bg-green-900 hover:bg-green-600 dark:hover:bg-red-600 text-green-700 dark:text-green-200 hover:text-white dark:hover:text-white transition-all duration-300 rounded-full p-3 hover:scale-125 shadow-md hover:shadow-lg"
        >
          <Mail className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}
