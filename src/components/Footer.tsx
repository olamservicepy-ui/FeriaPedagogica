import React from 'react';
import { Globe2, ArrowUp } from 'lucide-react';

interface FooterProps {
  onGoToTop: () => void;
  onOpenAbout: () => void;
  onOpenGlossary: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGoToTop,
  onOpenAbout,
  onOpenGlossary,
}) => {
  return (
    <footer className="border-t border-slate-200/90 bg-white pt-10 pb-8 text-slate-600 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base font-sans">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Globe2 className="w-4 h-4" />
              </div>
              <span>Observatorio de Economía Internacional</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm font-sans">
              Portal editorial de divulgación científica y geopolítica de la Feria Pedagógica de la Licenciatura en Relaciones Internacionales.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold">
              Licenciatura en Relaciones Internacionales • Edición 2026
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-slate-800 text-xs font-semibold">
              Secciones
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onGoToTop}
                  className="hover:text-emerald-800 transition-colors text-slate-600"
                >
                  Portada y Últimos Análisis
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenGlossary}
                  className="hover:text-emerald-800 transition-colors text-slate-600"
                >
                  Glosario de Términos A-Z
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-emerald-800 transition-colors text-slate-600"
                >
                  Metodología e Ingesta
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Specs */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-slate-800 text-xs font-semibold">
              Datos Abiertos
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              Toda la información analítica y los glosarios están organizados bajo el esquema abierto <code className="text-emerald-800 bg-slate-50 px-1 py-0.5 rounded border border-slate-200 font-mono">news.json</code>.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onGoToTop();
              }}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              <span>Subir al inicio</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Feria Pedagógica de Relaciones Internacionales. Uso académico y formativo.
          </div>
          <div className="flex items-center gap-1">
            <span>Diseñado con rigor editorial y perspectiva analítica</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
