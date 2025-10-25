

import Link from "next/link";

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
    <section id="about" className="py-24 bg-gray-100 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center md:justify-start">
          <img
            src="/logo.png"
            alt="Student Org Logo"
            className="w-64 h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6">{aboutContent.title}</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {aboutContent.text}
          </p>
          <Link
            href="/about"
            className="inline-block px-8 py-3 font-semibold text-white bg-black/85 rounded-full 
            transform transition-transform duration-300 hover:scale-110"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}
