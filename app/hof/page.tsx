'use client';
import { useState } from 'react';
import FlowingMenu, { ComponentKey } from '@/components/flowingMenu';
import Spr24 from './Spring24';
import HallOfFame from './hof';
import Fall24 from './Fall2024'
// Component mapping
const components = {
  'fall2023': <HallOfFame />,
  'fall2024': <Fall24 />,
  'spring2024': <Spr24 />,
} as const;

type AppComponentKey = keyof typeof components;
const svgImg=`/aatcc.svg`;
const AustImg=`https://www.aust.edu/images/aust_logo.svg`;
const menuItems = [
  { 
    text: 'Fall 2023', 
    image1: svgImg,
    image2: AustImg,
    componentKey: 'fall2023'
  },
  { 
    text: 'Spring 2024', 
    image1: svgImg,
    image2: AustImg,
    componentKey: 'spring2024'
  },
  { 
    text: 'Fall 2024', 
    image1: svgImg,
    image2: AustImg,
    componentKey: 'fall2024'
  },
  
];

export default function HofPage() {
  const [expandedKey, setExpandedKey] = useState<AppComponentKey | null>(null);
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode>(null);

  const handleItemClick = (componentKey: ComponentKey) => {
    if (componentKey in components) {
      const validKey = componentKey as AppComponentKey;
      
      // Toggle expand/collapse
      if (expandedKey === validKey) {
        setExpandedKey(null); // Collapse if same item clicked
        // Keep the component rendered until animation completes
        setTimeout(() => setRenderedComponent(null), 800); // Match your close duration
      } else {
        setExpandedKey(validKey); // Expand new item
        setRenderedComponent(components[validKey]);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black! transition-colors duration-300 py-10">
      <div className="mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8 text-black dark:text-white">
          Hall of Fame
        </h1>
        
        {/* Menu Section with fixed height container */}
        <div className="rounded-lg overflow-hidden">
          <FlowingMenu 
            items={menuItems} 
            expandedKey={expandedKey}
            onItemClick={handleItemClick}
          >
            {renderedComponent}
          </FlowingMenu>
        </div>
        
        {/* Rest of the page content can go here */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
          </p>
        </div>
      </div>
    </div>
  );
}