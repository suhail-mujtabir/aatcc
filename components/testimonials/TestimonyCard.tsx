// components/testimonials/TestimonyCard.tsx
"use client";

import Image from 'next/image';
import SocialLinks from './SocialLinks';
import { Testimonial } from '@/components/home/data/testimonials';

interface TestimonyCardProps {
  testimonial: Testimonial;
  id?: string;
}

export default function TestimonyCard({ testimonial, id }: TestimonyCardProps) {
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Format: 01234567890 -> 0123-456-7890
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  return (
    <article
      id={id}
      className="bg-white dark:bg-dark-panel rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
    >
      {/* Header Section with Photo and Name */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6">
        {/* Profile Photo */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full rounded-full object-cover border-4 border-green-200 dark:border-green-600 shadow-md"
            />
          </div>
        </div>

        {/* Name and Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {testimonial.name}
          </h2>

          {testimonial.role && testimonial.role !== '' && (
            <div className="mb-3">
              <p className="text-sm md:text-base text-green-600 dark:text-green-400 font-semibold italic">
                {testimonial.role}
              </p>
            </div>
          )}

          {testimonial.company && testimonial.company !== 'N/A' && testimonial.company !== '' && (
            <div className="mb-4">
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium">
                {testimonial.company}
              </p>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-4">
            <SocialLinks
              linkedin={testimonial.linkedin}
              facebook={testimonial.facebookUrl}
              email={testimonial.email}
            />
          </div>
        </div>
      </div>

      {/* Testimony Text */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-3">
          Testimony
        </h3>
        <blockquote className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-green-500 dark:border-green-600 pl-4 py-2">
          "{testimonial.testimonial}"
        </blockquote>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-3">
          Contact Information
        </h3>
        <div className="space-y-2">
          {testimonial.email && (
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              <span className="font-medium">Email:</span>
              <a
                href={`mailto:${testimonial.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {testimonial.email}
              </a>
            </div>
          )}
          {testimonial.phone && (
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              <span className="font-medium">Phone:</span>
              <a
                href={`tel:${testimonial.phone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {formatPhoneNumber(testimonial.phone)}
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
