// src/components/Navbar.tsx
import React, { useState } from 'react';
import {
  Newspaper,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Lock,
  Menu,
  X,
  LogOut,
  Building2,
} from 'lucide-react';

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  articlesCount?: number;
  glossaryCount?: number;
  onOpenAIAssistant?: () => void;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeTab,
  setActiveTab,
  articlesCount,
  glossaryCount,
  onOpenAIAssistant,
  isAdminLoggedIn,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const active = currentView || activeTab || 'news';

  const handleNav = (view: string) => {
    if (view === 'asistente') {
      if (onOpenAIAssistant) {
        onOpenAIAssistant();
        setMobileMenuOpen(false);
        return;
      }
    }
    if (onNavigate) {
      onNavigate(view);
    } else if (setActiveTab) {
      setActiveTab(view);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Franja institucional superior de la Feria Pedagógica */}
      <div className="w-full bg-[#002A54] text-white py-1.5 px-4 sm:px-8 text-center border-b border-[#001D3D]">
        <p className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold">
          FERIA PEDAGÓGICA - FACULTAD DE HUMANIDADES, CIENCIAS SOCIALES Y CULTURA GUARANÍ - EDICIÓN 2026
        </p>
      </div>

      {/* 2. Barra Principal de Navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Identidad / Logotipo a la izquierda */}
        <div
          onClick={() => handleNav('news')}
          className="cursor-pointer flex items-center gap-3 select-none group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#002A54] group-hover:bg-[#004F8A] text-white flex items-center justify-center transition-colors shadow-xs">
            <Building2 className="w-5 h-5 text-[#BAE6FD]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#002A54] uppercase">
                Economía IV
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#004F8A] bg-[#009EDB]/15 px-2 py-0.5 rounded">
                2026
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">
              Observatorio de Relaciones Internacionales
            </span>
          </div>
        </div>

        {/* Enlaces de Escritorio a la derecha */}
        <nav className="hidden md:flex items-center gap-2">
          {/* 1. Investigaciones */}
          <button
            type="button"
            onClick={() => handleNav('news')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active === 'news' || active === 'economia-iv'
                ? 'bg-[#004F8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#004F8A] hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Investigaciones</span>
            {articlesCount !== undefined && articlesCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                active === 'news' || active === 'economia-iv'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {articlesCount}
              </span>
            )}
          </button>

          {/* 2. Glosario */}
          <button
            type="button"
            onClick={() => handleNav('glossary')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active === 'glossary'
                ? 'bg-[#004F8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#004F8A] hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Glosario</span>
            {glossaryCount !== undefined && glossaryCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                active === 'glossary'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {glossaryCount}
              </span>
            )}
          </button>

          {/* 3. Institucional */}
          <button
            type="button"
            onClick={() => handleNav('about')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active === 'about'
                ? 'bg-[#004F8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#004F8A] hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Institucional</span>
          </button>

          {/* 4. Asistente IA */}
          <button
            type="button"
            onClick={() => handleNav('asistente')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md border border-[#009EDB]/40 bg-[#009EDB]/10 text-[#004F8A] hover:bg-[#009EDB]/20 transition-colors cursor-pointer shadow-2xs"
            title="Consultar al Asistente Académico IA con Llama-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#009EDB]" />
            <span>Asistente IA</span>
          </button>

          {/* 5. Panel Admin / Salir */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  active === 'admin' || active === 'create'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Panel Admin ✓</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Cerrar sesión de administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ml-1 ${
                active === 'admin' || active === 'login'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Botón Móvil Hamburguesa */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => handleNav('news')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              active === 'news' || active === 'economia-iv'
                ? 'bg-[#004F8A] text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4" />
              <span>Investigaciones</span>
            </div>
            {articlesCount !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {articlesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav('glossary')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              active === 'glossary'
                ? 'bg-[#004F8A] text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Glosario Conceptual</span>
            </div>
            {glossaryCount !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {glossaryCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav('about')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              active === 'about'
                ? 'bg-[#004F8A] text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Institucional / Acerca de</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('asistente')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#009EDB]/15 text-[#004F8A] border border-[#009EDB]/30"
          >
            <Sparkles className="w-4 h-4 text-[#009EDB]" />
            <span>Asistente Académico IA</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {isAdminLoggedIn ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Panel Admin ✓</span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:underline px-2 py-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <Lock className="w-4 h-4" />
                <span>Ingreso Administrador</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
