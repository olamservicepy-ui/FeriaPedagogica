import React, { useState } from 'react';
import { Globe2, BookOpen, Layers, Award, Sparkles, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'news' | 'glossary' | 'about';
  setActiveTab: (tab: 'news' | 'glossary' | 'about') => void;
  articlesCount: number;
  glossaryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  articlesCount,
  glossaryCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'news' | 'glossary' | 'about') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Institutional Brand Identity */}
          <div
            onClick={() => handleTabClick('news')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform duration-200 shadow-xs shrink-0">
              <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-emerald-700 font-bold truncate">
                  Feria Pedagógica • RRII
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5" /> Edición 2026
                </span>
              </div>
              <h1 className="text-xs sm:text-base font-semibold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors font-sans truncate">
                Observatorio de Economía Internacional
              </h1>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleTabClick('news')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'news'
                  ? 'bg-slate-100 text-emerald-800 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Análisis</span>
              <span className="inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white text-slate-600 border border-slate-200">
                {articlesCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('glossary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'glossary'
                  ? 'bg-slate-100 text-emerald-800 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Glosario A-Z</span>
              <span className="inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white text-slate-600 border border-slate-200">
                {glossaryCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('about')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'about'
                  ? 'bg-slate-100 text-emerald-800 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Institucional</span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors shadow-xs"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Light Mode) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200 text-slate-900">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 pb-1">
            Navegación Móvil
          </div>

          <button
            onClick={() => handleTabClick('news')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'news'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Análisis de Economía</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white text-slate-600 border border-slate-200">
              {articlesCount} artículos
            </span>
          </button>

          <button
            onClick={() => handleTabClick('glossary')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'glossary'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Glosario Conceptual A-Z</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white text-slate-600 border border-slate-200">
              {glossaryCount} términos
            </span>
          </button>

          <button
            onClick={() => handleTabClick('about')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'about'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Institucional & Ingesta</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Feria RRII</span>
          </button>
        </div>
      )}
    </header>
  );
};
