import React from 'react';
import { gsap } from 'gsap';


const menuItemHeight = 100; // Fixed height for each menu item in pixels


export type ComponentKey = string;

interface MenuItemProps {
  text: string;
  image1: string;
  image2: string;
  componentKey: ComponentKey;
  isExpanded: boolean;
  content: React.ReactNode;
  onItemClick: (componentKey: ComponentKey) => void;
  index: number;          
  totalItems: number; 
}

interface FlowingMenuProps {
  items?: Omit<MenuItemProps, 'isExpanded' | 'onItemClick' | 'content' | 'index' | 'totalItems'>[];
  expandedKey: ComponentKey | null;
  onItemClick: (componentKey: ComponentKey) => void;
  children?: React.ReactNode;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({ 
  items = [], 
  expandedKey, 
  onItemClick,
  children 
}) => {
  return (
    <div className="w-full h-full overflow-hidden">
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem 
            key={idx} 
            {...item} 
            isExpanded={expandedKey === item.componentKey}
            onItemClick={onItemClick}
            content={children}
            index={idx}
            totalItems={items.length}
          />
        ))}
      </nav>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ 
  text, 
  image1, 
  image2,
  componentKey,
  isExpanded,
  content,
  onItemClick,
  index,
  totalItems

}) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults = { duration: 0.6, ease: 'power2.inOut' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const handleClick = () => {
    onItemClick(componentKey);
  };

  // Animate content expand/collapse
  React.useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        gsap.to(contentRef.current, {
          height: 'auto',
          duration: 0.8,
          ease: 'power2.out'
        });
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          duration: 0.8,
          ease: 'power2.in'
          
        });
      }
    }
  }, [isExpanded]);

 const repeatedMarqueeContent = React.useMemo(() => {
  const content = [];
  
  for (let i = 0; i < 16; i++) { // Double the items for duplication
    content.push(
      <React.Fragment key={i}>
        <div className="w-[58.041px] h-[35.795px] flex-shrink-0 flex items-center justify-center">
  <img 
    src={i % 2 === 0 ? image1 : image2}
    alt=""
    className="max-w-full max-h-full object-contain"
  />
</div>
        <span className="dark:text-black text-white uppercase font-normal text-[4vh] leading-[1.2] px-[2vw] py-[1vh] flex items-center whitespace-nowrap">
          {text}
        </span>
      </React.Fragment>
    );
  }
  
  return content;
}, [text, image1, image2]);

  return (
    <>
      {/* Menu Item with consistent height */}
      <div 
        className={`flex-1 relative overflow-hidden text-center flex items-center justify-center ${index !== totalItems - 1 ? 'border-b border-black dark:border-white' : ''  }`}
        style={{minHeight: `${menuItemHeight}px`}}
        ref={itemRef}
      >
        {/* Default state - visible text */}
        <div
          className="flex items-center justify-center w-full h-full relative cursor-pointer uppercase no-underline font-semibold text-black dark:text-white text-[4vh] bg-white dark:bg-black! transition-colors duration-200"
          style={{minHeight: `${menuItemHeight}px`}}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {text}
        </div>
        
        {/* Hover overlay - marquee effect */}
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-black dark:bg-white -translate-y-full dark:text-gray-950!"
          ref={marqueeRef}
        >
          <div className="h-full w-max flex" ref={marqueeInnerRef}>
            <div 
              className="flex items-center h-full animate-marquee"
              style={{ 
                animation: 'marquee 15s linear infinite',
                width: 'max-content'
              }}
            >
              {repeatedMarqueeContent}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content that expands directly below the menu item */}
      <div
        ref={contentRef}
        className="overflow-hidden bg-gray-100 dark:bg-black! border-gray-300 dark:border-gray-600"
        style={{ height: 0 }}
      >
        <div className="p-8">
          {content}
        </div>
      </div>
    </>
  );
};

export default FlowingMenu;