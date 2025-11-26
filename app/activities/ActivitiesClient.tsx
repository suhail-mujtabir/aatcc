"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityTabs from "@/components/activities/ActivityTabs";
import { Activity, ActivityCategory } from "@/types/activities";
import activitiesData from "@/data/activities.json";

/**
 * Activities Client Component
 * Handles URL query parameter reading and tab filtering
 */
export default function ActivitiesClient() {
    const searchParams = useSearchParams();

    // Get initial category from URL query parameter
    const getInitialCategory = (): ActivityCategory | "all" => {
        const categoryParam = searchParams.get("category");

        // Validate category parameter
        const validCategories: Array<ActivityCategory | "all"> = ["events", "workshop", "industrial-visit", "all"];

        if (categoryParam && validCategories.includes(categoryParam as ActivityCategory)) {
            return categoryParam as ActivityCategory;
        }

        return "all";
    };

    // State for selected tab filter - initialized from URL
    const [selectedTab, setSelectedTab] = useState<ActivityCategory | "all">(getInitialCategory());

    // Update selected tab when URL changes (for browser back/forward)
    useEffect(() => {
        const category = getInitialCategory();
        setSelectedTab(category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Filter activities based on selected tab
    const filteredActivities = useMemo(() => {
        const activities = activitiesData.activities as Activity[];
        if (selectedTab === "all") {
            return activities;
        }
        return activities.filter(
            (activity) => activity.category === selectedTab
        );
    }, [selectedTab]);

    // Sort activities by date (newest first)
    const sortedActivities = useMemo(() => {
        return [...filteredActivities].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [filteredActivities]);

    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-4 pb-3 md:pt-5 md:pb-4 lg:pt-5 lg:pb-5 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Page Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-4 md:mb-6 lg:mb-8"
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3 lg:mb-4">
                            Our Activities
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-snug md:leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
                            Explore our events, workshops, and industrial visits designed to
                            enhance learning, foster innovation, and build professional networks.
                        </p>
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <ActivityTabs
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                            className="mb-6 md:mb-10 lg:mb-12"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Activities Grid Section */}
            <section className="pb-12 md:pb-16 lg:pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Activities Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {sortedActivities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {sortedActivities.map((activity, index) => (
                                        <ActivityCard
                                            key={activity.id}
                                            activity={activity}
                                            delay={index * 0.1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Empty State
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="max-w-md mx-auto">
                                        <div className="mb-4 text-6xl">📭</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            No Activities Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            We haven't organized any activities in this category yet.
                                            Check back soon!
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Stats Section (Optional) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {(activitiesData.activities as Activity[]).length}
                                </div>
                                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    Total Activities
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {
                                        (activitiesData.activities as Activity[]).filter(
                                            (a) => a.category === "events"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    Events
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {
                                        (activitiesData.activities as Activity[]).filter(
                                            (a) => a.category === "workshop"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    Workshops
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {
                                        (activitiesData.activities as Activity[]).filter(
                                            (a) => a.category === "industrial-visit"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    Industrial Visits
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
