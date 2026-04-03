'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, Download } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

type TutorialStep = {
  title: string;
  description: string;
  highlightType: 'warp' | 'weft' | 'cell' | 'cells' | 'none';
  highlightIndex?: number;
  highlightRow?: number;
  highlightCol?: number;
  highlightCells?: { row: number; col: number }[];
};

interface TutorialEditorProps {
  patternId: string;
  patternName: string;
  pattern: number[][];
  width: number;
  height: number;
  warpColors: string[];
  weftColors: string[];
  initialSteps?: TutorialStep[];
  onClose: () => void;
  onSave: (patternId: string, steps: TutorialStep[]) => void;
}

export default function TutorialEditor({
  patternId,
  patternName,
  pattern,
  width,
  height,
  warpColors,
  weftColors,
  initialSteps,
  onClose,
  onSave
}: TutorialEditorProps) {
  const { isDark } = useTheme();
  const [steps, setSteps] = useState<TutorialStep[]>(
    initialSteps || [
      {
        title: 'Pattern Overview',
        description: `This is the ${patternName} pattern.`,
        highlightType: 'none'
      }
    ]
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    drawCanvas();
  }, [currentStepIndex, steps, pattern, warpColors, weftColors, isDark]);

  const drawCanvas = () => {
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

    // Draw cells
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cell = pattern[row][col];
        
        // Determine if this cell should be highlighted
        let isHighlighted = false;
        if (currentStep.highlightType === 'warp' && col === currentStep.highlightIndex) {
          isHighlighted = true;
        } else if (currentStep.highlightType === 'weft' && row === currentStep.highlightIndex) {
          isHighlighted = true;
        } else if (currentStep.highlightType === 'cell' && row === currentStep.highlightRow && col === currentStep.highlightCol) {
          isHighlighted = true;
        } else if (currentStep.highlightType === 'cells' && currentStep.highlightCells) {
          isHighlighted = currentStep.highlightCells.some(
            (c) => c.row === row && c.col === col
          );
        }

        ctx.globalAlpha = isHighlighted ? 1 : 0.3;
        ctx.fillStyle = cell === 1 ? warpColors[col] : weftColors[row];
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.globalAlpha = 1;

        // Grid lines
        ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Draw highlight borders
    ctx.lineWidth = 3;
    if (currentStep.highlightType === 'warp' && currentStep.highlightIndex !== undefined) {
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(currentStep.highlightIndex * cellSize, 0, cellSize, height * cellSize);
    } else if (currentStep.highlightType === 'weft' && currentStep.highlightIndex !== undefined) {
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(0, currentStep.highlightIndex * cellSize, width * cellSize, cellSize);
    } else if (currentStep.highlightType === 'cell' && currentStep.highlightRow !== undefined && currentStep.highlightCol !== undefined) {
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(currentStep.highlightCol * cellSize, currentStep.highlightRow * cellSize, cellSize, cellSize);
    } else if (currentStep.highlightType === 'cells' && currentStep.highlightCells) {
      ctx.strokeStyle = '#f59e0b';
      currentStep.highlightCells.forEach((c) => {
        ctx.strokeRect(c.col * cellSize, c.row * cellSize, cellSize, cellSize);
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = 30;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (col >= width || row >= height || col < 0 || row < 0) return;

    // Update current step based on highlight type
    const updatedSteps = [...steps];
    const step = { ...updatedSteps[currentStepIndex] };

    if (step.highlightType === 'warp') {
      step.highlightIndex = col;
    } else if (step.highlightType === 'weft') {
      step.highlightIndex = row;
    } else if (step.highlightType === 'cell') {
      step.highlightRow = row;
      step.highlightCol = col;
    } else if (step.highlightType === 'cells') {
      if (!step.highlightCells) step.highlightCells = [];
      
      // Toggle cell
      const existingIndex = step.highlightCells.findIndex(
        (c) => c.row === row && c.col === col
      );
      
      if (existingIndex >= 0) {
        step.highlightCells.splice(existingIndex, 1);
      } else {
        step.highlightCells.push({ row, col });
      }
    }

    updatedSteps[currentStepIndex] = step;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        title: 'New Step',
        description: 'Step description...',
        highlightType: 'none'
      }
    ]);
    setCurrentStepIndex(steps.length);
  };

  const deleteStep = (index: number) => {
    if (steps.length === 1) return; // Keep at least one step
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    if (currentStepIndex >= newSteps.length) {
      setCurrentStepIndex(newSteps.length - 1);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
    setCurrentStepIndex(targetIndex);
  };

  const updateStep = (field: keyof TutorialStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      [field]: value
    };
    
    // Clear incompatible highlight data when type changes
    if (field === 'highlightType') {
      delete updatedSteps[currentStepIndex].highlightIndex;
      delete updatedSteps[currentStepIndex].highlightRow;
      delete updatedSteps[currentStepIndex].highlightCol;
      delete updatedSteps[currentStepIndex].highlightCells;
    }
    
    setSteps(updatedSteps);
  };

  const handleSave = () => {
    onSave(patternId, steps);
  };

  const handleExport = () => {
    const data = {
      [patternId]: {
        steps: steps
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutorial-${patternId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-[95vw] max-w-7xl max-h-[95vh] rounded-lg shadow-2xl overflow-hidden ${
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
              Tutorial Editor: {patternName}
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {steps.length} step{steps.length !== 1 ? 's' : ''} • Click canvas to set highlights
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Tutorial
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Left: Step List */}
          <div className={`w-64 border-r overflow-y-auto ${
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="p-4">
              <button
                onClick={addStep}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
            
            <div className="space-y-1 px-2 pb-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    index === currentStepIndex
                      ? isDark
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500 text-white'
                      : isDark
                        ? 'hover:bg-slate-700 text-slate-300'
                        : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {index + 1}. {step.title}
                    </div>
                    <div className={`text-xs ${
                      index === currentStepIndex
                        ? 'text-indigo-100'
                        : isDark
                          ? 'text-slate-400'
                          : 'text-gray-500'
                    }`}>
                      {step.highlightType}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStep(index, 'up');
                      }}
                      disabled={index === 0}
                      className={`p-0.5 rounded ${
                        index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/10'
                      }`}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStep(index, 'down');
                      }}
                      disabled={index === steps.length - 1}
                      className={`p-0.5 rounded ${
                        index === steps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/10'
                      }`}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStep(index);
                    }}
                    disabled={steps.length === 1}
                    className={`p-1 rounded ${
                      steps.length === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-600 text-red-400 hover:text-white'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Canvas Preview */}
          <div className="flex-1 p-6 overflow-auto flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`border-2 rounded cursor-crosshair ${
                isDark ? 'border-slate-600' : 'border-gray-300'
              }`}
              style={{ imageRendering: 'pixelated' }}
            />
            <p className={`mt-4 text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Click cells to set highlight ({currentStep.highlightType})
            </p>
          </div>

          {/* Right: Step Editor */}
          <div className={`w-80 border-l overflow-y-auto ${
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Step Title
                </label>
                <input
                  type="text"
                  value={currentStep.title}
                  onChange={(e) => updateStep('title', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={currentStep.description}
                  onChange={(e) => updateStep('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Highlight Type
                </label>
                <select
                  value={currentStep.highlightType}
                  onChange={(e) => updateStep('highlightType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="none">None</option>
                  <option value="warp">Warp Column (Blue)</option>
                  <option value="weft">Weft Row (Green)</option>
                  <option value="cell">Single Cell (Orange)</option>
                  <option value="cells">Multiple Cells (Orange)</option>
                </select>
              </div>

              {currentStep.highlightType === 'cells' && currentStep.highlightCells && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Selected Cells ({currentStep.highlightCells.length})
                  </label>
                  <div className={`max-h-40 overflow-y-auto p-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  }`}>
                    {currentStep.highlightCells.length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Click canvas cells to add
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {currentStep.highlightCells.map((cell, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 text-xs rounded ${
                              isDark ? 'bg-slate-600 text-slate-200' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ({cell.row}, {cell.col})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateStep('highlightCells', [])}
                    className={`mt-2 w-full px-3 py-1 text-sm rounded-lg ${
                      isDark
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    Clear All Cells
                  </button>
                </div>
              )}

              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'
              }`}>
                <p className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <strong>Tips:</strong><br />
                  • Click canvas cells to set highlights<br />
                  • Use 'cells' type for complex patterns<br />
                  • Reorder steps with up/down arrows<br />
                  • Save exports to tutorials.json
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
