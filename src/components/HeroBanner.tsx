import React from 'react';
import { Search, Compass, Globe, X } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  articlesCount: number;
  glossaryCount: number;
  regionsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  articlesCount,
  glossaryCount,
  regionsCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-12 sm:pb-14 md:pt-16 md:pb-16 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8F9FA] to-[#F8F9FA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 relative">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-xs max-w-full">
          <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate font-sans">Feria Pedagógica Universitaria de Relaciones Internacionales</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight font-sans leading-tight break-words">
            Análisis de Economía Internacional & Geopolítica Global
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Plataforma de divulgación académica y pensamiento estratégico elaborada por estudiantes. Investigaciones coyunturales, perspectiva de relaciones internacionales y glosario conceptual interactivo.
          </p>
        </div>

        {/* Real-time Search Input */}
        <div className="max-w-2xl mx-auto relative pt-1 sm:pt-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4.5 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema, país, autor (ej: 'BRICS', 'litio', 'Mercosur')..."
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all text-xs sm:text-base shadow-sm font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Statistics Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-4 text-xs sm:text-sm text-slate-600 font-sans">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-900 font-bold">{articlesCount}</span>
            <span>Artículos</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-900 font-bold">{glossaryCount}</span>
            <span>Términos conceptuales</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-900 font-bold">{regionsCount}</span>
            <span>Regiones geoeconómicas</span>
          </div>
        </div>
      </div>
    </section>
  );
};
