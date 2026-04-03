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
  Email?: string;
  Linkedin?: string;
  "Phone no."?: string;
  Company?: string;
  Role?: string;
  // Add other fields from your JSON if needed
}

export interface Testimonial {
  id: number;
  name: string;
  image: string;
  testimonial: string;
  facebookUrl: string;
  email: string;
  linkedin: string;
  phone: string;
  company: string;
  role: string;
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
    email: (m.Email || "").trim(),
    linkedin: (m.Linkedin || "").trim(),
    phone: (m["Phone no."] || "").trim(),
    company: (m.Company || "").trim(),
    role: (m.Role || "").trim(),
  }));
};
