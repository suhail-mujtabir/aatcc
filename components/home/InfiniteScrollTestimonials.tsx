// components/home/InfiniteScrollTestimonials.tsx
"use client";

import { getTestimonialsData, Testimonial } from './data/testimonials';
import ScrollLine from './ScrollLine';

export default function InfiniteScrollTestimonials() {
  const testimonialsData = getTestimonialsData();
  
  const distributeTestimonials = (testimonials: Testimonial[]): Testimonial[][] => {
    const total = testimonials.length;
    const maxLines = 3;
    
    // Adjust max per line based on total count
    let maxPerLine = 8;
    if (total > 24) {
      maxPerLine = 9; // Increase max limit for 25+ testimonials
    }
    
    const minPerLine = 5;
    const lines: Testimonial[][] = [];
    
    if (total === 0) return lines;
    
    // Calculate how many lines we actually need
    const neededLines = Math.min(maxLines, Math.ceil(total / minPerLine));
    
    // Calculate base items per line
    const baseItemsPerLine = Math.floor(total / neededLines);
    let remainder = total % neededLines;
    
    let currentIndex = 0;
    
    // Distribute testimonials across lines
    for (let i = 0; i < neededLines; i++) {
      let itemsInThisLine = baseItemsPerLine;
      
      // Distribute remainder items
      if (remainder > 0) {
        itemsInThisLine += 1;
        remainder -= 1;
      }
      
      // Ensure we don't exceed max per line
      itemsInThisLine = Math.min(itemsInThisLine, maxPerLine);
      
      const line = testimonials.slice(currentIndex, currentIndex + itemsInThisLine);
      lines.push(line);
      currentIndex += itemsInThisLine;
    }
    
    return lines;
  };

  const lines = distributeTestimonials(testimonialsData);

  return (
    <section className="py-16 bg-gray-50 dark:bg-dark-panel overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">
          Member Testimonials
        </h2>
        
        <div className="scroll-container relative">
          <div className="space-y-0">
            {lines.map((line, index) => (
              <ScrollLine 
                key={index}
                testimonials={line} 
                speed={70 + (index * 10)}
                direction={index % 2 === 0 ? "left" : "right"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}