// components/home/ScrollLine.tsx
"use client";
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: number;
  name: string;
  image: string;
  testimonial: string;
  facebookUrl: string;
}

interface ScrollLineProps {
  testimonials: Testimonial[];
  speed: number; // seconds for one loop
  direction?: 'left' | 'right';
}

export default function ScrollLine({ testimonials, speed, direction = 'left' }: ScrollLineProps) {
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden py-2 md:py-3 lg:py-4 group">
      {/* Left fade edge */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-gray-50 dark:from-[#121212] to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling content */}
      <div 
        className="flex space-x-3 sm:space-x-4 md:space-x-4 w-max group-hover:pause-animation"
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={`${testimonial.id}-${index}`} 
            testimonial={testimonial} 
          />
        ))}
      </div>

      {/* Right fade edge */}
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-gray-50 dark:from-[#121212] to-transparent z-10 pointer-events-none" />
    </div>
  );

}