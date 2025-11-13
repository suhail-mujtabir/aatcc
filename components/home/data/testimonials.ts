// components/home/data/testimonials.ts
import membersData from "@/data-updated.json";

// Define the member data interface based on your JSON structure
interface MemberData {
  id: number;
  Name?: string;
  img: string;
  Testimony?: string;
  "Testimony  "?: string; // Handle the weird spacing
  fb?: string;
  // Add other fields from your JSON if needed
}

export interface Testimonial {
  id: number;
  name: string;
  image: string;
  testimonial: string;
  facebookUrl: string;
}

/**
 * Converts the JSON data to the TestimonialCard format
 */
export const getTestimonialsData = (): Testimonial[] => {
  return (membersData as MemberData[]).map((m) => ({
    id: m.id,
    name: (m.Name || "Anonymous").trim(),
    image: m.img,
    testimonial: (m.Testimony || m["Testimony  "] || "No testimony available").trim(),
    facebookUrl: (m.fb || "#").trim(),
  }));
};
