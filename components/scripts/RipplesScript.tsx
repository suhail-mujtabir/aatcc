"use client";

import Script from "next/script";

// We need to declare jQuery for TypeScript to recognize the '$' symbol
declare global {
  interface Window {
    $: any;
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
          try {
            // @ts-ignore
            $(".water").ripples({
              resolution: 512,
              dropRadius: 25,
              perturbance: 0.03,
            });
          } catch (e) {
            console.error("Failed to initialize ripples", e);
          }
        }}
      />
    </>
  );
}
