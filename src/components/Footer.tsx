import React from 'react';
import { Globe2, ArrowUp, Lock } from 'lucide-react';

interface FooterProps {
  onGoToTop: () => void;
  onOpenAbout: () => void;
  onOpenGlossary: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGoToTop,
  onOpenAbout,
  onOpenGlossary,
  onOpenAdmin,
}) => {
  return (
    <footer className="border-t border-white/10 bg-black pt-10 pb-12 text-slate-400 text-xs font-sans transition-all duration-700 ease-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold tracking-tight text-base font-sans">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/15 flex items-center justify-center text-sky-400 shadow-sm">
                <Globe2 className="w-4 h-4" />
              </div>
              <span>Observatorio de Economía Internacional</span>
            </div>
            <p className="text-slate-400 font-normal leading-relaxed text-[13px] sm:text-[14px] max-w-sm font-sans">
              Portal editorial de divulgación científica y geopolítica de la Feria Pedagógica de la Licenciatura en Relaciones Internacionales.
            </p>
            <div className="text-[11px] font-mono text-sky-400 font-semibold">
              Universidad Nacional de Itapúa • Edición 2026
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-white text-xs font-semibold">
              Secciones
            </h4>
            <ul className="space-y-2 text-[13px] sm:text-[14px]">
              <li>
                <button
                  onClick={onGoToTop}
                  className="hover:text-sky-300 transition-colors duration-700 ease-out text-slate-400 font-normal cursor-pointer"
                >
                  Portada y Últimos Análisis
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenGlossary}
                  className="hover:text-sky-300 transition-colors duration-700 ease-out text-slate-400 font-normal cursor-pointer"
                >
                  Glosario de Términos A-Z
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-sky-300 transition-colors duration-700 ease-out text-slate-400 font-normal cursor-pointer"
                >
                  Metodología e Ingesta
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-sky-300 transition-colors duration-700 ease-out text-slate-400 font-normal inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Panel Administrativo (/admin)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Specs */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-white text-xs font-semibold">
              Datos Abiertos
            </h4>
            <p className="text-slate-400 font-normal leading-relaxed text-[13px] sm:text-[14px] font-sans">
              Toda la información analítica y los glosarios están organizados bajo el esquema abierto <code className="text-sky-300 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-800 font-mono text-xs">news.json</code>.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onGoToTop();
              }}
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold text-xs sm:text-sm transition-colors duration-700 ease-out"
            >
              <span>Subir al inicio</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] sm:text-xs">
          <div>
            © 2026 Observatorio de Relaciones Internacionales • Facultad de Humanidades, Cs. Sociales y Cultura Guaraní (UNI).
          </div>
          <div className="flex items-center gap-4">
            <span>Feria Pedagógica Universitaria</span>
            <span>•</span>
            <span>ISSN: 2709-8435</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
