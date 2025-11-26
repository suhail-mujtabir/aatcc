import { Metadata } from "next";

/**
 * Metadata for Activities Section
 * SEO optimization with Open Graph and Twitter Cards
 */
export const metadata: Metadata = {
  title: "Activities - AATCC AUST Student Chapter",
  description:
    "Explore our events, workshops, and industrial visits organized by AATCC AUST Student Chapter. Join us in learning, innovation, and professional development.",
  keywords: [
    "AATCC AUST",
    "student chapter",
    "student activities",
    "student events",
    "tech workshops",
    "industrial visits",
    "AUST events",
    "student chapter activities",
  ],
  openGraph: {
    title: "Activities - AATCC AUST Student Chapter",
    description:
      "Discover exciting events, hands-on workshops, and industry exposure opportunities organized by AATCC AUST Student Chapter.",
    type: "website",
    url: "https://aatcc-aust.org/activities",
    images: [
      {
        url: "/images/activities-og.jpg",
        width: 1200,
        height: 630,
        alt: "AATCC Activities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Activities - AATCC AUST Student Chapter",
    description:
      "Explore our events, workshops, and industrial visits. Join us in building skills and networks.",
    images: ["/images/activities-og.jpg"],
  },
};

/**
 * Activities Layout Component
 * Wraps all activities pages with consistent metadata
 */
export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
