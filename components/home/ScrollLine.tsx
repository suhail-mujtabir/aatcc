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
    <div className="relative overflow-hidden py-4 group">
      <div 
        className="flex space-x-4 w-max group-hover:pause-animation"
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={`${testimonial.id}-${index}`} 
            testimonial={testimonial} 
          />
        ))}
      </div>
    </div>
  );
}