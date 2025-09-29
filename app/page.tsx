// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FaFacebook, FaLinkedin, FaPhoneAlt } from "react-icons/fa";

// ================== Content Section (easy to edit) ==================
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

const activitiesContent = {
  title: "Activities",
  cards: [
    {
      heading: "Workshops",
      text: "Practical learning sessions on the latest technologies to build real-world skills.",
      count: 12,
    },
    {
      heading: "Seminars",
      text: "Talks from experts and industry leaders to broaden knowledge and inspire innovation.",
      count: 8,
    },
    {
      heading: "Community",
      text: "Building a vibrant student community through events, networking, and collaboration.",
      count: 15,
    },
  ],
};

const hofContent = {
  title: "Hall of Fame",
  members: [
    {
      name: "Abir Hossain Nishan",
      designation: "Chairperson",
      img: "/abir.jpg",
      facebook: "https://www.facebook.com/abir.hossain.nishan.2025",
      linkedin: "https://www.linkedin.com/in/abir-hossain-nishan-csca%E2%84%A2-60b3081a8/",
      contact: "#",
    },
    {
      name: "Sadman Hossain",
      designation: "Vice Chairperson",
      img: "/sadman.jpg",
      facebook: "https://www.facebook.com/sadmante11",
      linkedin: "https://www.linkedin.com/in/sadman-hossain-56a17728a/",
      contact: "#",
    },
    {
      name: "Member 2",
      designation: "Founder",
      img: "/hof/member2.jpg",
      facebook: "#",
      linkedin: "#",
      contact: "#",
    },
    {
      name: "Member 2",
      designation: "Founder",
      img: "/hof/member2.jpg",
      facebook: "#",
      linkedin: "#",
      contact: "#",
    },
    
    // 👉 Add all 23 founding members in the same format
  ],
};

const newsContent = {
  title: "News & Announcements",
  items: [
    "📢 Registration open for upcoming hackathon!",
    "📢 New partnerships with tech companies.",
    "📢 Annual general meeting scheduled next month.",
  ],
};

// ================== Counter Hook ==================
function useCounter(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      setCount(0); // reset when out of view
      return;
    }

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // EaseOutQuad easing
      const eased = 1 - Math.pow(1 - progress, 2);

      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

// ================== Page Component ==================
export default function Home() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    if (activitiesRef.current) observer.observe(activitiesRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
        <div className="relative z-10 px-6">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to Our Student Org
          </h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            A hub for creativity, teamwork, and innovation.
          </p>
          <a
            href="#about"
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-100 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Logo (Left) */}
          <div className="flex justify-center md:justify-start">
            <img
              src="/logo.png"
              alt="Student Org Logo"
              className="w-64 h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Content (Right) */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold mb-6">{aboutContent.title}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {aboutContent.text}
            </p>
            <a
              href="/about"
              className="inline-block px-8 py-3 font-semibold text-white bg-black/85 rounded-full 
                        transform transition-transform duration-300 hover:scale-110"
            >
              Read More
            </a>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section
        id="activities"
        className="py-24 bg-white px-6"
        ref={activitiesRef}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">{activitiesContent.title}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {activitiesContent.cards.map((card, idx) => {
              const count = useCounter(card.count, inView);
              return (
                <div
                  key={idx}
                  className="p-8 bg-gray-50 shadow-lg rounded-2xl hover:shadow-xl transition"
                >
                  <h3 className="text-2xl font-semibold mb-2">{card.heading}</h3>
                  <p className="text-4xl font-bold text-green-600 mb-4">
                    {count}
                  </p>
                  <p className="text-gray-600">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hall of Fame Section */}
      <section id="hof" className="py-24 bg-gray-100 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title with hover underline */}
          <a href="/hof" className="relative inline-block group mb-12">
            <h2 className="text-4xl font-bold transition-colors duration-500 group-hover:text-green-400">
              {hofContent.title}
            </h2>
            <span
              aria-hidden
              className="absolute left-1/2 -bottom-1 h-[3px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
            />
          </a>

          {/* Members Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-12">
            {hofContent.members.map((member, idx) => (
              <div
                key={idx}
                className="p-6 bg-white shadow-lg rounded-2xl hover:shadow-xl transition"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-green-200"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {member.designation}
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={member.facebook}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Facebook"
                  >
                    <FaFacebook size={20} />
                  </a>
                  <a
                    href={member.linkedin}
                    className="text-blue-700 hover:text-blue-900"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin size={20} />
                  </a>
                  <a
                    href={`tel:${member.contact}`}
                    className="text-green-600 hover:text-green-800"
                    aria-label="Contact"
                  >
                    <FaPhoneAlt size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 bg-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">{newsContent.title}</h2>
          <ul className="text-lg text-gray-700 space-y-4 text-left">
            {newsContent.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
