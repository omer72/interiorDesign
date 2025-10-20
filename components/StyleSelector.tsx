
import React from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/solid';
import { DESIGN_STYLES } from '../constants';
import type { DesignStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: DesignStyle;
  onStyleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div>
      <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Choose a Style</label>
      <div className="relative">
        <PaintBrushIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          id="style"
          name="style"
          value={selectedStyle}
          onChange={onStyleChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none dark:bg-slate-700 dark:border-gray-600 dark:text-white"
        >
          {DESIGN_STYLES.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StyleSelector;