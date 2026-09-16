import React from 'react';
import { Compass, CheckCircle2, ShieldAlert, Target } from 'lucide-react';
import type { IRPerspective } from '../types/news';

interface IRPerspectiveCardProps {
  perspective: IRPerspective;
  className?: string;
}

export const IRPerspectiveCard: React.FC<IRPerspectiveCardProps> = ({
  perspective,
  className = '',
}) => {
  if (!perspective) return null;

  return (
    <section
      aria-label="Perspectiva de Relaciones Internacionales"
      className={`relative overflow-hidden break-words rounded-2xl bg-emerald-50/60 border-l-4 border-emerald-600 border-y border-r border-emerald-200/80 p-4 sm:p-6 md:p-8 shadow-xs font-sans ${className}`}
    >
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-800 font-semibold block truncate">
              Dimensión Estratégica & Análisis Político
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 tracking-tight break-words font-sans">
              Perspectiva de Relaciones Internacionales
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-emerald-800 border border-emerald-200 shrink-0 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Think Tank Briefing
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 overflow-hidden">
        {/* Geopolitical Context */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 shadow-xs overflow-hidden break-words">
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-900 font-semibold text-xs sm:text-sm font-sans">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Dinámica de Poder & Contexto Geopolítico</span>
            </div>
            <p className="text-slate-800 text-xs sm:text-sm md:text-base leading-relaxed font-sans break-words">
              {perspective.geopolitical_context}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>Enfoque: Interdependencia Compleja</span>
            <span className="font-mono text-emerald-700 font-semibold">Feria Pedagógica RI</span>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="lg:col-span-6 bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 shadow-xs overflow-hidden break-words">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs sm:text-sm font-sans">
            <Target className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Recomendaciones para Tomadores de Decisión</span>
          </div>

          <ul className="space-y-3">
            {perspective.strategic_recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-800 leading-relaxed group break-words font-sans"
              >
                <div className="mt-0.5 shrink-0 text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="break-words flex-1 min-w-0">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
