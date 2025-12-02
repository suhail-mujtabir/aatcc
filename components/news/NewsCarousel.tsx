'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import TextReveal from '../Textreveal';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import newsData from '@/data/news.json';

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
}

export default function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});

  const autoplayPlugin = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      skipSnaps: false,
      align: 'start',
    },
    [autoplayPlugin]
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setCurrentIndex(newIndex);
    setAnimationKey((prev) => prev + 1);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Trigger initial animation
  useEffect(() => {
    setAnimationKey(1);
  }, []);

  // Filter to show only featured news
  const newsItems: NewsItem[] = newsData.news.filter(item => item.featured === true);

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <section id="news-mobile" className="relative bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
      <div className="max-w-2xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 dark:text-white">
          Latest News
        </h2>

        {/* Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {newsItems.map((newsItem, index) => (
              <div
                key={newsItem.id}
                className="flex-[0_0_100%] min-w-0 px-2 sm:px-4"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Image */}
                  <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700">
                    {!imageLoaded[newsItem.id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <Image
                      src={newsItem.image}
                      alt={newsItem.title}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        imageLoaded[newsItem.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 600px, 700px"
                      onLoad={() => setImageLoaded(prev => ({ ...prev, [newsItem.id]: true }))}
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      quality={75}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                      {newsItem.title}
                    </h3>

                    {/* Excerpt with Text Reveal Animation */}
                    <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                      {currentIndex === index ? (
                        <TextReveal
                          trigger={animationKey}
                          duration={1.5}
                          delay={100}
                        >
                          {newsItem.excerpt}
                        </TextReveal>
                      ) : (
                        <span>{newsItem.excerpt}</span>
                      )}
                    </div>

                    {/* Read More Button */}
                    <div className="pt-2">
                      <a
                        href={`/news/${newsItem.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8" role="tablist" aria-label="News carousel navigation">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-blue-600 w-8 h-2.5'
                  : 'bg-gray-400 dark:bg-gray-600 w-2.5 h-2.5 hover:bg-blue-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
              style={{ minHeight: '24px', minWidth: '24px' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
