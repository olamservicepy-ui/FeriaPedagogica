import React, { useState, useMemo } from 'react';
import { BookOpen, Search, FileText, ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { NewsArticle, GlobalGlossaryEntry } from '../types/news';

interface GlobalGlossaryProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  initialSearchQuery?: string;
}

const glossaryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const glossaryItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export const GlobalGlossary: React.FC<GlobalGlossaryProps> = ({
  articles,
  onSelectArticle,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLetter, setSelectedLetter] = useState<string>('TODOS');

  // Compile and deduplicate all glossary items across all articles
  const globalEntries = useMemo<GlobalGlossaryEntry[]>(() => {
    const map = new Map<string, { definition: string; articleIds: Set<string>; articleTitles: Map<string, string> }>();

    for (const article of articles) {
      for (const item of article.glossary || []) {
        if (!item.term) continue;
        const normalizedKey = item.term.trim().toLowerCase();
        if (!map.has(normalizedKey)) {
          map.set(normalizedKey, {
            definition: item.definition,
            articleIds: new Set([article.id]),
            articleTitles: new Map([[article.id, article.title]]),
          });
        } else {
          const entry = map.get(normalizedKey)!;
          entry.articleIds.add(article.id);
          entry.articleTitles.set(article.id, article.title);
          if (item.definition.length > entry.definition.length) {
            entry.definition = item.definition;
          }
        }
      }
    }

    const entries: GlobalGlossaryEntry[] = [];
    map.forEach((value, key) => {
      const displayTerm = key.charAt(0).toUpperCase() + key.slice(1);
      entries.push({
        term: displayTerm,
        definition: value.definition,
        articleIds: Array.from(value.articleIds),
        articleTitles: Array.from(value.articleTitles.values()),
      });
    });

    return entries.sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));
  }, [articles]);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    globalEntries.forEach((entry) => {
      const firstChar = entry.term.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [globalEntries]);

  const filteredEntries = useMemo(() => {
    return globalEntries.filter((entry) => {
      const matchesSearch =
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedLetter === 'TODOS') return true;

      const firstChar = entry.term.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return firstChar === selectedLetter;
    });
  }, [globalEntries, searchQuery, selectedLetter]);

  const handleArticleClick = (articleId: string) => {
    const found = articles.find((a) => a.id === articleId);
    if (found) onSelectArticle(found);
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-all duration-700 ease-out">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          Compendio Conceptual
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 break-words font-sans">
          Glosario Global de Economía Internacional
        </h2>
        <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
          Índice unificado y desduplicado con todos los conceptos teóricos, regulatorios y geopolíticos analizados en las investigaciones de la feria.
        </p>
      </div>

      {/* Live Search Bar */}
      <div className="max-w-xl mx-auto relative group">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-700 ease-out" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar concepto o definición en vivo..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3.5 sm:py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] focus:shadow-[0_12px_36px_-8px_rgba(16,185,129,0.12)] transition-all duration-700 ease-out text-[15px] sm:text-[16px] font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1.5 rounded-xl transition-all duration-700 ease-out"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Alphabet Selector with touch-friendly targets */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl max-w-3xl mx-auto shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setSelectedLetter('TODOS')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-700 ease-out cursor-pointer ${
            selectedLetter === 'TODOS'
              ? 'bg-emerald-700 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] font-semibold'
              : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700'
          }`}
        >
          TODOS ({globalEntries.length})
        </button>
        {alphabet.map((letter) => {
          const isCurrent = selectedLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`min-w-[36px] min-h-[38px] rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-700 ease-out cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-700 text-white font-semibold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]'
                  : 'bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Glossary Items List with Staggered Motion */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 max-w-lg mx-auto shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold tracking-tight text-slate-900 mb-1">
            No se encontraron conceptos
          </h4>
          <p className="text-slate-600 font-normal leading-relaxed text-[15px] font-sans">
            Intenta con otra palabra clave o selecciona "TODOS" en el selector alfabético.
          </p>
        </div>
      ) : (
        <motion.div
          key={`${selectedLetter}-${searchQuery}`}
          variants={glossaryContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {filteredEntries.map((entry, idx) => (
            <motion.div
              key={idx}
              variants={glossaryItemVariants}
              className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-700 ease-out group overflow-hidden break-words font-sans"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors duration-700 ease-out truncate font-sans">
                    {entry.term}
                  </h3>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-mono flex items-center justify-center font-bold">
                    {entry.term.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[16px] mb-4 break-words font-sans">
                  {entry.definition}
                </p>
              </div>

              {/* Linked Articles */}
              <div className="pt-3 border-t border-slate-100/80 mt-auto">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                  Mencionado en:
                </span>
                <div className="space-y-1">
                  {entry.articleIds.map((aid) => {
                    const article = articles.find((a) => a.id === aid);
                    if (!article) return null;
                    return (
                      <button
                        key={aid}
                        onClick={() => handleArticleClick(aid)}
                        className="text-left text-xs sm:text-sm text-slate-600 hover:text-emerald-700 flex items-center justify-between gap-1 w-full group/link py-1 min-h-[36px] transition-colors duration-700 ease-out cursor-pointer"
                      >
                        <span className="truncate flex-1 font-sans">{article.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600 opacity-80 group-hover/link:translate-x-1 transition-transform duration-700 ease-out" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
