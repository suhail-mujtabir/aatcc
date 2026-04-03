'use client';

import { useState, useEffect } from 'react';
import { Grid, RotateCcw, Shuffle, Trash2, Menu, X, Plus, Minus, ZoomIn, ZoomOut, Maximize2, FileText, ChevronDown, Edit2, Play, BookOpen } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { weaveTemplates, templateCategories, type WeaveTemplate } from './templates';
import WeavingAnimation from './WeavingAnimation';
import PatternTutorial, { type TutorialStep } from './PatternTutorial';
import TutorialEditor from './TutorialEditor';

interface WeaveHeaderProps {
  width: number;
  height: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onInvert: () => void;
  onClear: () => void;
  onReset: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onLoadTemplate: (template: WeaveTemplate) => void;
  onSaveTemplate?: () => void;
  onEditTemplate?: (template: WeaveTemplate) => void;
  grid: number[][];
  warpColors: string[];
  weftColors: string[];
}

export default function WeaveHeader({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onInvert,
  onClear,
  onReset,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onLoadTemplate,
  onSaveTemplate,
  onEditTemplate,
  grid,
  warpColors,
  weftColors
}: WeaveHeaderProps) {
  const { isDark } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const [showAnimation, setShowAnimation] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialEditor, setShowTutorialEditor] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<{ name: string; id: string; description: string } | null>(null);
  const [loadedTutorials, setLoadedTutorials] = useState<Record<string, { steps: TutorialStep[] }>>({});
  const isDev = process.env.NODE_ENV === 'development';

  // Load tutorials from JSON on mount
  useEffect(() => {
    fetch('/tutorials.json')
      .then(res => res.json())
      .then(data => setLoadedTutorials(data))
      .catch(err => console.error('Failed to load tutorials:', err));
  }, []);

  // Generate thumbnail for a template
  const generateThumbnail = (template: WeaveTemplate): string => {
    if (thumbnailCache[template.id]) return thumbnailCache[template.id];

    const canvas = document.createElement('canvas');
    const size = 40;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const cellWidth = size / template.width;
    const cellHeight = size / template.height;

    template.pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = cell === 1 
          ? (template.warpColor || '#6366f1')
          : (template.weftColor || '#020617');
        ctx.fillRect(
          x * cellWidth,
          y * cellHeight,
          Math.ceil(cellWidth),
          Math.ceil(cellHeight)
        );
      });
    });

    const dataUrl = canvas.toDataURL();
    setThumbnailCache(prev => ({ ...prev, [template.id]: dataUrl }));
    return dataUrl;
  };

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

            {/* Zoom Controls */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <button
                onClick={onZoomOut}
                disabled={zoom <= 25}
                className={`p-0.5 rounded transition-colors ${
                  zoom <= 25
                    ? 'opacity-30 cursor-not-allowed'
                    : isDark
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <span className={`text-xs font-medium min-w-[3rem] text-center ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {zoom}%
              </span>
              
              <button
                onClick={onZoomIn}
                disabled={zoom >= 300}
                className={`p-0.5 rounded transition-colors ${
                  zoom >= 300
                    ? 'opacity-30 cursor-not-allowed'
                    : isDark
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={onZoomReset}
                disabled={zoom === 100}
                className={`p-0.5 rounded transition-colors ${
                  zoom === 100
                    ? 'opacity-30 cursor-not-allowed'
                    : isDark
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
                title="Reset zoom (100%)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Divider */}
            <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className={`cursor-pointer px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Load template"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Templates</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isTemplateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Templates Dropdown Menu */}
              {isTemplateDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsTemplateDropdownOpen(false)}
                  />
                  
                  {/* Menu */}
                  <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg border shadow-xl z-50 max-h-[70vh] overflow-y-auto ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* Header */}
                    <div className={`sticky top-0 px-3 py-2 border-b ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                        Weave Templates
                      </h3>
                    </div>

                    {/* Template Categories */}
                    {(Object.keys(templateCategories) as Array<keyof typeof templateCategories>).map(category => {
                      const templates = weaveTemplates.filter(t => t.category === category);
                      const categoryInfo = templateCategories[category];
                      
                      return (
                        <div key={category} className={`border-b last:border-b-0 ${
                          isDark ? 'border-slate-700' : 'border-gray-200'
                        }`}>
                          <div className={`px-3 py-2 text-xs font-semibold ${
                            isDark ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {categoryInfo.icon} {categoryInfo.label}
                          </div>
                          
                          {templates.map(template => (
                            <div
                              key={template.id}
                              className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                                isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                              }`}
                            >
                              {/* Thumbnail Preview */}
                              <img 
                                src={generateThumbnail(template)} 
                                alt={template.name}
                                className={`w-10 h-10 rounded border ${
                                  isDark ? 'border-slate-700' : 'border-gray-300'
                                }`}
                                style={{ imageRendering: 'pixelated' }}
                              />
                              
                              <button
                                onClick={() => {
                                  onLoadTemplate(template);
                                  setIsTemplateDropdownOpen(false);
                                }}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-medium ${
                                        isDark ? 'text-slate-200' : 'text-gray-800'
                                      }`}>{template.name}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        template.difficulty === 'beginner'
                                          ? 'bg-green-500/20 text-green-400'
                                          : template.difficulty === 'intermediate'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-red-500/20 text-red-400'
                                      }`}>
                                        {template.difficulty}
                                      </span>
                                    </div>
                                    <p className={`text-xs mt-0.5 line-clamp-2 ${
                                      isDark ? 'text-slate-400' : 'text-gray-500'
                                    }`}>
                                      {template.description}
                                    </p>
                                  </div>
                                  <div className={`flex-shrink-0 text-[10px] px-2 py-1 rounded ${
                                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {template.width}×{template.height}
                                  </div>
                                </div>
                              </button>
                              
                              {/* Edit Button (Dev Only) */}
                              {process.env.NODE_ENV === 'development' && onEditTemplate && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTemplate(template);
                                    setIsTemplateDropdownOpen(false);
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    isDark 
                                      ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                                  }`}
                                  title="Edit template"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              
                              {/* Tutorial Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPattern({ name: template.name, id: template.id, description: template.description });
                                  onLoadTemplate(template);
                                  setIsTemplateDropdownOpen(false);
                                  setTimeout(() => setShowTutorial(true), 300);
                                }}
                                className={`p-1.5 rounded transition-colors ${
                                  isDark 
                                    ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Tutorial"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Tutorial Button (Dev Only) */}
                              {isDev && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPattern({ name: template.name, id: template.id, description: template.description });
                                    onLoadTemplate(template);
                                    setIsTemplateDropdownOpen(false);
                                    setTimeout(() => setShowTutorialEditor(true), 300);
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    isDark 
                                      ? 'hover:bg-slate-700 text-amber-400 hover:text-amber-300' 
                                      : 'hover:bg-gray-200 text-amber-600 hover:text-amber-700'
                                  }`}
                                  title="Edit Tutorial (Dev)"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
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

            {/* Animation Button */}
            <button
              onClick={() => setShowAnimation(true)}
              className={`cursor-pointer px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
              title="Show weaving animation"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Animate</span>
            </button>

            {/* Save Template Button (Dev Only) */}
            {process.env.NODE_ENV === 'development' && onSaveTemplate && (
              <button
                onClick={onSaveTemplate}
                className={`cursor-pointer px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isDark 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title="Save current canvas as template (Development only)"
              >
                💾
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
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

              {/* Zoom Controls */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium block ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Zoom
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onZoomOut}
                    disabled={zoom <= 25}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className={`flex-1 text-center py-2 rounded-lg border font-mono text-base font-semibold ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {zoom}%
                  </div>
                  <button
                    onClick={onZoomIn}
                    disabled={zoom >= 300}
                    className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-center pt-1">
                  <button
                    onClick={onZoomReset}
                    disabled={zoom === 100}
                    className={`text-[10px] px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                  >
                    Reset to 100%
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}></div>

              {/* Templates Section */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium block ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Templates
                </label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {weaveTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {/* Thumbnail Preview - Mobile */}
                      <img 
                        src={generateThumbnail(template)} 
                        alt={template.name}
                        className={`w-8 h-8 rounded border ${
                          isDark ? 'border-slate-700' : 'border-gray-300'
                        }`}
                        style={{ imageRendering: 'pixelated' }}
                      />
                      
                      <button
                        onClick={() => {
                          onLoadTemplate(template);
                          setIsDrawerOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-medium block ${
                              isDark ? 'text-slate-200' : 'text-gray-700'
                            }`}>{template.name}</span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {template.width}×{template.height} • {template.difficulty}
                            </span>
                          </div>
                        </div>
                      </button>
                      
                      {/* Edit Button (Dev Only) - Mobile */}
                      {process.env.NODE_ENV === 'development' && onEditTemplate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTemplate(template);
                            setIsDrawerOpen(false);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-slate-600 text-slate-400' 
                              : 'hover:bg-gray-200 text-gray-500'
                          }`}
                          title="Edit template"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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

                {/* Save Template Button (Dev Only) - Mobile Drawer */}
                {process.env.NODE_ENV === 'development' && onSaveTemplate && (
                  <button
                    onClick={() => {
                      onSaveTemplate();
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      isDark 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    💾 Save Template (Dev)
                  </button>
                )}

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
      
      {/* Weaving Animation Modal */}
      {showAnimation && (
        <WeavingAnimation
          pattern={grid}
          width={width}
          height={height}
          warpColors={warpColors}
          weftColors={weftColors}
          onClose={() => setShowAnimation(false)}
        />
      )}

      {/* Pattern Tutorial Modal */}
      {showTutorial && selectedPattern && (
        <PatternTutorial
          pattern={grid}
          width={width}
          height={height}
          warpColors={warpColors}
          weftColors={weftColors}
          patternName={selectedPattern.name}
          patternId={selectedPattern.id}
          description={selectedPattern.description}
          customSteps={loadedTutorials[selectedPattern.id]?.steps}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Tutorial Editor Modal (Dev Only) */}
      {showTutorialEditor && selectedPattern && isDev && (
        <TutorialEditor
          patternId={selectedPattern.id}
          patternName={selectedPattern.name}
          pattern={grid}
          width={width}
          height={height}
          warpColors={warpColors}
          weftColors={weftColors}
          initialSteps={loadedTutorials[selectedPattern.id]?.steps}
          onClose={() => setShowTutorialEditor(false)}
          onSave={async (patternId, steps) => {
            try {
              const response = await fetch('/api/tutorials/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patternId, steps })
              });
              
              if (response.ok) {
                // Update local state
                setLoadedTutorials(prev => ({
                  ...prev,
                  [patternId]: { steps }
                }));
                alert('Tutorial saved successfully!');
              } else {
                alert('Failed to save tutorial');
              }
            } catch (error) {
              console.error('Error saving tutorial:', error);
              alert('Error saving tutorial');
            }
          }}
        />
      )}
    </>
  );
}
