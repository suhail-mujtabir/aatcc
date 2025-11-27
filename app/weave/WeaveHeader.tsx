'use client';

import { useState } from 'react';
import { Grid, RotateCcw, Shuffle, Trash2, Menu, X, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface WeaveHeaderProps {
  width: number;
  height: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onInvert: () => void;
  onClear: () => void;
  onReset: () => void;
}

export default function WeaveHeader({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onInvert,
  onClear,
  onReset
}: WeaveHeaderProps) {
  const { isDark } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleIncrement = (type: 'width' | 'height') => {
    const currentValue = type === 'width' ? width : height;
    if (currentValue < 320) {
      type === 'width' ? onWidthChange(String(currentValue + 1)) : onHeightChange(String(currentValue + 1));
    }
  };

  const handleDecrement = (type: 'width' | 'height') => {
    const currentValue = type === 'width' ? width : height;
    if (currentValue > 1) {
      type === 'width' ? onWidthChange(String(currentValue - 1)) : onHeightChange(String(currentValue - 1));
    }
  };

  return (
    <>
      {/* Header Bar - Always visible */}
      <header className={`sticky top-0 z-50 border-b px-4 py-3 flex-shrink-0 ${
        isDark 
          ? 'border-slate-800 bg-slate-900' 
          : 'border-gray-200 bg-white shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: App Title */}
          <div className="flex items-center gap-2">
            <Grid className={`w-5 h-5 ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} />
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Weave Studio
            </h1>
          </div>
          
          {/* Desktop Controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Width Input */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Width:</label>
              <input
                type="number"
                min="1"
                max="320"
                value={width}
                onChange={(e) => onWidthChange(e.target.value)}
                className={`w-14 px-2 py-0.5 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Height Input */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Height:</label>
              <input
                type="number"
                min="1"
                max="320"
                value={height}
                onChange={(e) => onHeightChange(e.target.value)}
                className={`w-14 px-2 py-0.5 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Divider */}
            <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

            {/* Action Buttons */}
            <button
              onClick={onInvert}
              className={`cursor-pointer px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Invert pattern"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invert</span>
            </button>

            <button
              onClick={onClear}
              className={`cursor-pointer px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300' 
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
              title="Clear grid"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={onReset}
              className={`cursor-pointer px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Drawer Toggle - Visible only on mobile */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`md:hidden p-2 rounded transition-colors ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Open controls"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className={`fixed top-0 right-0 bottom-0 w-64 max-w-[85vw] z-[70] shadow-2xl md:hidden transform transition-transform ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}>
            {/* Drawer Header */}
            <div className={`flex items-center justify-between px-3 py-2.5 border-b ${
              isDark ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <h2 className={`text-base font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                Controls
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className={`p-1.5 rounded transition-colors ${
                  isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-3 space-y-4 overflow-y-auto">
              {/* Width Stepper */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium block ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Width
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement('width')}
                    disabled={width <= 1}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className={`flex-1 text-center py-2 rounded-lg border font-mono text-base font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {width}
                  </div>
                  <button
                    onClick={() => handleIncrement('width')}
                    disabled={width >= 320}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Range: 1 - 320
                </p>
              </div>

              {/* Height Stepper */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium block ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Height
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement('height')}
                    disabled={height <= 1}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className={`flex-1 text-center py-2 rounded-lg border font-mono text-base font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {height}
                  </div>
                  <button
                    onClick={() => handleIncrement('height')}
                    disabled={height >= 320}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Range: 1 - 320
                </p>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}></div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onInvert();
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Invert Pattern
                </button>

                <button
                  onClick={() => {
                    onClear();
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isDark 
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800' 
                      : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Grid
                </button>

                <button
                  onClick={() => {
                    onReset();
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
