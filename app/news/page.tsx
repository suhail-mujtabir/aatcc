export const dynamic = 'force-static';
import { Metadata } from 'next';
import NewsListing from '@/components/news/NewsListing';
import { getAllNews } from '@/lib/news';

export const metadata: Metadata = {
  title: 'Latest News | AATCC AUST Student Chapter',
  description: 'Stay updated with the latest news, events, and achievements from AATCC AUST Student Chapter. Read about our workshops, competitions, partnerships, and industry collaborations.',
  openGraph: {
    title: 'Latest News | AATCC AUST Student Chapter',
    description: 'Stay updated with AATCC AUST activities, events, and achievements.',
    type: 'website',
  },
};

export default function NewsPage() {
  const allNews = getAllNews();
  
  return (
    <main className="min-h-screen py-5 px-6 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 dark:text-white">
            Latest News
          </h1>
          <p className="text-gray-400 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Stay updated with AATCC AUST activities, events, and achievements
          </p>
        </div>
        
        {/* News Grid with Infinite Scroll */}
        <NewsListing initialNews={allNews} />
      </div>
    </main>
  );
}
