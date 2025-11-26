import { Suspense } from "react";
import ActivitiesClient from "./ActivitiesClient";

/**
 * Activities Page Component
 * 
 * Main activities page featuring:
 * - Horizontal tab navigation for filtering
 * - Responsive grid layout of activity cards
 * - Smooth animations on filter change
 * - Dark mode support
 * - SEO optimized
 * - URL query parameter support for category filtering from navbar
 * 
 * The page allows users to view all activities or filter by category
 * (Events, Workshop, Industrial Visit).
 */
export default function ActivitiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ActivitiesClient />
      </Suspense>
    </main>
  );
}
