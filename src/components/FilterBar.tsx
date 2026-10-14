import React from 'react';
import { Filter, RotateCcw, GraduationCap, User } from 'lucide-react';

interface FilterBarProps {
  regions: string[];
  topics: string[];
  authors: string[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  selectedAuthor: string;
  setSelectedAuthor: (author: string) => void;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  regions,
  topics,
  authors,
  selectedRegion,
  setSelectedRegion,
  selectedTopic,
  setSelectedTopic,
  selectedAuthor,
  setSelectedAuthor,
  filteredCount,
  totalCount,
  onReset,
}) => {
  const hasActiveFilters =
    selectedRegion !== 'TODAS' || selectedTopic !== 'TODOS' || selectedAuthor !== 'TODOS';

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
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors font-medium cursor-pointer"
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
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-semibold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]'
                    : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700 hover:text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
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
                type="button"
                onClick={() => setSelectedTopic(top)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]'
                    : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700 hover:text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                }`}
              >
                {top}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Author Selector & Pills */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Por Alumno / Investigador:</span>
          </div>

          {/* Quick Dropdown selector for rapid author selection */}
          <div className="relative">
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              aria-label="Seleccionar autor o alumno"
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all duration-300 ease-out cursor-pointer"
            >
              <option value="TODOS">Todos los alumnos ({authors.length})</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['TODOS', ...authors].map((auth) => {
            const isSelected = selectedAuthor === auth;
            return (
              <button
                key={auth}
                type="button"
                onClick={() => setSelectedAuthor(auth)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white font-semibold shadow-[0_4px_20px_-4px_rgba(6,95,70,0.2)]'
                    : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700 hover:text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                }`}
              >
                {auth !== 'TODOS' && (
                  <User className={`w-3 h-3 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
                )}
                <span>{auth === 'TODOS' ? 'Todos los Alumnos' : auth}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
