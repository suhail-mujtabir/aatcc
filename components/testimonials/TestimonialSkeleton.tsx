// components/testimonials/TestimonialSkeleton.tsx
"use client";

export default function TestimonialSkeleton() {
  return (
    <div className="space-y-8 py-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-dark-panel rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-800 animate-pulse"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6">
            {/* Profile Photo Skeleton */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Name and Info Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Name */}
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mx-auto md:mx-0" />
              {/* Company */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mx-auto md:mx-0" />
              {/* Social Links */}
              <div className="flex gap-3 justify-center md:justify-start mt-4">
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Testimony Text Skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24" />
            <div className="space-y-2 pl-4 border-l-4 border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
            </div>
          </div>

          {/* Contact Info Skeleton */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
