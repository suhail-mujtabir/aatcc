'use client';

import Script from 'next/script';
import type { JQuery } from 'jquery';

// We need to declare jQuery for TypeScript to recognize the ' symbol
declare global {
  interface Window {
    $: JQuery;
  }
}

export default function RipplesScript() {
  return (
    <>
      {/* Script loading is now self-contained within this component */}
      <Script
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js"
        strategy="afterInteractive"
        onReady={() => {
          const $ = window.$;
          if ($) {
            try {//@ts-ignore
              $(".water").ripples({
                resolution: 512,
                dropRadius: 25,
                perturbance: 0.03,
              });
            } catch (e) {
              console.error("Failed to initialize ripples. This is expected on browsers that don't support WebGL.", e);
            }
          }
        }}
      />
    </>
  );
}
