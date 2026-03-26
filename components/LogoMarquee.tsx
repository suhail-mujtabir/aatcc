'use client';

import Image from 'next/image';
import React from 'react';

// Section Headings
const SECTION_HEADINGS = {
  sponsors: "Our Sponsors",
  collaborations: "Collaborations",
  mediaPartners: "Media Partners"
};

// Animation Speed (lower = faster, default: 30)
const ANIMATION_SPEED = {
  sponsors: 120,
  collaborations: 140,
  mediaPartners: 120
};

// Logo Data - Replace image paths and add links as needed
const SPONSORS = [
  { id: 1, name: "Sponsor 1", image: "/images/logos/placeholder-1.png", link: "" },
  { id: 2, name: "Sponsor 2", image: "/images/logos/placeholder-2.png", link: "" },
  { id: 3, name: "Sponsor 3", image: "/images/logos/placeholder-3.png", link: "" },
  { id: 4, name: "Sponsor 4", image: "/images/logos/placeholder-4.png", link: "" },
  { id: 5, name: "Sponsor 5", image: "/images/logos/placeholder-5.png", link: "" },
  { id: 6, name: "Sponsor 6", image: "/images/logos/placeholder-6.png", link: "" },
];

const COLLABORATIONS = [
  { id: 1, name: "Collaboration 1", image: "/images/logos/placeholder-1.png", link: "" },
  { id: 2, name: "Collaboration 2", image: "/images/logos/placeholder-2.png", link: "" },
  { id: 3, name: "Collaboration 3", image: "/images/logos/placeholder-3.png", link: "" },
  { id: 4, name: "Collaboration 4", image: "/images/logos/placeholder-4.png", link: "" },
  { id: 5, name: "Collaboration 5", image: "/images/logos/placeholder-5.png", link: "" },
  { id: 6, name: "Collaboration 6", image: "/images/logos/placeholder-6.png", link: "" },
];

const MEDIA_PARTNERS = [
  { id: 1, name: "Media Partner 1", image: "/images/logos/placeholder-1.png", link: "" },
  { id: 2, name: "Media Partner 2", image: "/images/logos/placeholder-2.png", link: "" },
  { id: 3, name: "Media Partner 3", image: "/images/logos/placeholder-3.png", link: "" },
  { id: 4, name: "Media Partner 4", image: "/images/logos/placeholder-4.png", link: "" },
  { id: 5, name: "Media Partner 5", image: "/images/logos/placeholder-5.png", link: "" },
  { id: 6, name: "Media Partner 6", image: "/images/logos/placeholder-6.png", link: "" },
];

// Logo Size (width x height in pixels)
// Mobile: 80x40, Tablet: 100x50, Desktop: 120x60
const LOGO_SIZE = {
  mobile: { width: 80, height: 40 },
  tablet: { width: 100, height: 50 },
  desktop: { width: 120, height: 60 }
};

// Spacing between logos (in pixels)
// Mobile: 24px, Tablet: 32px, Desktop: 40px
const LOGO_SPACING = {
  mobile: 24,
  tablet: 32,
  desktop: 40
};

// TypeScript Interfaces
interface Logo {
  id: number;
  name: string;
  image: string;
  link: string;
}

interface LogoLineProps {
  logos: Logo[];
  speed?: number;
  direction?: 'left' | 'right';
}

interface SectionHeadings {
  sponsors: string;
  collaborations: string;
  mediaPartners: string;
}

interface AnimationSpeed {
  sponsors: number;
  collaborations: number;
  mediaPartners: number;
}

interface LogoSize {
  width: number;
  height: number;
}

// Placeholder Logo Component (fallback)
function PlaceholderLogo({ number }: { number: number }) {
  return (
    <div 
      className="flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700 w-full h-full"
    >
      <span className="text-gray-400 font-semibold text-xs md:text-sm">Logo {number}</span>
    </div>
  );
}

// Individual Logo Line Component with infinite scroll
function LogoLine({ logos, speed = 30, direction = 'left' }: LogoLineProps) {
  // Create repeated content for seamless marquee - same as flowingMenu technique
  const marqueeContent = React.useMemo(() => {
    const content: Array<Logo & { uniqueKey: string }> = [];
    // Duplicate 16 times for smooth infinite scroll
    for (let i = 0; i < 16; i++) {
      logos.forEach((logo) => {
        content.push({ ...logo, uniqueKey: `${logo.id}-${i}` });
      });
    }
    return content;
  }, [logos]);
  
  return (
    <div className="dark:bg-gray-950 bg-gray-100 relative overflow-hidden w-full py-4 md:py-6 lg:py-8">
      <div className="h-full w-max flex">
        <div 
          className="flex items-center h-full gap-6 md:gap-8 lg:gap-10"
          style={{ 
            animation: `marquee-${direction} ${speed}s linear infinite`,
            width: 'max-content',
          }}
        >
          {marqueeContent.map((logo) => (
            <div
              key={logo.uniqueKey}
              className="flex-shrink-0 flex items-center justify-center w-20 h-10 md:w-[100px] md:h-[50px] lg:w-[120px] lg:h-[60px]"
            >
              {logo.link ? (
                <a
                  href={logo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 w-full h-full"
                >
                  {logo.image.includes('placeholder') ? (
                    <PlaceholderLogo number={logo.id} />
                  ) : (
                    <Image
                      src={logo.image}
                      alt={logo.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 80px, (max-width: 1024px) 100px, 120px"
                      loading="lazy"
                      quality={75}
                    />
                  )}
                </a>
              ) : (
                <div 
                  className="relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 w-full h-full"
                >
                  {logo.image.includes('placeholder') ? (
                    <PlaceholderLogo number={logo.id} />
                  ) : (
                    <Image
                      src={logo.image}
                      alt={logo.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 80px, (max-width: 1024px) 100px, 120px"
                      loading="lazy"
                      quality={75}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Fade edges - responsive width */}
      <div className="absolute top-0 left-0 h-full w-12 md:w-16 lg:w-20 bg-gradient-to-r dark:from-gray-950 to-transparent pointer-events-none z-10 from-gray-100" />
      <div className="absolute top-0 right-0 h-full w-12 md:w-16 lg:w-20 bg-gradient-to-l dark:from-gray-950 to-transparent pointer-events-none z-10 from-gray-100" />
      
      {/* Keyframes for both directions */}
      <style jsx global>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}

// Main Logo Marquee Component
export default function LogoMarquee() {
  return (
    <section className="py-8 md:py-12 lg:py-16 dark:bg-gray-950 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Sponsors Section */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white text-center mb-4 md:mb-6 lg:mb-8">
            {SECTION_HEADINGS.sponsors}
          </h2>
          <LogoLine 
            logos={SPONSORS} 
            speed={ANIMATION_SPEED.sponsors}
            direction="left"
          />
        </div>
        
        {/* Collaborations Section */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white text-center mb-4 md:mb-6 lg:mb-8">
            {SECTION_HEADINGS.collaborations}
          </h2>
          <LogoLine 
            logos={COLLABORATIONS} 
            speed={ANIMATION_SPEED.collaborations}
            direction="right"
          />
        </div>
        
        {/* Media Partners Section */}
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white text-center mb-4 md:mb-6 lg:mb-8">
            {SECTION_HEADINGS.mediaPartners}
          </h2>
          <LogoLine 
            logos={MEDIA_PARTNERS} 
            speed={ANIMATION_SPEED.mediaPartners}
            direction="left"
          />
        </div>
      </div>
    </section>
  );
}