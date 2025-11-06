// components/home/TestimonialCard.tsx
"use client";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  testimonial: string;
  facebookUrl: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const handleClick = () => {
    window.open(testimonial.facebookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 min-w-[320px] max-w-[380px] mx-4 flex flex-col h-auto"
    >
      {/* Testimonial Text */}
      <div className="dark:bg-black flex-1 mb-6">
        <p className="text-gray-700 dark:text-dark-secondary text-sm leading-relaxed line-clamp-5">
          "{testimonial.testimonial}"
        </p>
      </div>

      {/* Author Section */}
      <div className="dark:bg-black flex items-center space-x-3 mt-auto">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-green-200 dark:border-green-600"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-dark-main truncate">
            {testimonial.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}