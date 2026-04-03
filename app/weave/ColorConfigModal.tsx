'use client';

import { X, Move } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useState, useRef, useEffect } from 'react';

interface ColorConfigModalProps {
  colorDialog: {
    type: 'warp' | 'weft';
    index: number;
  };
  width: number;
  height: number;
  dialogColor: string;
  dialogTab: 'uniform' | 'segment';
  firstThread: number;
  lastThread: number;
  onClose: () => void;
  onColorChange: (color: string) => void;
  onTabChange: (tab: 'uniform' | 'segment') => void;
  onFirstThreadChange: (thread: number) => void;
  onLastThreadChange: (thread: number) => void;
  onApplyUniform: () => void;
  onApplySegment: () => void;
  previewColors: {warp: string[], weft: string[]};
  onPreviewUpdate: (colors: {warp: string[], weft: string[]}) => void;
}

export default function ColorConfigModal({
  colorDialog,
  width,
  height,
  dialogColor,
  dialogTab,
  firstThread,
  lastThread,
  onClose,
  onColorChange,
  onTabChange,
  onFirstThreadChange,
  onLastThreadChange,
  onApplyUniform,
  onApplySegment,
  previewColors,
  onPreviewUpdate
}: ColorConfigModalProps) {
  const { isDark } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Center modal initially
  useEffect(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, []);

  // Live preview effect
  useEffect(() => {
    const maxThreads = colorDialog.type === 'warp' ? width : height;
    const start = Math.max(1, Math.min(firstThread, maxThreads));
    const end = Math.max(start, Math.min(lastThread, maxThreads));

    if (dialogTab === 'segment') {
      const newColors = colorDialog.type === 'warp' 
        ? { warp: [...previewColors.warp], weft: previewColors.weft }
        : { warp: previewColors.warp, weft: [...previewColors.weft] };

      const targetArray = colorDialog.type === 'warp' ? newColors.warp : newColors.weft;
      
      for (let i = start - 1; i < end; i++) {
        targetArray[i] = dialogColor;
      }

      onPreviewUpdate(newColors);
    }
  }, [dialogColor, firstThread, lastThread, dialogTab]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const maxThreads = colorDialog.type === 'warp' ? width : height;
  const clampedFirst = Math.max(1, Math.min(firstThread, maxThreads));
  const clampedLast = Math.max(clampedFirst, Math.min(lastThread, maxThreads));
  const showClampWarning = firstThread !== clampedFirst || lastThread !== clampedLast;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        className={`rounded-xl border shadow-2xl w-full max-w-md ${
          isDark 
            ? 'bg-slate-900 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Header with drag handle */}
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Move className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <h2 className={`text-lg font-semibold ${
              isDark ? 'text-slate-100' : 'text-gray-900'
            }`}>
              Configure {colorDialog.type === 'warp' ? 'Warp' : 'Weft'} Color
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDark 
                ? 'hover:bg-slate-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={() => onTabChange('uniform')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              dialogTab === 'uniform'
                ? isDark
                  ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                  : 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Uniform
          </button>
          <button
            onClick={() => onTabChange('segment')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              dialogTab === 'segment'
                ? isDark
                  ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                  : 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Segment
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {dialogTab === 'uniform' ? (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Choose Color
                </label>
                <input
                  type="color"
                  value={dialogColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className={`w-full h-12 rounded cursor-pointer border ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <button
                onClick={onApplyUniform}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition-colors"
              >
                Set Entire {colorDialog.type === 'warp' ? 'Warp' : 'Weft'} to this Color
              </button>
            </>
          ) : (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  First Thread
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxThreads}
                  value={firstThread}
                  onChange={(e) => onFirstThreadChange(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Thread: 1 to {maxThreads}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Last Thread
                </label>
                <input
                  type="number"
                  min={clampedFirst}
                  max={maxThreads}
                  value={lastThread}
                  onChange={(e) => onLastThreadChange(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Thread: {clampedFirst} to {maxThreads}
                </p>
              </div>
              {showClampWarning && (
                <div className={`text-xs p-2 rounded ${
                  isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Range adjusted: {clampedFirst} to {clampedLast} (max {maxThreads} threads)
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Choose Color
                </label>
                <input
                  type="color"
                  value={dialogColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className={`w-full h-12 rounded cursor-pointer border ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <button
                onClick={onApplySegment}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition-colors"
              >
                Apply to Segment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
