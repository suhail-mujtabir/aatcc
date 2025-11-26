'use client';

import { useTheme } from '@/context/ThemeContext';

interface DraftEditorProps {
  grid: number[][];
  width: number;
  warpColors: string[];
  weftColors: string[];
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

export default function DraftEditor({
  grid,
  width,
  warpColors,
  weftColors,
  onMouseDown,
  onMouseEnter
}: DraftEditorProps) {
  const { isDark } = useTheme();

  return (
    <div className={`${
      isDark ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div className="p-6 flex">
        <div 
          className="inline-grid gap-0 rounded"
          style={{ 
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            userSelect: 'none'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onMouseDown={() => onMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                className={`w-4 h-4 cursor-pointer transition-colors duration-100 border ${
                  isDark ? 'border-slate-600' : 'border-gray-400'
                }`}
                style={{
                  backgroundColor: cell === 1 ? warpColors[colIndex] : weftColors[rowIndex]
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
