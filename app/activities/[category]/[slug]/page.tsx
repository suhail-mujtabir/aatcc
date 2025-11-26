import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, ActivityCategory, ActivityPageParams } from "@/types/activities";
import activitiesData from "@/data/activities.json";
import ActivityDetailClient from "./ActivityDetailClient";

/**
 * Category configuration for consistent styling
 */
const categoryConfig: Record<ActivityCategory, { label: string; color: string; bgColor: string }> = {
  events: {
    label: "Event",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  workshop: {
    label: "Workshop",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  "industrial-visit": {
    label: "Industrial Visit",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
};

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

/**
 * Generate static params for all activities
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  return activitiesData.activities.map((activity) => ({
    category: activity.category,
    slug: activity.slug,
  }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<ActivityPageParams>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const activity = activitiesData.activities.find(
    (a) => a.category === category && a.slug === slug
  ) as Activity | undefined;

  if (!activity) {
    return {
      title: "Activity Not Found",
    };
  }

  const config = categoryConfig[activity.category as ActivityCategory];
  const url = `https://aatcc-aust.org/activities/${activity.category}/${activity.slug}`;

  return {
    title: `${activity.title} - AATCC AUST`,
    description: activity.excerpt,
    keywords: [
      activity.title,
      config.label,
      "AATCC AUST",
      "student activities",
      activity.location,
    ],
    openGraph: {
      title: activity.title,
      description: activity.excerpt,
      type: "article",
      url: url,
      images: [
        {
          url: activity.featuredImage,
          width: 1200,
          height: 630,
          alt: activity.title,
        },
      ],
      publishedTime: activity.date,
      authors: [activity.organizer],
    },
    twitter: {
      card: "summary_large_image",
      title: activity.title,
      description: activity.excerpt,
      images: [activity.featuredImage],
    },
  };
}

/**
 * Activity Detail Page Component
 * 
 * Displays complete information about a single activity including:
 * - Hero image
 * - Title and metadata
 * - Full description
 * - Image gallery
 * - Breadcrumb navigation
 * - Structured data for SEO
 */
export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<ActivityPageParams>;
}) {
  const { category, slug } = await params;
  
  // Find the activity
  const activity = activitiesData.activities.find(
    (a) => a.category === category && a.slug === slug
  ) as Activity | undefined;

  // Return 404 if activity not found
  if (!activity) {
    notFound();
  }

  const config = categoryConfig[activity.category as ActivityCategory];

  // Generate JSON-LD structured data for events
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.description,
    startDate: activity.date,
    location: {
      "@type": "Place",
      name: activity.location,
    },
    organizer: {
      "@type": "Organization",
      name: activity.organizer,
    },
    image: activity.featuredImage,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Wrap client-side animations in a separate component */}
      <ActivityDetailClient activity={activity} config={config} />
    </>
  );
}
