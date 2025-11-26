'use client';

import Link from "next/link";
import TextReveal, {TextFadeIn} from "../Textreveal";

const aboutContent = {
  title: "About Us",
  text: `The American Association of Textile Chemists and Colorists (AATCC) is
  a nonprofit organization established in 1921. It plays a pivotal role in
  the textile industry worldwide, offering test method development,
  quality control materials, educational resources, and professional
  networking opportunities for textile and apparel professionals. The
  association is headquartered in Research Triangle Park, North
  Carolina, USA.`,
};

export default function About() {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-24 bg-gray-100 px-6 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
        <div className="flex justify-center md:justify-start">
          <img
            src="/logo.png"
            alt="Student Org Logo"
            className="w-24 sm:w-56 md:w-60 lg:w-64 h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold mb-4 md:mb-5 lg:mb-6 dark:text-white">
          <TextFadeIn>
            {aboutContent.title}
          </TextFadeIn>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-6 md:mb-7 lg:mb-8 dark:text-gray-300">
            <TextReveal duration={2} delay={500}>
            {aboutContent.text}
          </TextReveal>
          </p>
          <Link
            href="/about"
            className="inline-block px-6 py-2.5 sm:px-7 sm:py-3 lg:px-8 font-semibold text-white bg-black/85 rounded-full 
            transform transition-transform duration-300 hover:scale-110 active:scale-95 dark:bg-white dark:text-black"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}
