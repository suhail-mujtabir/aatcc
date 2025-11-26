// components/home/activities.tsx

"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import activitiesData from "@/data/activities.json";
import { Activity } from "@/types/activities";

const activitiesContent = {
  title: "Activities",
  cards: [
    {
      heading: "Workshops",
      text: "Practical learning sessions on the latest technologies to build real-world skills.",
      category: "workshop" as const,
    },
    {
      heading: "Events",
      text: "Engaging activities, competitions, and gatherings to connect and learn together.",
      category: "events" as const,
    },
    {
      heading: "Industrial Visits",
      text: "Industry exposure through visits to leading companies and facilities.",
      category: "industrial-visit" as const,
    },
  ],
};

function useCounter(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      setCount(0);
      return;
    }
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

export default function Activities() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Calculate activity counts by category using useMemo for performance
  const activityCounts = useMemo(() => {
    // Flatten the activities array in case there's nested structure
    let activities = activitiesData.activities as Activity[];
    
    // Handle nested activities structure (if present in JSON)
    const flatActivities = activities.flatMap((item: any) => {
      if (item.activities && Array.isArray(item.activities)) {
        return item.activities;
      }
      return item;
    });
    
    return {
      workshop: flatActivities.filter((a: Activity) => a.category === 'workshop').length,
      events: flatActivities.filter((a: Activity) => a.category === 'events').length,
      'industrial-visit': flatActivities.filter((a: Activity) => a.category === 'industrial-visit').length,
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    const currentRef = activitiesRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section
      id="activities"
      className="py-16 md:py-20 lg:py-24 bg-white px-4 md:px-6 dark:bg-pure-black"
      ref={activitiesRef}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 lg:mb-12 dark:text-white">
          {activitiesContent.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 sm:place-items-center lg:place-items-stretch">
          {activitiesContent.cards.map((card, idx) => {
            const count = useCounter(activityCounts[card.category], inView);
            return (
              <div
                key={idx}
                className="w-full max-w-md sm:max-w-none p-6 md:p-8 bg-gray-50 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:shadow-gray-700/20"
              >
                <h3 className="text-xl md:text-2xl font-semibold mb-2 dark:text-white">
                  {card.heading}
                </h3>
                <p className="text-3xl md:text-4xl font-bold text-green-600 mb-3 md:mb-4 dark:text-green-400">
                  {count}
                </p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
