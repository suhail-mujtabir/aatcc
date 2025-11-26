'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface FabricCanvasProps {
  grid: number[][];
  width: number;
  height: number;
  warpColors: string[];
  weftColors: string[];
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export default function FabricCanvas({
  grid,
  width,
  height,
  warpColors,
  weftColors,
  onCanvasClick
}: FabricCanvasProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 8;
    const colorBarSize = 20; // Size for warp/weft color bars

    // Set canvas dimensions to constant values
    canvas.width = 1280;
    canvas.height = 300;

    // Fill background based on theme
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff'; // slate-800 for dark mode background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const repeatsX = Math.ceil((canvas.width - colorBarSize) / (width * cellSize));
    const repeatsY = Math.ceil((canvas.height - colorBarSize) / (height * cellSize));

    // Draw Weft Color Bar (Left Zone - 20px wide)
    for (let tileY = 0; tileY < repeatsY; tileY++) {
      for (let row = 0; row < height; row++) {
        const y = (tileY * height + row) * cellSize;
        if (y >= canvas.height - colorBarSize) break;
        ctx.fillStyle = weftColors[row];
        ctx.fillRect(0, y, colorBarSize, cellSize);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(0, y, colorBarSize, cellSize);
      }
    }

    // Draw Warp Color Bar (Bottom Zone - 20px high)
    for (let tileX = 0; tileX < repeatsX; tileX++) {
      for (let col = 0; col < width; col++) {
        const x = colorBarSize + (tileX * width + col) * cellSize;
        if (x >= canvas.width) break;
        const y = canvas.height - colorBarSize;
        ctx.fillStyle = warpColors[col];
        ctx.fillRect(x, y, cellSize, colorBarSize);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, colorBarSize);
      }
    }

    // Draw Fabric Texture (Top-Right, Real Weaving Logic)
    for (let tileY = 0; tileY < repeatsY; tileY++) {
      for (let tileX = 0; tileX < repeatsX; tileX++) {
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const x = colorBarSize + (tileX * width + col) * cellSize;
            const y = (tileY * height + row) * cellSize;
            
            if (x >= canvas.width || y >= canvas.height - colorBarSize) continue;
            
            // Boundary check: ensure grid[row][col] exists
            if (!grid[row] || grid[row][col] === undefined) continue;
            
            // Real Weaving: 1 = Warp Up (show warp color), 0 = Weft Up (show weft color)
            ctx.fillStyle = grid[row][col] === 1 ? warpColors[col] : weftColors[row];
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }
  }, [grid, width, height, warpColors, weftColors, isDark]);

  // Redraw canvas whenever dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className={`flex-[0_0_60%] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
      isDark ? 'bg-slate-900' : 'bg-white'
    }`}>
      <canvas
        ref={canvasRef}
        className="block cursor-pointer"
        onClick={onCanvasClick}
      />
    </div>
  );
}
