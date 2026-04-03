// components/testimonials/TestimonialsContent.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getTestimonialsData, Testimonial } from '@/components/home/data/testimonials';
import TestimonyCard from './TestimonyCard';
import TestimonialSkeleton from './TestimonialSkeleton';

export default function TestimonialsContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  
  // Sort testimonials by ID in ascending order
  const allTestimonials = getTestimonialsData().sort((a, b) => a.id - b.id);
  const [displayedTestimonials, setDisplayedTestimonials] = useState<Testimonial[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  const ITEMS_PER_PAGE = 5;

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to target testimony
  useEffect(() => {
    if (!targetId) return;

    const targetTestimony = displayedTestimonials.find(
      (t) => t.id === parseInt(targetId)
    );

    if (targetTestimony) {
      // Found the target, scroll to it
      setTimeout(() => {
        const element = document.getElementById(`testimony-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else if (hasMore) {
      // Target not loaded yet, load more
      const currentLength = displayedTestimonials.length;
      if (currentLength < allTestimonials.length) {
        loadMore();
      }
    }
  }, [displayedTestimonials, targetId, hasMore, allTestimonials.length]);

  const loadMore = () => {
    const currentLength = displayedTestimonials.length;
    const nextBatch = allTestimonials.slice(
      currentLength,
      currentLength + ITEMS_PER_PAGE
    );

    if (nextBatch.length === 0) {
      setHasMore(false);
      return;
    }

    setDisplayedTestimonials([...displayedTestimonials, ...nextBatch]);

    if (currentLength + nextBatch.length >= allTestimonials.length) {
      setHasMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="bg-gray-50 dark:bg-dark-panel py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Voices of the Pioneers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-semibold mb-4">
            Insights and reflections from the visionaries who established the AATCC AUST Student Chapter and shaped its legacy.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto hidden">
            Removed for consistency
          </p>
        </div>
      </section>

      {/* Testimonials List */}
      <section className="py-12 bg-gray-50 dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <InfiniteScroll
            dataLength={displayedTestimonials.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<TestimonialSkeleton />}
            endMessage={
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  You've seen all {allTestimonials.length} testimonials
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Thank you for reading our alumni stories!
                </p>
              </div>
            }
            className="space-y-8"
          >
            {displayedTestimonials.map((testimonial) => (
              <TestimonyCard
                key={testimonial.id}
                testimonial={testimonial}
                id={`testimony-${testimonial.id}`}
              />
            ))}
          </InfiniteScroll>
        </div>
      </section>
    </div>
  );
}
