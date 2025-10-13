"use client";

// The Hero component now receives the scroll handler as a prop
interface HeroProps {
  handleScrollClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Hero({ handleScrollClick }: HeroProps) {
  return (
    <div
      className="gsap-reveal relative h-screen flex items-center justify-center text-center text-white water hero-with-overlay"
      style={{ backgroundImage: "url(/hero-textile.jpg)" }}
    >
      <div className="relative z-10 px-6">
        <h1 className="text-5xl font-bold mb-4">
          AATCC AUST Student Chapter
        </h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          A hub for creativity, teamwork, and innovation.
        </p>
        <a
          href="#about"
          onClick={(e) => handleScrollClick(e, 'about')}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
