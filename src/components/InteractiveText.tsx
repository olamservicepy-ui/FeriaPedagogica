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
    return <div className={`text-white ${className}`}>{text}</div>;
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
    return <div className={`text-white ${className}`}>{text}</div>;
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
    <div ref={containerRef} className={`relative leading-relaxed break-words font-sans text-white ${className}`}>
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
                className="cursor-pointer underline decoration-dotted decoration-sky-400 text-sky-300 font-semibold hover:text-white hover:bg-sky-500/20 rounded px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-left font-sans"
                title={`Ver definición de: ${matchedItem.term}`}
                aria-label={`Término de glosario: ${matchedItem.term}`}
              >
                {part}
              </button>

              {/* Hover Popover on Desktop (Dark Frosted Glass) */}
              <span
                role="tooltip"
                className="pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out transform group-hover:scale-100 scale-95 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 md:w-80 p-4 bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 text-left text-xs text-white hidden md:block"
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-semibold text-sky-400 tracking-wide text-[11px] uppercase font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    Concepto de RRII
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Glosario</span>
                </div>
                <div className="font-semibold tracking-tight text-sm text-white mb-1 font-sans">
                  {matchedItem.term}
                </div>
                <div className="text-slate-300 font-normal leading-relaxed text-xs font-sans">
                  {matchedItem.definition}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-solid border-t-zinc-950 border-t-8 border-x-transparent border-x-8 border-b-0 filter drop-shadow-xs" />
              </span>
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}

      {/* Touch & Mobile Bottom Sheet / Dialog (Dark Frosted Glass) */}
      {activeBottomSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveBottomSheet(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bottomsheet-title"
        >
          <div
            className="w-full max-w-lg bg-zinc-950 backdrop-blur-xl border border-white/20 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-200 max-h-[85vh] overflow-y-auto text-white transition-all duration-200 ease-out transform scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe/Drag Indicator for mobile */}
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-1 sm:hidden cursor-pointer" onClick={() => setActiveBottomSheet(null)} />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Glosario de Relaciones Internacionales
              </span>
              <button
                type="button"
                onClick={() => setActiveBottomSheet(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Cerrar glosario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Term Title & Definition */}
            <div className="space-y-2">
              <h3 id="bottomsheet-title" className="text-xl font-semibold tracking-tight text-white font-sans">
                {activeBottomSheet.term}
              </h3>
              <p className="text-slate-300 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
                {activeBottomSheet.definition}
              </p>
            </div>

            {/* Dismiss Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveBottomSheet(null)}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors shadow-md font-sans"
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
