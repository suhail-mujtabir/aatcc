"use client";

import About from "@/components/home/about";
import Activities from "@/components/home/activities";
import Hero from "@/components/home/hero";
import News from "@/components/home/news";
import NewsCarousel from "@/components/news/NewsCarousel";
import RipplesScript from "@/components/scripts/RipplesScript";
import { handleScrollClick } from "@/components/utils/smoothScroll"; // <-- Imports the new function
import Intro from '@/components/intro/intro';
import InfiniteScrollTestimonials from '@/components/home/InfiniteScrollTestimonials';
// ================== Page Component ==================
export default function Home() {
  // The scroll logic is now imported and no longer needs to be defined here.

  return (
    <>
       <Intro />
      <RipplesScript />
      <div className="flex flex-col">
        {/* The imported function is passed down as a prop */}
        <Hero handleScrollClick={handleScrollClick} />
        <About />
    
        <Activities />
        <InfiniteScrollTestimonials />
        
        {/* Desktop News Component */}
        <div className="hidden lg:block">
          <News />
        </div>
        
        {/* Mobile News Carousel */}
        <div className="block lg:hidden">
          <NewsCarousel />
        </div>
      </div>

    </>
  );
}

