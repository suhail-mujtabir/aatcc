'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    $: any;
  }
}

export default function RipplesScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Re-initialize ripples on every route change
    const reinitRipples = () => {
      if (window.$ && window.$.fn.ripples) {
        try {
          // Simple re-initialization without destroy
          window.$(".water").ripples({
            resolution: 512,
            dropRadius: 20,
            perturbance: 0.04,
          });
          // console.log("🔄 Ripples re-initialized on navigation");
        } catch (e) {
          // Ignore errors (usually means already initialized)
        }
      }
    };

    // Wait a bit for the page to settle after navigation
    const timer = setTimeout(reinitRipples, 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Initial load
    const loadRipples = () => {
      if (window.$ && !window.$.fn.ripples) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jquery.ripples@0.5.3/jquery.ripples.min.js';
        script.onload = () => {
          // console.log("Ripples loaded");
          setTimeout(() => {
            if (window.$ && window.$.fn.ripples) {
              window.$(".water").ripples({
                resolution: 512,
                dropRadius: 20,
                perturbance: 0.04,
              });
              // console.log("✅ Ripples initialized!");
            }
          }, 100);
        };
        document.head.appendChild(script);
      }
    };

    if (window.$) {
      loadRipples();
    } else {
      const timer = setInterval(() => {
        if (window.$) {
          clearInterval(timer);
          loadRipples();
        }
      }, 100);
    }
  }, []);

  return (
    <Script
      src="https://code.jquery.com/jquery-3.7.1.min.js"
      strategy="afterInteractive"
    />
  );
}