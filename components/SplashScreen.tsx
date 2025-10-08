// components/SplashScreen.tsx

'use client'; // This component uses client-side hooks

import { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen = ({ onAnimationComplete }: SplashScreenProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
      // Also notify the parent component to remove this from the DOM
      const removeTimer = setTimeout(onAnimationComplete, 500); // Match this with CSS animation duration
      return () => clearTimeout(removeTimer);
    }, 4500); // Total time before starting to fade out

    return () => clearTimeout(fadeOutTimer);
  }, [onAnimationComplete]);

  return (
    <div className={`${styles.splashScreen} ${isFadingOut ? styles.fadeOut : ''}`}>
      
<TypeAnimation
  sequence={[
    'AATCC',
    100, // Wait 300ms
    'AATCC AUST',
    100, // Wait 300ms
    'AATCC AUST Student',
    100, // Wait 300ms
    'AATCC AUST Student Chapter',
    500, // Hold final text
  ]}
  wrapper="h1"
  speed={40} // Slightly slower speed can feel smoother
  cursor={false}
  style={{ fontSize: '2em', display: 'inline-block' }}
/>
    </div>
  );
};

export default SplashScreen;