'use client';

import { FacebookShareButton, LinkedinShareButton } from 'react-share';
import { Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-4">
      {/* Facebook */}
      <FacebookShareButton url={url} title={title}>
        <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors cursor-pointer">
          <Facebook className="w-5 h-5 text-gray-50" />
          <span className='text-gray-50'>Facebook</span>
        </div>
      </FacebookShareButton>
      
      {/* LinkedIn */}
      <LinkedinShareButton url={url} title={title}>
        <div className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors cursor-pointer">
          <Linkedin className="w-5 h-5 text-gray-50" />
          <span className='text-gray-50'>LinkedIn</span>
        </div>
      </LinkedinShareButton>
      
      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-gray-200 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-5 h-5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
