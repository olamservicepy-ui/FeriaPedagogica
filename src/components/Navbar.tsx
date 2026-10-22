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
    <header className="w-full bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-lg shadow-black/50">
      {/* 1. FRANJA INSTITUCIONAL PRINCIPAL */}
      <div className="w-full bg-zinc-950/95 border-b border-white/10 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* EXTREMO IZQUIERDO: Logo de la UNI */}
          <div className="flex-shrink-0 flex items-center justify-center p-1 bg-white/95 rounded-xl shadow-md">
            <img
              src="/logo-uni.png"
              alt="Universidad Nacional de Itapúa"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>

          {/* TEXTOS CENTRALES EN DOS FILAS JERÁRQUICAS */}
          <div className="flex-1 text-center px-2">
            {/* Fila 1: Universidad */}
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wider text-white leading-tight">
              Universidad Nacional de Itapúa
            </h1>
            {/* Fila 2: Facultad */}
            <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-400 leading-tight mt-0.5">
              Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní
            </h2>
          </div>

          {/* EXTREMO DERECHO: Logo de la Facultad de Humanidades */}
          <div className="flex-shrink-0 flex items-center justify-center p-1 bg-white/95 rounded-xl shadow-md">
            <img
              src="/logo-humanidades.png"
              alt="Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>

        </div>
      </div>

      {/* 2. BARRA DE ACCIÓN Y NAVEGACIÓN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        
        {/* Identificador breve de Cátedra (enlace a inicio) */}
        <button
          type="button"
          onClick={() => onNavigate('news')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#38bdf8] hover:text-sky-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
          title="Ir al inicio"
        >
          Economía IV • Edición 2026
        </button>

        {/* Botones de navegación a la derecha */}
        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={() => onNavigate('asistente')}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-white/15 bg-zinc-900/90 text-slate-200 hover:text-white hover:bg-zinc-800 hover:border-white/30 transition-colors cursor-pointer"
          >
            Asistente IA
          </button>

          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-sky-500 text-black font-bold'
                    : 'text-slate-300 hover:bg-zinc-900 hover:text-white border border-white/10'
                }`}
              >
                Panel Admin ✓
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Salir
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
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
