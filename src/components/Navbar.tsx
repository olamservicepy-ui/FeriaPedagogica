import React from 'react';

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  // Backwards compatibility with existing App.tsx props
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  onOpenAIAssistant?: () => void;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
  articlesCount?: number;
  glossaryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeTab,
  setActiveTab,
  onOpenAIAssistant,
  isAdminLoggedIn,
}) => {
  const active = currentView || activeTab || 'economia-iv';

  const handleNav = (view: string) => {
    if (view === 'asistente') {
      if (onOpenAIAssistant) {
        onOpenAIAssistant();
        return;
      }
    }
    if (onNavigate) {
      onNavigate(view);
    }
    if (setActiveTab) {
      setActiveTab(view);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* 1. Franja institucional superior requerida */}
      <div className="w-full bg-[#002A54] text-white py-1 px-4 sm:px-8 text-center">
        <p className="text-[10px] sm:text-xs tracking-wider uppercase font-medium">
          FERIA PEDAGÓGICA - FACULTAD DE HUMANIDADES, CIENCIAS SOCIALES Y CULTURA GUARANÍ - EDICIÓN 2026
        </p>
      </div>

      {/* 2. Barra principal limpia: solo Identidad y Accesos Clave */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Identidad Principal: Economía IV 2026 */}
        <div 
          onClick={() => handleNav('economia-iv')}
          className="cursor-pointer flex items-baseline gap-2 select-none"
        >
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#002A54] uppercase">
            Economía IV
          </span>
          <span className="text-xs font-bold text-[#009EDB] bg-[#009EDB]/10 px-2 py-0.5 rounded">
            2026
          </span>
        </div>

        {/* Botones de acción a la derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón Principal Economía IV Activo */}
          <button
            type="button"
            onClick={() => handleNav('economia-iv')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active === 'economia-iv' || active === 'news'
                ? 'bg-[#004F8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004F8A] hover:bg-slate-100'
            }`}
          >
            Investigaciones
          </button>

          {/* Acceso Asistente IA */}
          <button
            type="button"
            onClick={() => handleNav('asistente')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
              active === 'asistente'
                ? 'border-[#009EDB] text-[#004F8A] bg-[#009EDB]/10'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Asistente IA
          </button>

          {/* Panel de Administración */}
          <button
            type="button"
            onClick={() => handleNav('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active === 'admin'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isAdminLoggedIn ? 'Panel Admin ✓' : 'Panel Admin'}
          </button>
        </div>

      </div>
    </header>
  );
};
