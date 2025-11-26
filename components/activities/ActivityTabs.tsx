"use client";

import { motion } from "framer-motion";
import { Calendar, Wrench, Building2, Grid3x3 } from "lucide-react";
import { ActivityCategory, ActivityTabsProps } from "@/types/activities";

/**
 * Tab configuration with labels, values, and icons
 */
const tabs = [
  {
    label: "All Activities",
    value: "all" as const,
    icon: Grid3x3,
  },
  {
    label: "Events",
    value: "events" as ActivityCategory,
    icon: Calendar,
  },
  {
    label: "Workshop",
    value: "workshop" as ActivityCategory,
    icon: Wrench,
  },
  {
    label: "Industrial Visit",
    value: "industrial-visit" as ActivityCategory,
    icon: Building2,
  },
];

/**
 * ActivityTabs Component
 * 
 * Horizontal tab navigation with pill-style buttons for filtering activities.
 * The selected tab has a filled background, while unselected tabs are outlined.
 * Includes smooth animations on tab switch.
 * 
 * Features:
 * - Client-side filtering (no URL change)
 * - Icon + label for each tab
 * - Responsive design (stacks on mobile if needed)
 * - Dark mode support
 * - Smooth animations with Framer Motion
 * 
 * @param selectedTab - Currently active tab value
 * @param onTabChange - Callback function when tab is clicked
 * @param className - Optional additional CSS classes
 */
export default function ActivityTabs({
  selectedTab,
  onTabChange,
  className = "",
}: ActivityTabsProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Tabs Container */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 lg:gap-4">
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.value;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`cursor-pointer
                relative px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-full
                font-semibold text-xs sm:text-sm md:text-base
                transition-all duration-300
                flex items-center gap-1.5 sm:gap-2
                min-h-[44px]
                ${
                  isSelected
                    ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Filter by ${tab.label}`}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />

              {/* Label */}
              <span>{tab.label}</span>

              {/* Animated background for selected tab */}
              {isSelected && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-full -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Optional: Activity count indicator */}
      <div className="mt-3 md:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {selectedTab === "all"
            ? "Showing all activities"
            : `Showing ${
                tabs.find((t) => t.value === selectedTab)?.label || ""
              }`}
        </p>
      </div>
    </div>
  );
}
