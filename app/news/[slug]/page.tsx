import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { getNewsBySlug, getAllNews, getRelatedNews } from '@/lib/news';
import ShareButtons from '@/components/news/ShareButtons';
import RelatedNews from '@/components/news/RelatedNews';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths
export async function generateStaticParams() {
  const allNews = getAllNews();
  return allNews.map(article => ({
    slug: article.slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }
  
  return {
    title: `${article.title} | AATCC AUST News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  
  if (!article) {
    notFound();
  }
  
  const relatedNews = getRelatedNews(article.slug, article.tags);
  
  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": article.image,
    "datePublished": article.date,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "AATCC AUST Student Chapter",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      }
    },
    "description": article.excerpt,
    "articleBody": article.excerpt
  };
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <article className="min-h-screen dark:bg-gray-950">
        {/* Hero Image */}
        <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gray-950">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
          />
          {/* Stronger gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/40" />
        </div>
        
        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 -mt-40 md:-mt-48 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              News
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">Article</span>
          </nav>
          
          {/* Article Header */}
          <div className="backdrop-blur-md rounded-2xl p-8 md:p-12 mb-8 border dark:border-white border-gray-800">
            <h1 className="text-gray-100 text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm dark:text-white text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(article.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} read</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Article Content */}
          <div className="dark:bg-gray-900 backdrop-blur-sm rounded-2xl p-8 md:p-12 mb-8 border dark:border-white border-gray-800/50">
            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-white
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-300 prose-ul:my-6
                prose-ol:text-gray-300 prose-ol:my-6
                prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
                prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-400"
              dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }}
            />
          </div>
          
          {/* Share Section */}
          <div className="dark:bg-gray-900 backdrop-blur-sm rounded-2xl p-8 mb-8 border dark:border-white border-gray-800/50">
            <h3 className="text-xl font-semibold mb-4">Share this article</h3>
            <ShareButtons 
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/news/${article.slug}`}
              title={article.title}
            />
          </div>
          
          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Related News</h2>
              <RelatedNews articles={relatedNews} />
            </div>
          )}
        </div>
      </article>
    </>
  );
}
