'use client';

import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import NewsCard from './NewsCard';
import { NewsArticle } from '@/lib/news';

interface NewsListingProps {
  initialNews: NewsArticle[];
}

export default function NewsListing({ initialNews }: NewsListingProps) {
  const [displayedNews, setDisplayedNews] = useState<NewsArticle[]>(
    initialNews.slice(0, 9) // Initial load: 9 items
  );
  const [hasMore, setHasMore] = useState(initialNews.length > 9);

  const loadMore = () => {
    const currentLength = displayedNews.length;
    const nextNews = initialNews.slice(currentLength, currentLength + 6);
    
    if (nextNews.length === 0) {
      setHasMore(false);
      return;
    }
    
    setDisplayedNews([...displayedNews, ...nextNews]);
    
    if (currentLength + nextNews.length >= initialNews.length) {
      setHasMore(false);
    }
  };

  return (
    <InfiniteScroll
      dataLength={displayedNews.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }
      endMessage={
        <p className="text-center text-gray-500 py-8">
          You&apos;ve reached the end of our news archive
        </p>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedNews.map((article, index) => (
          <NewsCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
