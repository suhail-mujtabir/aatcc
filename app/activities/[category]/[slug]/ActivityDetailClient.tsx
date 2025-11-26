"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Activity } from "@/types/activities";

/**
 * Formats date string to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface ActivityDetailClientProps {
  activity: Activity;
  config: {
    label: string;
    color: string;
    bgColor: string;
  };
}

/**
 * Client-side component for activity detail page
 * Handles all animations and interactive elements
 */
export default function ActivityDetailClient({
  activity,
  config,
}: ActivityDetailClientProps) {
  /**
   * Handle share functionality
   */
  const handleShare = async () => {
    const shareData = {
      title: activity.title,
      text: activity.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Image - Full width, starts immediately below navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <div className="relative w-full aspect-video md:aspect-[21/9]">
          <Image
            src={activity.featuredImage}
            alt={activity.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </motion.div>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-4"
        >
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${config.bgColor} ${config.color}`}
          >
            {config.label}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
        >
          {activity.title}
        </motion.h1>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700"
        >
          {/* Date */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5" />
            <time dateTime={activity.date}>{formatDate(activity.date)}</time>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-5 h-5" />
            <span>{activity.location}</span>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5" />
            <span>{activity.organizer}</span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            aria-label="Share this activity"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
        >
          {activity.description.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Image Gallery */}
        {activity.gallery && activity.gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Photo Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activity.gallery.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={image}
                    alt={`${activity.title} - Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related Activities or CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Interested in Our Activities?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join AATCC AUST Student Chapter to participate in exciting events,
            workshops, and gain valuable industry exposure.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get in Touch
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </article>
    </main>
  );
}
