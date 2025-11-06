// components/home/activities.tsx

"use client";

import { useEffect, useRef, useState } from "react";

const activitiesContent = {
  title: "Activities",
  cards: [
    {
      heading: "Workshops",
      text: "Practical learning sessions on the latest technologies to build real-world skills.",
      count: 12,
    },
    {
      heading: "Seminars",
      text: "Talks from experts and industry leaders to broaden knowledge and inspire innovation.",
      count: 8,
    },
    {
      heading: "Community",
      text: "Building a vibrant student community through events, networking, and collaboration.",
      count: 15,
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
      className="py-24 bg-white px-6 dark:bg-pure-black"
      ref={activitiesRef}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 dark:text-white">
          {activitiesContent.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {activitiesContent.cards.map((card, idx) => {
            const count = useCounter(card.count, inView);
            return (
              <div
                key={idx}
                className="p-8 bg-gray-50 shadow-lg rounded-2xl hover:shadow-xl transition dark:bg-gray-800 dark:shadow-gray-700/20"
              >
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">
                  {card.heading}
                </h3>
                <p className="text-4xl font-bold text-green-600 mb-4 dark:text-green-400">
                  {count}
                </p>
                <p className="text-gray-600 dark:text-gray-300">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
