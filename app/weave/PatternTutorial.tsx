'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface PatternTutorialProps {
  pattern: number[][];
  width: number;
  height: number;
  warpColors: string[];
  weftColors: string[];
  patternName: string;
  patternId?: string;
  description: string;
  customSteps?: TutorialStep[];
  onClose: () => void;
}

export type TutorialStep = {
  title: string;
  description: string;
  highlightType: 'warp' | 'weft' | 'cell' | 'cells' | 'none';
  highlightIndex?: number;
  highlightRow?: number;
  highlightCol?: number;
  highlightCells?: { row: number; col: number }[];
};

export default function PatternTutorial({
  pattern,
  width,
  height,
  warpColors,
  weftColors,
  patternName,
  patternId,
  description,
  customSteps,
  onClose
}: PatternTutorialProps) {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use custom steps if provided, otherwise use default steps
  const defaultSteps: TutorialStep[] = [
    {
      title: 'Pattern Overview',
      description: `This is the ${patternName} pattern. ${description}`,
      highlightType: 'none'
    },
    {
      title: 'Warp Threads (Vertical)',
      description: 'Warp threads run vertically. These are the foundation threads that are set up on the loom first.',
      highlightType: 'warp',
      highlightIndex: 0
    },
    {
      title: 'Weft Threads (Horizontal)',
      description: 'Weft threads run horizontally. These are woven over and under the warp threads.',
      highlightType: 'weft',
      highlightIndex: 0
    },
    {
      title: 'Thread Interlacement',
      description: 'Light squares show weft threads on top (weft color visible). Dark squares show warp threads on top (warp color visible)',
      highlightType: 'cell',
      highlightRow: 0,
      highlightCol: 0
    },
    {
      title: 'Repeating Pattern',
      description: `The ${patternName} repeats in a ${width}×${height} grid. This small unit tiles to create the full fabric.`,
      highlightType: 'none'
    }
  ];

  const steps = customSteps || defaultSteps;

  useEffect(() => {
    drawTutorial();
  }, [currentStep, pattern, warpColors, weftColors, isDark]);

  const drawTutorial = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 40;
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Background
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const step = steps[currentStep];

    // Draw all cells
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cell = pattern[row][col];
        let alpha = 1;

        // Dim non-highlighted areas
        if (step.highlightType === 'warp' && col !== step.highlightIndex) alpha = 0.3;
        if (step.highlightType === 'weft' && row !== step.highlightIndex) alpha = 0.3;
        if (step.highlightType === 'cell' && (row !== step.highlightRow || col !== step.highlightCol)) alpha = 0.3;
        if (step.highlightType === 'cells' && step.highlightCells) {
          const isInHighlightList = step.highlightCells.some(
            (c) => c.row === row && c.col === col
          );
          if (!isInHighlightList) alpha = 0.3;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = cell === 1 ? warpColors[col] : weftColors[row];
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.globalAlpha = 1;

        // Grid lines
        ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Highlight overlays
    ctx.lineWidth = 4;
    if (step.highlightType === 'warp' && step.highlightIndex !== undefined) {
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(step.highlightIndex * cellSize, 0, cellSize, height * cellSize);
      
      // Arrow and label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Warp', step.highlightIndex * cellSize + 5, -10);
    }

    if (step.highlightType === 'weft' && step.highlightIndex !== undefined) {
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(0, step.highlightIndex * cellSize, width * cellSize, cellSize);
      
      // Arrow and label
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Weft', -50, step.highlightIndex * cellSize + cellSize / 2);
    }

    if (step.highlightType === 'cell' && step.highlightRow !== undefined && step.highlightCol !== undefined) {
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(step.highlightCol * cellSize, step.highlightRow * cellSize, cellSize, cellSize);
    }

    if (step.highlightType === 'cells' && step.highlightCells) {
      ctx.strokeStyle = '#f59e0b';
      step.highlightCells.forEach((c) => {
        ctx.strokeRect(c.col * cellSize, c.row * cellSize, cellSize, cellSize);
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-[90vw] max-w-5xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden ${
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
              Pattern Tutorial: {patternName}
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Step {currentStep + 1} of {steps.length}
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
        <div className="p-6 overflow-auto max-h-[50vh] flex justify-center">
          <canvas ref={canvasRef} className="border rounded" />
        </div>

        {/* Step Content */}
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-slate-100' : 'text-gray-900'
          }`}>
            {steps[currentStep].title}
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            {steps[currentStep].description}
          </p>
        </div>

        {/* Navigation */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
        }`}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-indigo-500 w-6'
                    : isDark
                      ? 'bg-slate-600 hover:bg-slate-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === steps.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
