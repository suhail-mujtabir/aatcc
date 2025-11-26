'use client';

import { Grid, RotateCcw, Shuffle, Trash2 } from 'lucide-react';
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

  return (
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
        
        {/* Right: Controls Row */}
        <div className="flex items-center gap-3">
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
            className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
