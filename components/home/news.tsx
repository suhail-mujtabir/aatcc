// components/home/news.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import CardSwap, { Card } from '../CardSwap';
import TextReveal, { TextFadeIn } from '../Textreveal';

const newsData = [
  {
    id: 1,
    title: '🧵 Texposium 1.0: Showcasing Student Innovation in Textiles',
    content: `The AATCC AUST Student Chapter hosted Texposium 1.0, 
    a vibrant poster presentation where ten teams shared creative ideas on textile science, 
    sustainability, and design. Supported by Techno Colour Craft Ltd. and MTM Intending, 
    the event celebrated innovation, teamwork, and the bright future of Bangladesh\'s textile industry.`,
    img: 'https://textiletoday.com.bd/storage/uploads/2025/9/2679LlokWwl6o7DTDjc2.png',
    link: 'https://textiletoday.com.bd/aust-student-chapter-hosts-texposium-showcase-textile-ingenuity'
  },
  {
    id: 2,
    title: '🧶 Texposium 1.0: A stage where textile meets Brilliance',
    content: `The AATCC AUST Student Chapter hosted TexPosium 1.0, 
    a vibrant poster presentation showcasing student creativity and research in textiles. 
    Ten teams presented innovative ideas on sustainability, design, and textile science, 
    with top performers receiving BDT 3,000 in prizes. The event fostered dialogue between students and experts, 
    celebrating teamwork, innovation, and the bright future of Bangladesh’s textile industry.`,
    img: 'https://textilefocus.com/wp-content/uploads/2025/09/f1c7e447-1895-4587-83b3-e67c93c74923.jpg',
    link: 'https://textilefocus.com/texposium-1-0-where-textile-meets-brilliance'
  },
  {
    id: 3,
    title: '🎤 AATCC AUST Partners with Textile Focus for INSPIRATION!',
    content: `We’re excited to announce our Club Partner, the AATCC–AUST Student Chapter, 
    for Textile Focus’s Public Speaking Session — INSPIRATION! 🌟 Their collaboration highlights a shared commitment to empowering voices, 
    fostering dialogue, and inspiring the textile community. Stay tuned for event highlights and stories that motivate, 
    connect, and spark creativity! `,
    img: 'https://imglink.io/i/9ebcdda2-42a5-49f6-851d-f4531e46dcd8.jpg',
    link: 'https://www.facebook.com/photo/?fbid=1134215405589614&set=gm.3301847689983890&idorvanity=3272361916265801'
  },
];

export default function News() {
  const [currentCardId, setCurrentCardId] = useState(newsData[0].id);
  const [animationKey, setAnimationKey] = useState(0);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Trigger initial animation on mount
  useEffect(() => {
    setAnimationKey(1);
  }, []);

  // Poll to check which card is on top using data-card-id attribute
  useEffect(() => {
    const checkTopCard = () => {
      // Query all Card elements with data-card-id in the DOM
      const cardElements = document.querySelectorAll('[data-card-id]');
      
      let maxZIndex = -Infinity;
      let topCardId = newsData[0].id;

      cardElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const zIndexStr = computedStyle.zIndex;
        const zIndex = zIndexStr === 'auto' ? 0 : parseInt(zIndexStr);
        const cardIdAttr = element.getAttribute('data-card-id');
        const cardId = cardIdAttr ? parseInt(cardIdAttr) : 0;
        
        if (zIndex > maxZIndex) {
          maxZIndex = zIndex;
          topCardId = cardId;
        }
      });

      if (topCardId !== currentCardId && topCardId !== 0) {
        setCurrentCardId(topCardId);
        setAnimationKey((prev) => prev + 1);
      }
    };

    // Check every 100ms for card changes
    const interval = setInterval(checkTopCard, 100);
    
    // Also check immediately after a delay
    setTimeout(checkTopCard, 1000);
    
    return () => clearInterval(interval);
  }, [currentCardId]);

  const currentNews = newsData.find(item => item.id === currentCardId) || newsData[0];

  return (
    <section id="news" className="relative bg-white dark:bg-black px-6 overflow-hidden min-h-screen">
      <div className="w-full h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-12">
          {/* Left side - Text content with TextReveal */}
          <div className="z-10 space-y-6">
            <h2 className="text-4xl font-bold text-left mb-12 dark:text-white">
              Latest News
            </h2>
            
            {/* News Title - Fade In */}
            <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              <TextFadeIn trigger={animationKey} duration={2} delay={10}>
                {currentNews.title}
              </TextFadeIn>
            </div>
            
            {/* News Content - Character Reveal */}
            <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              <TextReveal trigger={animationKey} duration={1} delay={200}>
                {currentNews.content}
              </TextReveal>
            </div>
            
            {/* Read More Link */}
            <a
              href={currentNews.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-80 transition-opacity"
            >
              Read Full Article →
            </a>
          </div>

          {/* Right side - Card stack */}
          <div className="relative h-[700px] lg:h-[500px]">
            <div className="absolute bottom-0 right-0 w-full h-[500px]">
              <CardSwap
                cardDistance={60}
                verticalDistance={95}
                delay={4500}
                pauseOnHover={false}
                skewAmount={12}
                easing='elastic'
              >
                {newsData.map((item) => (
                  <Card 
                    key={item.id} 
                    data-card-id={item.id}
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full cursor-pointer"
                    >
                      <div 
                        ref={(el) => {
                          if (el && el.parentElement) {
                            // Set data-card-id on the parent element (Card component)
                            el.parentElement.setAttribute('data-card-id', String(item.id));
                            cardRefs.current.set(item.id, el.parentElement as HTMLDivElement);
                          }
                        }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-[1.02] transition-transform"
                      >
                        {/* Header bar with title */}
                        <div className="bg-gray-900 dark:bg-white px-6 py-4 border-b border-gray-700 dark:border-gray-300">
                          <h3 className="text-white dark:text-black font-semibold text-sm truncate">
                            {item.title}
                          </h3>
                        </div>
                        
                        {/* Image */}
                        <div className="flex-1 relative overflow-hidden">
                          <img
                            src={item.img}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </a>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}