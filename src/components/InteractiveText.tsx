import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, X, Check } from 'lucide-react';
import type { GlossaryItem } from '../types/news';

interface InteractiveTextProps {
  text: string;
  glossary: GlossaryItem[];
  className?: string;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  glossary,
  className = '',
}) => {
  const [activeBottomSheet, setActiveBottomSheet] = useState<GlossaryItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close bottom sheet / modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveBottomSheet(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!glossary || glossary.length === 0) {
    return <div className={className}>{text}</div>;
  }

  // Deduplicate and sort glossary terms by length descending so multi-word terms match first
  const termsMap = new Map<string, GlossaryItem>();
  for (const item of glossary) {
    if (item.term && item.definition) {
      termsMap.set(item.term.trim().toLowerCase(), item);
    }
  }

  const sortedTerms = Array.from(termsMap.values()).sort(
    (a, b) => b.term.length - a.term.length
  );

  if (sortedTerms.length === 0) {
    return <div className={className}>{text}</div>;
  }

  // Escape regex special chars
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build combined regex pattern
  const pattern = new RegExp(
    `(${sortedTerms.map((t) => escapeRegExp(t.term)).join('|')})`,
    'gi'
  );

  const parts = text.split(pattern);

  const handleTermClick = (e: React.MouseEvent<HTMLButtonElement>, item: GlossaryItem) => {
    e.stopPropagation();
    setActiveBottomSheet(item);
  };

  return (
    <div ref={containerRef} className={`relative leading-relaxed break-words font-sans text-slate-700 ${className}`}>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const matchedItem = termsMap.get(lowerPart);

        if (matchedItem) {
          return (
            <span
              key={`${matchedItem.term}-${index}`}
              className="relative inline-block group"
            >
              <button
                type="button"
                onClick={(e) => handleTermClick(e, matchedItem)}
                className="cursor-pointer underline decoration-dotted decoration-emerald-600 text-emerald-800 font-semibold hover:text-emerald-900 hover:bg-emerald-50 rounded px-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-left font-sans"
                title={`Ver definición de: ${matchedItem.term}`}
                aria-label={`Término de glosario: ${matchedItem.term}`}
              >
                {part}
              </button>

              {/* Hover Popover on Desktop (Frosted Glass) */}
              <span
                role="tooltip"
                className="pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out transform group-hover:scale-100 scale-95 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 md:w-80 p-4 bg-white/90 backdrop-blur-xl border border-white/80 rounded-xl shadow-2xl z-50 text-left text-xs text-slate-700 hidden md:block"
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-700 tracking-wide text-[11px] uppercase font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Concepto de RRII
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Glosario</span>
                </div>
                <div className="font-semibold tracking-tight text-sm text-slate-900 mb-1 font-sans">
                  {matchedItem.term}
                </div>
                <div className="text-slate-600 font-normal leading-relaxed text-xs font-sans">
                  {matchedItem.definition}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-solid border-t-white/90 border-t-8 border-x-transparent border-x-8 border-b-0 filter drop-shadow-xs" />
              </span>
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}

      {/* Touch & Mobile Bottom Sheet / Dialog (Frosted Glass) */}
      {activeBottomSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/25 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveBottomSheet(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bottomsheet-title"
        >
          <div
            className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-white/80 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-200 max-h-[85vh] overflow-y-auto text-slate-900 transition-all duration-200 ease-out transform scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe/Drag Indicator for mobile */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-1 sm:hidden cursor-pointer" onClick={() => setActiveBottomSheet(null)} />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Glosario de Relaciones Internacionales
              </span>
              <button
                type="button"
                onClick={() => setActiveBottomSheet(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-300 ease-out"
                aria-label="Cerrar glosario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Term Title & Definition */}
            <div className="space-y-2">
              <h3 id="bottomsheet-title" className="text-xl font-semibold tracking-tight text-slate-900 font-sans">
                {activeBottomSheet.term}
              </h3>
              <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
                {activeBottomSheet.definition}
              </p>
            </div>

            {/* Dismiss Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveBottomSheet(null)}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-sm font-semibold transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-sans"
              >
                <Check className="w-4 h-4" />
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
