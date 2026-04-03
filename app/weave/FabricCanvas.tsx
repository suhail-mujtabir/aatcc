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
  zoom: number;
  onWheelZoom?: (e: WheelEvent) => void;
}

export default function FabricCanvas({
  grid,
  width,
  height,
  warpColors,
  weftColors,
  onCanvasClick,
  zoom,
  onWheelZoom
}: FabricCanvasProps) {
  const { isDark } = useTheme();
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const weftBarCanvasRef = useRef<HTMLCanvasElement>(null);
  const warpBarCanvasRef = useRef<HTMLCanvasElement>(null);

  const cellSize = 8;
  const colorBarSize = 20;

  // Draw the fabric pattern (zoomable area)
  const drawFabricCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Keep canvas at fixed size for performance
    const canvasWidth = 1260;
    const canvasHeight = 280;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill background
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adjust cell size based on zoom for visual scaling
    const effectiveCellSize = cellSize * (zoom / 100);
    const repeatsX = Math.ceil(canvasWidth / (width * effectiveCellSize));
    const repeatsY = Math.ceil(canvasHeight / (height * effectiveCellSize));

    // Draw Fabric Texture with adjusted cell size
    for (let tileY = 0; tileY < repeatsY; tileY++) {
      for (let tileX = 0; tileX < repeatsX; tileX++) {
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const x = (tileX * width + col) * effectiveCellSize;
            const y = (tileY * height + row) * effectiveCellSize;
            
            if (x >= canvasWidth || y >= canvasHeight) continue;
            if (!grid[row] || grid[row][col] === undefined) continue;
            
            ctx.fillStyle = grid[row][col] === 1 ? warpColors[col] : weftColors[row];
            ctx.fillRect(x, y, effectiveCellSize, effectiveCellSize);
          }
        }
      }
    }
  }, [grid, width, height, warpColors, weftColors, isDark, zoom]);

  // Draw weft color bar (left, always 100%)
  const drawWeftBar = useCallback(() => {
    const canvas = weftBarCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for performance
    canvas.width = colorBarSize;
    canvas.height = 280;

    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const effectiveCellSize = cellSize * (zoom / 100);
    const repeatsY = Math.ceil(canvas.height / (height * effectiveCellSize));

    for (let tileY = 0; tileY < repeatsY; tileY++) {
      for (let row = 0; row < height; row++) {
        const y = (tileY * height + row) * effectiveCellSize;
        if (y >= canvas.height) break;
        
        ctx.fillStyle = weftColors[row];
        ctx.fillRect(0, y, colorBarSize, effectiveCellSize);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(0, y, colorBarSize, effectiveCellSize);
      }
    }
  }, [weftColors, height, isDark, zoom]);

  // Draw warp color bar (bottom, always 100%)
  const drawWarpBar = useCallback(() => {
    const canvas = warpBarCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for performance
    canvas.width = 1280;
    canvas.height = colorBarSize;

    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const effectiveCellSize = cellSize * (zoom / 100);
    const repeatsX = Math.ceil((canvas.width - colorBarSize) / (width * effectiveCellSize));

    for (let tileX = 0; tileX < repeatsX; tileX++) {
      for (let col = 0; col < width; col++) {
        const x = colorBarSize + (tileX * width + col) * effectiveCellSize;
        if (x >= canvas.width) break;
        
        ctx.fillStyle = warpColors[col];
        ctx.fillRect(x, 0, effectiveCellSize, colorBarSize);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, 0, effectiveCellSize, colorBarSize);
      }
    }
  }, [warpColors, width, isDark, zoom]);

  useEffect(() => {
    drawFabricCanvas();
    drawWeftBar();
    drawWarpBar();
  }, [drawFabricCanvas, drawWeftBar, drawWarpBar]);

  useEffect(() => {
    drawFabricCanvas();
    drawWeftBar();
    drawWarpBar();
  }, [drawFabricCanvas, drawWeftBar, drawWarpBar]);

  // Add wheel event listener for zoom
  useEffect(() => {
    const fabricDiv = document.getElementById('fabric-canvas-container');
    if (!fabricDiv || !onWheelZoom) return;

    const handleWheel = (e: WheelEvent) => {
      onWheelZoom(e);
    };

    fabricDiv.addEventListener('wheel', handleWheel, { passive: false });
    return () => fabricDiv.removeEventListener('wheel', handleWheel);
  }, [onWheelZoom]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Create a synthetic canvas event for compatibility with existing click handler
    const target = e.currentTarget.querySelector('canvas');
    if (!target) return;
    
    const syntheticEvent = {
      ...e,
      currentTarget: target
    } as React.MouseEvent<HTMLCanvasElement>;
    
    onCanvasClick(syntheticEvent);
  };

  return (
    <div className={`flex-[0_0_60%] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
      isDark ? 'bg-slate-900' : 'bg-white'
    }`}>
      <div id="fabric-canvas-container" className="relative" style={{ display: 'inline-block' }}>
        {/* Weft Color Bar (left) */}
        <canvas
          ref={weftBarCanvasRef}
          className="absolute top-0 left-0 cursor-pointer"
          style={{ 
            zIndex: 2
          }}
          onClick={onCanvasClick}
        />
        
        {/* Fabric Pattern */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: 0,
            left: `${colorBarSize}px`,
            zIndex: 1
          }}
          onClick={handleClick}
        >
          <canvas ref={fabricCanvasRef} className="block" />
        </div>
        
        {/* Warp Color Bar (bottom) */}
        <canvas
          ref={warpBarCanvasRef}
          className="absolute left-0 cursor-pointer"
          style={{ 
            top: '280px',
            zIndex: 2
          }}
          onClick={onCanvasClick}
        />
        
        {/* Spacer to maintain layout dimensions */}
        <div style={{ 
          width: '1280px', 
          height: '300px', 
          visibility: 'hidden' 
        }} />
      </div>
    </div>
  );
}
