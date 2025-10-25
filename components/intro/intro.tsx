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
  const [isRevealComplete, setIsRevealComplete] = useState(false);

  useEffect(() => {
    // Activate the logo after a short delay
    const activateTimer = setTimeout(() => {
      setIsActive(true);
    }, 100);

    // Set reveal complete 500ms before reveal animation finishes (around 2s instead of 2.5s)
    const revealCompleteTimer = setTimeout(() => {
      setIsRevealComplete(true);
    }, 1700);

    // Slide up and remove after 3.5 seconds total
    const slideUpTimer = setTimeout(() => {
      setIsVisible(false);
      
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      }, 1500);
      
      return () => clearTimeout(removeTimer);
    }, 3500);

    return () => {
      clearTimeout(activateTimer);
      clearTimeout(revealCompleteTimer);
      clearTimeout(slideUpTimer);
    };
  }, [onAnimationComplete]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.intro} ${!isVisible ? styles.hidden : ''}`}>
      <div className={`${styles.logoHeader} ${isRevealComplete ? styles.revealComplete : ''}`}>
        <div className={`${styles.logo} ${isActive ? styles.active : ''}`}>
          {/* First Part - "AATCC" with fade animation */}
          <span className={`${styles.anime} ${styles.firstPart}`}>
            AATCC
          </span>
          
          {/* Second Part - "AUST Student Chapter" with typewriter and slide-in effects */}
          <span className={`${styles.anime} ${styles.secondPart}`}>
            <span className={styles.slideInText}>
              AUST Student Chapter
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}