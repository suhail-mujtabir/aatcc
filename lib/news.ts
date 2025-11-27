import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import newsData from '@/data/news.json';

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  contentFile: string;
  contentHtml?: string;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
}

// Get all news articles
export function getAllNews(): NewsArticle[] {
  return newsData.news.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get single news article by slug
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const article = newsData.news.find(item => item.slug === slug);
  
  if (!article) return null;
  
  // Read content file
  const contentPath = path.join(process.cwd(), 'content/news', article.contentFile);
  
  if (!fs.existsSync(contentPath)) {
    console.error(`Content file not found: ${contentPath}`);
    return null;
  }
  
  const fileContents = fs.readFileSync(contentPath, 'utf8');
  let contentHtml: string;

  // Check file extension and process accordingly
  if (article.contentFile.endsWith('.html')) {
    // HTML file - use directly
    contentHtml = fileContents;
  } else if (article.contentFile.endsWith('.md')) {
    // Markdown file - convert to HTML
    const { content } = matter(fileContents);
    const processedContent = await remark()
      .use(html)
      .process(content);
    contentHtml = processedContent.toString();
  } else {
    throw new Error(`Unsupported file type: ${article.contentFile}`);
  }
  
  return {
    ...article,
    contentHtml
  };
}

// Get related news (by tags)
export function getRelatedNews(currentSlug: string, tags: string[], limit: number = 3): NewsArticle[] {
  return newsData.news
    .filter(article => 
      article.slug !== currentSlug && 
      article.tags.some(tag => tags.includes(tag))
    )
    .slice(0, limit);
}

// Get featured news
export function getFeaturedNews(): NewsArticle[] {
  return newsData.news.filter(article => article.featured);
}
