import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/news';
import { Calendar, Clock } from 'lucide-react';

interface RelatedNewsProps {
  articles: NewsArticle[];
}

export default function RelatedNews({ articles }: RelatedNewsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map(article => (
        <Link key={article.id} href={`/news/${article.slug}`} prefetch={false}>
          <div className="group dark:bg-gray-900/50 rounded-xl overflow-hidden border dark:border-white border-gray-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="relative aspect-video overflow-hidden bg-gray-800">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                loading="lazy"
                quality={75}
                unoptimized={true}
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
