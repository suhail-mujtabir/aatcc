// components/home/InfiniteScrollTestimonials.tsx
"use client";

import { testimonialsData } from './data/testimonials';
import ScrollLine from './ScrollLine';


export default function InfiniteScrollTestimonials() {
  const line1 = testimonialsData.slice(0, 8);
  const line2 = testimonialsData.slice(8, 16);
  const line3 = testimonialsData.slice(16, 23);

  return (
    <section className="py-16 bg-gray-50 dark:bg-dark-panel overflow-hidden">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">
          Member Testimonials
        </h2>
        
        {/* Scroll Container with Shadow Blurs */}
        <div className="scroll-container relative">
          {/* Use the SystemShadowBlurs component */}
        
          
          <div className="space-y-0">
            <ScrollLine 
              testimonials={line1} 
              speed={70} 
              direction="left"
            />
            
            <ScrollLine 
              testimonials={line2} 
              speed={80} 
              direction="right"
            />
            
            {/* <ScrollLine 
              testimonials={line3} 
              speed={70} 
              direction="left"
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}