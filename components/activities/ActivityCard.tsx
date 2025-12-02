"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Activity, ActivityCardProps } from "@/types/activities";

/**
 * Category configuration for styling
 * Maps each activity category to its display color scheme
 */
const categoryConfig = {
  events: {
    label: "Event",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  workshop: {
    label: "Workshop",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  "industrial-visit": {
    label: "Industrial Visit",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
};

/**
 * Formats date string to readable format
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "March 15, 2024")
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * ActivityCard Component
 * 
 * Displays a single activity in card format with image, title, metadata, and excerpt.
 * Features hover animations and links to the detailed activity page.
 * 
 * @param activity - Activity data object
 * @param className - Optional additional CSS classes
 * @param delay - Animation delay for stagger effect (in seconds)
 */
export default function ActivityCard({
  activity,
  className = "",
  delay = 0,
}: ActivityCardProps) {
  const config = categoryConfig[activity.category];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group ${className}`}
    >
      <Link
        href={`/activities/${activity.category}/${activity.slug}`}
        className="block h-full"
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          {/* Image Section */}
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={activity.featuredImage}
              alt={activity.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={75}
            />
            
            {/* Category Badge - Positioned on image */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color} backdrop-blur-sm`}
              >
                {config.label}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {activity.title}
            </h3>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={activity.date}>{formatDate(activity.date)}</time>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{activity.location}</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
              {activity.excerpt}
            </p>

            {/* Read More Link */}
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group/link">
              <span className="group-hover/link:underline">Read More</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
