// components/Intro/Intro.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './Intro.module.css';

interface IntroProps {
  onAnimationComplete?: () => void;
}

export default function Intro({ onAnimationComplete }: IntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isLogoActive, setIsLogoActive] = useState(false);

  useEffect(() => {
    // Activate logo first with rotate down animation
    const logoTimer = setTimeout(() => {
      setIsLogoActive(true);
    }, 200);

    // Then activate the text after logo animation
    const activateTimer = setTimeout(() => {
      setIsActive(true);
    }, 1000);

    // Slide up and remove after 3.5 seconds total
    const slideUpTimer = setTimeout(() => {
      setIsVisible(false);
      
      // Remove from DOM after transition completes
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      }, 1500); // Match CSS transition duration
      
      return () => clearTimeout(removeTimer);
    }, 3000); // Total animation duration

    // Cleanup timers
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(activateTimer);
      clearTimeout(slideUpTimer);
    };
  }, [onAnimationComplete]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.intro} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.logoHeader}>
        {/* Logo with rotate down animation */}
        <div className={`${styles.logoContainer} ${isLogoActive ? styles.logoActive : ''}`}>
          <img 
            src="/aatcc.svg" 
            alt="Logo" 
            className={styles.logoImage}
          />
        </div>
        
        {/* Combined text container */}
        {/* <div className={`${styles.logo} ${isActive ? styles.active : ''}`}> */}
          {/* First Part - "AATCC" with fade animation */}
          {/* <span className={`${styles.anime} ${styles.firstPart}`}>
            AATCC
          </span> */}
          
          {/* Second Part - "AUST Student Chapter" with typewriter and slide-in effects */}
          <span className={`${styles.anime} ${styles.secondPart}`}>
            <span className={styles.slideInText}>
              &nbsp;AUST Student Chapter
            </span>
          </span>
        </div>
      </div>
    // </div>
  );
}