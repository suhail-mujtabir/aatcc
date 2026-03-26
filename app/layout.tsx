// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from '@/context/ThemeContext';
import { SnowProvider } from '@/components/SnowEffect';
import {ReactLenis} from '@/components/utils/lenis';
import ConditionalClickSpark from "@/components/ConditionalClickSpark";

// Viewport configuration (includes theme color)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D23139" },
    { media: "(prefers-color-scheme: dark)", color: "#D23139" }
  ],
  width: 'device-width',
  initialScale: 1,
}

// SEO & Open Graph Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://www.aatccaust.org'),
  
  title: {
    default: "AATCC AUST Student Chapter | First International Chapter in Bangladesh",
    template: "%s | AATCC AUST"
  },
  
  description: "Official website of AATCC AUST - The first international American Association for Textile Chemists and Colorists Student Chapter in Bangladesh at Ahsanullah University of Science and Technology.",
  
  keywords: [
    "AATCC AUST",
    "textile student organization bangladesh",
    "AUST student chapter",
    "Austex",
    "AUST textile",
    "AUST textile engineering",
    "first student chapter bangladesh",
    "American Association for Textile Chemists and Colorists",
    "Ahsanullah University of Science and Technology",
    "textile engineering Dhaka",
    "AATCC Bangladesh"
  ],
  
  authors: [{ name: "AATCC AUST Student Chapter" }],
  creator: "AATCC AUST Student Chapter",
  publisher: "AATCC AUST Student Chapter",
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aatccaust.org",
    siteName: "AATCC AUST Student Chapter",
    title: "AATCC AUST Student Chapter | First International Chapter in Bangladesh",
    description: "The first international AATCC Student Chapter in Bangladesh for textile engineering students at Ahsanullah University of Science and Technology.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AATCC AUST Student Chapter - First International Chapter in Bangladesh",
        type: "image/png",
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AATCC AUST Student Chapter | First International Chapter in Bangladesh",
    description: "The first international AATCC Student Chapter in Bangladesh for textile engineering students at AUST.",
    images: ["/og.png"],
    creator: "@AATCCAUST", // Update if you have Twitter handle
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/logo-aatcc.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/logo-aatcc.svg",
    apple: "/logo-aatcc.svg",
  },
  
  // Manifest for PWA (optional)
  manifest: "/manifest.json",
  
  // Verification (add these when you set up)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },
  
  // Alternate languages (if you add Bengali later)
  // alternates: {
  //   canonical: "https://aatcc.vercel.app",
  //   languages: {
  //     'en-US': 'https://aatcc.vercel.app',
  //     'bn-BD': 'https://aatcc.vercel.app/bn',
  //   },
  // },
  
  // Category
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for enhanced SEO */}
        <meta name="geo.region" content="BD-13" />
        <meta name="geo.placename" content="Dhaka" />
        <meta name="geo.position" content="23.7644;90.3677" />
        <meta name="ICBM" content="23.7644, 90.3677" />
        
        {/* Contact information */}
        <meta name="contact" content="aatccaust@gmail.com" />
        
        {/* Organization schema - helps Google understand your site */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AATCC AUST Student Chapter",
              "alternateName": "American Association for Textile Chemists and Colorists AUST",
              "url": "https://aatcc.vercel.app",
              "logo": "https://aatcc.vercel.app/logo-aatcc.svg",
              "description": "The first international AATCC Student Chapter in Bangladesh at Ahsanullah University of Science and Technology.",
              "email": "aatccaust@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "141 & 142, Love Road, Tejgaon Industrial Area",
                "addressLocality": "Dhaka",
                "postalCode": "1208",
                "addressCountry": "BD"
              },
              "sameAs": [
                "https://www.facebook.com/AATCC.AUST",
                "https://www.linkedin.com/company/austaatcc/"
              ],
              "memberOf": {
                "@type": "CollegeOrUniversity",
                "name": "Ahsanullah University of Science and Technology"
              }
            })
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SnowProvider>
            <ConditionalClickSpark
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <Navbar />
              <ReactLenis root>
                <main className="flex-grow">
                  {children}
                </main>
              </ReactLenis>
              <Footer/>
              <ScrollToTop />
            </ConditionalClickSpark>
          </SnowProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}