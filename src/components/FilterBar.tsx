// src/components/FilterBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, RotateCcw, Check, User, Globe, Tag } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cantidad de filtros aplicados
  const activeFiltersCount =
    (selectedRegion !== 'TODAS' ? 1 : 0) +
    (selectedTopic !== 'TODOS' ? 1 : 0) +
    (selectedAuthor !== 'TODOS' ? 1 : 0);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex items-center justify-between py-3 border-y border-white/10 bg-black" ref={dropdownRef}>
      
      {/* Botón Principal del Desplegable */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
            isOpen || activeFiltersCount > 0
              ? 'bg-[#004F8A] text-white border-sky-500/50 shadow-[0_0_15px_rgba(0,158,219,0.25)]'
              : 'bg-zinc-900/90 text-slate-200 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros Editoriales</span>
          {activeFiltersCount > 0 && (
            <span className="bg-[#009EDB] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Panel Desplegable Flotante */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[440px] bg-zinc-950 border border-white/15 shadow-2xl rounded-2xl p-5 z-50 space-y-5 text-slate-200 backdrop-blur-xl">
            
            {/* 1. Región Geoeconómica */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                <Globe className="w-3.5 h-3.5 text-[#009EDB]" />
                Región Geoeconómica
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full text-xs font-medium bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="TODAS" className="bg-zinc-900 text-slate-200">Todas las regiones</option>
                {regions.map((reg) => (
                  <option key={reg} value={reg} className="bg-zinc-900 text-slate-200">
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Eje Temático */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                <Tag className="w-3.5 h-3.5 text-[#009EDB]" />
                Eje Temático
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs font-medium bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="TODOS" className="bg-zinc-900 text-slate-200">Todos los ejes temáticos</option>
                {topics.map((top) => (
                  <option key={top} value={top} className="bg-zinc-900 text-slate-200">
                    {top}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Investigador / Alumno */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                <User className="w-3.5 h-3.5 text-[#009EDB]" />
                Investigador / Alumno
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full text-xs font-medium bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="TODOS" className="bg-zinc-900 text-slate-200">Todos los alumnos</option>
                {authors.map((auth) => (
                  <option key={auth} value={auth} className="bg-zinc-900 text-slate-200">
                    {auth}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones de acción dentro del panel */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={onReset}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar filtros
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-md"
              >
                <Check className="w-3 h-3" />
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contadores y botón de Restablecer a la derecha */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-slate-400 font-medium">
          Mostrando <strong className="text-white font-bold">{filteredCount}</strong> de {totalCount} análisis
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer
          </button>
        )}
      </div>

    </div>
  );
};

export default FilterBar;
