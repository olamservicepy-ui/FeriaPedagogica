import React, { useState } from 'react';
import {
  Globe2,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'news' | 'glossary' | 'about' | 'admin' | 'login';
  setActiveTab: (tab: 'news' | 'glossary' | 'about' | 'admin' | 'login') => void;
  articlesCount: number;
  glossaryCount: number;
  onOpenAIAssistant?: () => void;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  articlesCount,
  glossaryCount,
  onOpenAIAssistant,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'news' | 'glossary' | 'about' | 'admin' | 'login') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md text-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Institutional Brand Identity */}
          <div
            onClick={() => handleTabClick('news')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50/90 backdrop-blur-sm border border-emerald-200/60 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)] shrink-0">
              <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-emerald-700 font-bold truncate">
                  Feria Pedagógica • RRII
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[9px] font-mono font-medium bg-emerald-50/90 backdrop-blur-sm text-emerald-800 border border-emerald-200/60">
                  <Sparkles className="w-2.5 h-2.5" /> Edición 2026
                </span>
              </div>
              <h1 className="text-xs sm:text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors font-sans truncate">
                Observatorio de Economía Internacional
              </h1>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => handleTabClick('news')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-slate-100/90 backdrop-blur-sm text-emerald-950 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Análisis</span>
              <span className="inline-flex px-2 py-0.5 rounded-xl text-[10px] font-mono bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {articlesCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('glossary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer ${
                activeTab === 'glossary'
                  ? 'bg-slate-100/90 backdrop-blur-sm text-emerald-950 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Glosario A-Z</span>
              <span className="inline-flex px-2 py-0.5 rounded-xl text-[10px] font-mono bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {glossaryCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('about')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-slate-100/90 backdrop-blur-sm text-emerald-950 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Institucional</span>
            </button>

            {/* AI Assistant Button */}
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={onOpenAIAssistant}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                title="Consultar al Asistente Académico IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Asistente IA</span>
              </button>
            )}

            {/* Admin / Moderation Button */}
            <button
              onClick={() => handleTabClick('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out cursor-pointer ml-1 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : isAdminLoggedIn
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80'
              }`}
              title={isAdminLoggedIn ? 'Panel de Moderación (Sesión Activa)' : 'Ingreso de Administrador / Moderador'}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isAdminLoggedIn ? 'Panel Admin' : 'Admin'}</span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Frosted Glass) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-slate-900">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 pb-1">
            Navegación Móvil
          </div>

          <button
            onClick={() => handleTabClick('news')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === 'news'
                ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Análisis de Economía</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono bg-white/80 text-slate-600 border border-slate-200/40">
              {articlesCount} artículos
            </span>
          </button>

          <button
            onClick={() => handleTabClick('glossary')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === 'glossary'
                ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Glosario Conceptual A-Z</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono bg-white/80 text-slate-600 border border-slate-200/40">
              {glossaryCount} términos
            </span>
          </button>

          <button
            onClick={() => handleTabClick('about')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === 'about'
                ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Acerca de la Feria</span>
            </div>
            <span className="text-xs text-slate-400">Edición 2026</span>
          </button>

          {onOpenAIAssistant && (
            <button
              onClick={() => {
                onOpenAIAssistant();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out bg-emerald-50/90 text-emerald-900 border border-emerald-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Asistente Académico IA</span>
              </div>
            </button>
          )}

          <button
            onClick={() => handleTabClick('admin')}
            className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isAdminLoggedIn ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
              <span>{isAdminLoggedIn ? 'Panel de Moderación (Admin)' : 'Ingreso Administrador'}</span>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
              {isAdminLoggedIn ? 'Activo' : 'Acceso'}
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
