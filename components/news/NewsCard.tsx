'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { NewsArticle } from '@/lib/news';

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export default function NewsCard({ article, index }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/news/${article.slug}`}>
        <div className="group bg-gray-900 rounded-xl overflow-hidden border dark:border-white border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden bg-gray-800">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={75}
            />
          </div>
          
          {/* Content */}
          <div className="p-6 dark:bg-slate-950 bg-gray-50">
            {/* Title */}
            <h3 className="text-xl font-semibold mb-3 line-clamp-2 dark:text-white group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
            
            {/* Excerpt */}
            <p className="dark:text-dark-muted text-gray-600 text-sm mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
