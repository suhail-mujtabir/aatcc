// components/home/TestimonialCard.tsx
"use client";

interface Testimonial {
  id: number;
  name: string;
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
      className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 min-w-[260px] sm:min-w-[280px] md:min-w-[320px] max-w-[300px] sm:max-w-[340px] md:max-w-[380px] mx-2 sm:mx-3 md:mx-4 flex flex-col h-auto"
    >
      {/* Testimonial Text */}
      <div className="dark:bg-black flex-1 mb-4 md:mb-6">
        <p className="text-gray-700 dark:text-dark-secondary text-xs sm:text-sm md:text-sm leading-relaxed line-clamp-4 md:line-clamp-5">
          "{testimonial.testimonial}"
        </p>
      </div>

      {/* Author Section */}
      <div className="dark:bg-black flex items-center space-x-2 sm:space-x-3 mt-auto">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-green-200 dark:border-green-600"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-dark-main truncate">
            {testimonial.name}
          </p>
        </div>
      </div>
    </div>
  );

}