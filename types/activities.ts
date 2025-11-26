/**
 * TypeScript type definitions for Activities section
 * Used for type-safe handling of activity data throughout the application
 */

/**
 * Activity category types
 * Represents the different types of activities AATCC organizes
 */
export type ActivityCategory = "events" | "workshop" | "industrial-visit";

/**
 * Activity interface
 * Complete structure for an activity with all required and optional fields
 */
export interface Activity {
  /** Unique identifier for the activity */
  id: string;
  
  /** Category classification of the activity */
  category: ActivityCategory;
  
  /** URL-friendly slug for routing */
  slug: string;
  
  /** Display title of the activity */
  title: string;
  
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  
  /** Short description for card previews (1-2 sentences) */
  excerpt: string;
  
  /** Full detailed description with multiple paragraphs */
  description: string;
  
  /** Path to the main featured image */
  featuredImage: string;
  
  /** Array of additional image paths for gallery */
  gallery: string[];
  
  /** Physical location where the activity took place */
  location: string;
  
  /** Name of the organizing team/committee */
  organizer: string;
}

/**
 * Activities data structure from JSON file
 */
export interface ActivitiesData {
  activities: Activity[];
}

/**
 * Tab configuration for filtering
 */
export interface ActivityTab {
  /** Display label for the tab */
  label: string;
  
  /** Value used for filtering (matches ActivityCategory or 'all') */
  value: ActivityCategory | "all";
  
  /** Icon component (optional) */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Props for ActivityCard component
 */
export interface ActivityCardProps {
  /** Activity data to display */
  activity: Activity;
  
  /** Optional CSS classes */
  className?: string;
  
  /** Animation delay for stagger effect */
  delay?: number;
}

/**
 * Props for ActivityTabs component
 */
export interface ActivityTabsProps {
  /** Currently selected tab value */
  selectedTab: ActivityCategory | "all";
  
  /** Callback when tab is changed */
  onTabChange: (tab: ActivityCategory | "all") => void;
  
  /** Optional CSS classes */
  className?: string;
}

/**
 * Utility type for route parameters in dynamic routes
 */
export interface ActivityPageParams {
  category: ActivityCategory;
  slug: string;
}

/**
 * Helper function type for filtering activities
 */
export type ActivityFilter = (activity: Activity) => boolean;

/**
 * Category display configuration
 */
export interface CategoryConfig {
  label: string;
  value: ActivityCategory;
  color: string;
  bgColor: string;
}

/**
 * Metadata for SEO and social sharing
 */
export interface ActivityMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
}
