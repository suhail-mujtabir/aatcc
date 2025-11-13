"use client";
import React, { useEffect, useRef, useState } from 'react';

interface TextRevealProps {
  children: string;
  className?: string;
  duration?: number; // Total animation duration in seconds (default: 1)
  delay?: number; // delay before starting in ms (default: 0)
  trigger?: any; // Optional: external trigger to control animation instead of viewport
}

export default function TextReveal({ 
  children, 
  className = '', 
  duration = 1,
  delay = 0,
  trigger
}: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(trigger !== undefined); // Start true for manual trigger
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode 1: Manual trigger (for card sync)
  useEffect(() => {
    if (trigger !== undefined) {
      // Reset animation
      setIsVisible(false);
      // Trigger animation after a brief reset
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Mode 2: Viewport detection (original behavior)
  useEffect(() => {
    if (trigger !== undefined) return; // Skip if using manual trigger

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [trigger]);

  const chars = children.split('');
  const charDelay = duration / chars.length;

  // Prevent hydration mismatch - render plain text on server
  if (!mounted) {
    return <span ref={ref} className={className}>{children}</span>;
  }

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {chars.map((char, idx) => (
        <span
          key={idx}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.05s ease-in`,
            transitionDelay: isVisible ? `${delay / 1000 + idx * charDelay}s` : '0s'
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Alternative: Fade-in paragraph effect (whole text at once)
export function TextFadeIn({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.8,
  trigger
}: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(trigger !== undefined);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode 1: Manual trigger
  useEffect(() => {
    if (trigger !== undefined) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Mode 2: Viewport detection
  useEffect(() => {
    if (trigger !== undefined) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [trigger]);

  if (!mounted) {
    return <span ref={ref} className={className}>{children}</span>;
  }

  return (
    <span 
      ref={ref} 
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
        transitionDelay: `${delay / 1000}s`,
        display: 'inline-block'
      }}
    >
      {children}
    </span>
  );
}

// Alternative: Word-by-word reveal
export function TextRevealWords({ 
  children, 
  className = '', 
  duration = 1,
  delay = 0,
  trigger
}: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(trigger !== undefined);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const words = children.split(' ');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode 1: Manual trigger
  useEffect(() => {
    if (trigger !== undefined) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Mode 2: Viewport detection
  useEffect(() => {
    if (trigger !== undefined) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [trigger]);

  const wordDelay = duration / words.length;

  if (!mounted) {
    return <span ref={ref} className={className}>{children}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {words.map((word, idx) => (
        <span
          key={idx}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            transitionDelay: isVisible ? `${delay / 1000 + idx * wordDelay}s` : '0s',
            display: 'inline-block',
            marginRight: '0.25em'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}