import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  regions: string[];
  topics: string[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  regions,
  topics,
  selectedRegion,
  setSelectedRegion,
  selectedTopic,
  setSelectedTopic,
  filteredCount,
  totalCount,
  onReset,
}) => {
  const hasActiveFilters = selectedRegion !== 'TODAS' || selectedTopic !== 'TODOS';

  return (
    <div className="space-y-4 py-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 uppercase tracking-wider text-slate-600 font-semibold font-mono">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filtros Editoriales</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-600">
            Mostrando <strong className="text-emerald-700 font-semibold">{filteredCount}</strong> de{' '}
            {totalCount} análisis
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          )}
        </div>
      </div>

      {/* Region Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Por Región Geoeconómica:
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['TODAS', ...regions].map((reg) => {
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {reg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Pills */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Por Eje Temático:
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['TODOS', ...topics].map((top) => {
            const isSelected = selectedTopic === top;
            return (
              <button
                key={top}
                onClick={() => setSelectedTopic(top)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {top}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
