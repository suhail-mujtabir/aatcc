"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import ClickSpark from './clickSpark';

interface ConditionalClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: React.ReactNode;
}

const ConditionalClickSpark: React.FC<ConditionalClickSparkProps> = ({
  children,
  ...props
}) => {
  const pathname = usePathname();
  
  // Disable ClickSpark on /weave page
  if (pathname === '/weave') {
    return <>{children}</>;
  }

  return (
    <ClickSpark {...props}>
      {children}
    </ClickSpark>
  );
};

export default ConditionalClickSpark;
