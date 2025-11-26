'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import WeaveHeader from './WeaveHeader';
import FabricCanvas from './FabricCanvas';
import DraftEditor from './DraftEditor';
import ColorConfigModal from './ColorConfigModal';

export default function WeavePage() {
  const { isDark } = useTheme();
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [grid, setGrid] = useState<number[][]>(() => 
    Array(8).fill(null).map(() => Array(8).fill(0))
  );
  const [warpColors, setWarpColors] = useState<string[]>(() => 
    Array(8).fill('#000000') // Black for light mode, will update in useEffect
  );
  const [weftColors, setWeftColors] = useState<string[]>(() => 
    Array(8).fill('#ffffff') // White for light mode, will update in useEffect
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<0 | 1>(1);
  const [colorDialog, setColorDialog] = useState<{
    type: 'warp' | 'weft';
    index: number;
  } | null>(null);
  const [dialogColor, setDialogColor] = useState('#000000');
  const [dialogTab, setDialogTab] = useState<'uniform' | 'segment'>('uniform');
  const [segmentThreads, setSegmentThreads] = useState(1);
  const [segmentStartIndex, setSegmentStartIndex] = useState(0);

  // Update colors when theme changes
  useEffect(() => {
    // Update all warp colors to new theme default
    setWarpColors(prev => prev.map(() => isDark ? '#6366f1' : '#000000'));
    // Update all weft colors to new theme default
    setWeftColors(prev => prev.map(() => isDark ? '#020617' : '#ffffff'));
  }, [isDark]);

  // Initialize grid when dimensions change
  useEffect(() => {
    setGrid(prev => {
      const newGrid = Array(height).fill(null).map((_, row) =>
        Array(width).fill(null).map((_, col) => 
          prev[row]?.[col] ?? 0
        )
      );
      return newGrid;
    });

    // Resize warp colors
    setWarpColors(prev => {
      const defaultColor = isDark ? '#6366f1' : '#000000';
      const newColors = Array(width).fill(defaultColor);
      for (let i = 0; i < Math.min(width, prev.length); i++) {
        newColors[i] = prev[i];
      }
      return newColors;
    });

    // Resize weft colors
    setWeftColors(prev => {
      const defaultColor = isDark ? '#020617' : '#ffffff'; // slate-950 for dark mode
      const newColors = Array(height).fill(defaultColor);
      for (let i = 0; i < Math.min(height, prev.length); i++) {
        newColors[i] = prev[i];
      }
      return newColors;
    });
  }, [width, height, isDark]);

  const toggleCell = (row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map((r, i) => 
        i === row 
          ? r.map((c, j) => j === col ? drawMode : c)
          : [...r]
      );
      return newGrid;
    });
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    // Set draw mode based on current cell state
    setDrawMode(grid[row][col] === 0 ? 1 : 0);
    toggleCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      toggleCell(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearGrid = () => {
    setGrid(Array(height).fill(null).map(() => Array(width).fill(0)));
  };

  const invertGrid = () => {
    setGrid(prev => prev.map(row => row.map(cell => cell === 1 ? 0 : 1)));
  };

  const resetGrid = () => {
    setWidth(8);
    setHeight(8);
    setGrid(Array(8).fill(null).map(() => Array(8).fill(0)));
    setWarpColors(Array(8).fill(isDark ? '#6366f1' : '#000000'));
    setWeftColors(Array(8).fill(isDark ? '#020617' : '#ffffff')); // slate-950 for dark mode
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellSize = 8;
    const colorBarSize = 20;

    // Check if clicked in Weft Color Bar (left zone)
    if (x < colorBarSize && y < canvas.height - colorBarSize) {
      const pixelRow = Math.floor(y / cellSize);
      const index = pixelRow % height;
      setColorDialog({ type: 'weft', index });
      setDialogColor(weftColors[index]);
      setDialogTab('uniform');
      setSegmentThreads(1);
      setSegmentStartIndex(index);
      return;
    }

    // Check if clicked in Warp Color Bar (bottom zone)
    if (y >= canvas.height - colorBarSize && x >= colorBarSize) {
      const pixelCol = Math.floor((x - colorBarSize) / cellSize);
      const index = pixelCol % width;
      setColorDialog({ type: 'warp', index });
      setDialogColor(warpColors[index]);
      setDialogTab('uniform');
      setSegmentThreads(1);
      setSegmentStartIndex(index);
      return;
    }
  };

  const applyUniformColor = () => {
    if (!colorDialog) return;

    if (colorDialog.type === 'warp') {
      setWarpColors(Array(width).fill(dialogColor));
    } else {
      setWeftColors(Array(height).fill(dialogColor));
    }
    setColorDialog(null);
  };

  const applySegmentColor = () => {
    if (!colorDialog) return;

    const threads = Math.max(1, Math.min(segmentThreads, colorDialog.type === 'warp' ? width : height));

    if (colorDialog.type === 'warp') {
      setWarpColors(prev => {
        const newColors = [...prev];
        for (let i = 0; i < threads; i++) {
          const idx = (segmentStartIndex + i) % width;
          newColors[idx] = dialogColor;
        }
        return newColors;
      });
    } else {
      setWeftColors(prev => {
        const newColors = [...prev];
        for (let i = 0; i < threads; i++) {
          const idx = (segmentStartIndex + i) % height;
          newColors[idx] = dialogColor;
        }
        return newColors;
      });
    }
    setColorDialog(null);
  };

  const handleWidthChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 320) setWidth(num);
  };

  const handleHeightChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 320) setHeight(num);
  };

  // Prevent text selection while dragging
  useEffect(() => {
    const preventSelect = (e: Event) => {
      if (isDrawing) e.preventDefault();
    };
    document.addEventListener('selectstart', preventSelect);
    return () => document.removeEventListener('selectstart', preventSelect);
  }, [isDrawing]);

  return (
    <div 
      className={`min-h-screen flex flex-col ${
        isDark 
          ? 'bg-slate-950 text-slate-100' 
          : 'bg-white text-gray-900'
      }`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <WeaveHeader
        width={width}
        height={height}
        onWidthChange={handleWidthChange}
        onHeightChange={handleHeightChange}
        onInvert={invertGrid}
        onClear={clearGrid}
        onReset={resetGrid}
      />

      <FabricCanvas
        grid={grid}
        width={width}
        height={height}
        warpColors={warpColors}
        weftColors={weftColors}
        onCanvasClick={handleCanvasClick}
      />

      <DraftEditor
        grid={grid}
        width={width}
        warpColors={warpColors}
        weftColors={weftColors}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
      />

      {colorDialog && (
        <ColorConfigModal
          colorDialog={colorDialog}
          width={width}
          height={height}
          dialogColor={dialogColor}
          dialogTab={dialogTab}
          segmentThreads={segmentThreads}
          segmentStartIndex={segmentStartIndex}
          onClose={() => setColorDialog(null)}
          onColorChange={setDialogColor}
          onTabChange={setDialogTab}
          onSegmentThreadsChange={setSegmentThreads}
          onStartIndexChange={setSegmentStartIndex}
          onApplyUniform={applyUniformColor}
          onApplySegment={applySegmentColor}
        />
      )}
    </div>
  );
}
