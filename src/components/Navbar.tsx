// src/components/Navbar.tsx
import React from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
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
  isAdminLoggedIn,
  onLogout,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* 1. FRANJA INSTITUCIONAL PRINCIPAL */}
      <div className="w-full bg-slate-50 border-b border-slate-200/80 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* EXTREMO IZQUIERDO: Logo de la UNI */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src="/logo-uni.png"
              alt="Universidad Nacional de Itapúa"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
            />
          </div>

          {/* TEXTOS CENTRALES EN DOS FILAS JERÁRQUICAS */}
          <div className="flex-1 text-center px-2">
            {/* Fila 1: Universidad */}
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wider text-[#002A54] leading-tight">
              Universidad Nacional de Itapúa
            </h1>
            {/* Fila 2: Facultad */}
            <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-600 leading-tight mt-0.5">
              Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní
            </h2>
          </div>

          {/* EXTREMO DERECHO: Logo de la Facultad de Humanidades */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src="/logo-humanidades.png"
              alt="Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
            />
          </div>

        </div>
      </div>

      {/* 2. BARRA DE ACCIÓN Y NAVEGACIÓN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        
        {/* Identificador breve de Cátedra */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#004F8A]">
            Economía IV • Edición 2026
          </span>
        </div>

        {/* Botones de navegación a la derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('news')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              currentView === 'news' || currentView === 'economia-iv'
                ? 'bg-[#004F8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004F8A] hover:bg-slate-100'
            }`}
          >
            Investigaciones
          </button>

          <button
            onClick={() => onNavigate('asistente')}
            className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Asistente IA
          </button>

          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Panel Admin ✓
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Salir
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="px-3 py-1 text-xs font-semibold rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Panel Admin
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
