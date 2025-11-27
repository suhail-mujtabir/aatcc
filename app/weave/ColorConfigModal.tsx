'use client';

import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ColorConfigModalProps {
  colorDialog: {
    type: 'warp' | 'weft';
    index: number;
  };
  width: number;
  height: number;
  dialogColor: string;
  dialogTab: 'uniform' | 'segment';
  segmentThreads: number;
  segmentStartIndex: number;
  onClose: () => void;
  onColorChange: (color: string) => void;
  onTabChange: (tab: 'uniform' | 'segment') => void;
  onSegmentThreadsChange: (threads: number) => void;
  onStartIndexChange: (index: number) => void;
  onApplyUniform: () => void;
  onApplySegment: () => void;
}

export default function ColorConfigModal({
  colorDialog,
  width,
  height,
  dialogColor,
  dialogTab,
  segmentThreads,
  segmentStartIndex,
  onClose,
  onColorChange,
  onTabChange,
  onSegmentThreadsChange,
  onStartIndexChange,
  onApplyUniform,
  onApplySegment
}: ColorConfigModalProps) {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl border shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-slate-900 border-slate-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Configure {colorDialog.type === 'warp' ? 'Warp' : 'Weft'} Color
          </h2>
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
                  Starting Index
                </label>
                <input
                  type="number"
                  min="0"
                  max={(colorDialog.type === 'warp' ? width : height) - 1}
                  value={segmentStartIndex}
                  onChange={(e) => onStartIndexChange(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Index: 0 to {(colorDialog.type === 'warp' ? width : height) - 1}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Number of Threads
                </label>
                <input
                  type="number"
                  min="1"
                  max={colorDialog.type === 'warp' ? width : height}
                  value={segmentThreads}
                  onChange={(e) => onSegmentThreadsChange(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
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
