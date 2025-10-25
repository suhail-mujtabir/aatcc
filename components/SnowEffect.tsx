'use client';

import { useEffect, useRef, createContext, useContext, useState, ReactNode } from 'react';

interface Snowflake {
  x: number;
  y: number;
  r: number;
  n: number;
}

// Snow effect component
const SnowEffect = ({ snowflakeCount = 100 }: { snowflakeCount?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const snowflakesRef = useRef<Snowflake[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize canvas
    resizeCanvas();

    // Initialize snowflakes
    snowflakesRef.current = [];
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 4 + 1,
        n: Math.random() * 70
      });
    }

    let angle = 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set snowflake style
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
      
      // Draw snowflakes
      ctx.beginPath();
      snowflakesRef.current.forEach(flake => {
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      });
      ctx.fill();

      // Update snowflakes position
      angle += 0.01;
      snowflakesRef.current.forEach((flake, index) => {
        flake.y += Math.cos(angle + flake.n) + flake.r / 2;
        flake.x += Math.sin(angle) * 2;

        // Reset snowflake if it goes out of bounds
        if (flake.x > canvas.width + 5 || flake.x < -5 || flake.y > canvas.height) {
          if (index % 3 > 0) {
            // Fall from top
            snowflakesRef.current[index] = {
              x: Math.random() * canvas.width,
              y: -10,
              r: flake.r,
              n: flake.n
            };
          } else {
            // Come from sides based on sine wave
            if (Math.sin(angle) > 0) {
              snowflakesRef.current[index] = {
                x: -5,
                y: Math.random() * canvas.height,
                r: flake.r,
                n: flake.n
              };
            } else {
              snowflakesRef.current[index] = {
                x: canvas.width + 5,
                y: Math.random() * canvas.height,
                r: flake.r,
                n: flake.n
              };
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [snowflakeCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-[1000] snow-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  );
};

// Context for conditional snow (optional)
interface SnowContextType {
  showSnow: boolean;
  setShowSnow: (show: boolean) => void;
}

const SnowContext = createContext<SnowContextType | undefined>(undefined);

interface SnowProviderProps {
  children: ReactNode;
}

export function SnowProvider({ children }: SnowProviderProps) {
  const [showSnow, setShowSnow] = useState(true);

  return (
    <SnowContext.Provider value={{ showSnow, setShowSnow }}>
      {showSnow && <SnowEffect snowflakeCount={70} />}
      {children}
    </SnowContext.Provider>
  );
}

export const useSnow = () => {
  const context = useContext(SnowContext);
  if (context === undefined) {
    throw new Error('useSnow must be used within a SnowProvider');
  }
  return context;
};

export default SnowEffect;