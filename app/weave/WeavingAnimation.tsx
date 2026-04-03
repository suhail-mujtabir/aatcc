'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface WeavingAnimationProps {
  pattern: number[][];
  width: number;
  height: number;
  warpColors: string[];
  weftColors: string[];
  onClose: () => void;
}

export default function WeavingAnimation({
  pattern,
  width,
  height,
  warpColors,
  weftColors,
  onClose
}: WeavingAnimationProps) {
  const { isDark } = useTheme();
  const [currentRow, setCurrentRow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per row
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentRow(prev => {
        if (prev >= height - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, height]);

  useEffect(() => {
    drawAnimation();
  }, [currentRow, pattern, warpColors, weftColors, isDark]);

  const drawAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 30;
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Background
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid and cells up to current row
    for (let row = 0; row <= currentRow; row++) {
      for (let col = 0; col < width; col++) {
        const cell = pattern[row][col];
        ctx.fillStyle = cell === 1 ? warpColors[col] : weftColors[row];
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

        // Grid lines
        ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Highlight current row
    if (currentRow < height) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, currentRow * cellSize, width * cellSize, cellSize);
    }
  };

  const handleReset = () => {
    setCurrentRow(0);
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-[90vw] max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-slate-100' : 'text-gray-900'
            }`}>
              Weaving Animation
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Watch how threads interlace row by row
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-6 overflow-auto max-h-[60vh] flex justify-center">
          <canvas ref={canvasRef} className="border rounded" />
        </div>

        {/* Controls */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentRow >= height - 1 && !isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentRow >= height - 1 && !isPlaying
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className={`text-sm font-medium ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Speed:
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {speed}ms
            </span>
          </div>

          <div className={`text-sm font-medium ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Row: {currentRow + 1} / {height}
          </div>
        </div>
      </div>
    </div>
  );
}
