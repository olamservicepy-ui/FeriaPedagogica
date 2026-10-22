import React, { useState, useMemo } from 'react';
import { BookOpen, Search, FileText, ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { NewsArticle, GlobalGlossaryEntry } from '../types/news';
import BlurText from './reactbits/BlurText';

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
    const target = articles.find((a) => a.id === articleId);
    if (target) {
      onSelectArticle(target);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans px-4 sm:px-0">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30 backdrop-blur-md shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          Compendio Conceptual
        </div>
        <BlurText
          text="Glosario Global de Economía Internacional"
          as="h2"
          effect="blur"
          animateBy="words"
          direction="top"
          delay={90}
          stepDuration={0.35}
          blur={10}
          distance={24}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white break-words font-sans justify-center"
        />
        <p className="text-slate-400 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
          Índice unificado y desduplicado con todos los conceptos teóricos, regulatorios y geopolíticos analizados en las investigaciones de la feria.
        </p>
      </div>

      {/* Live Search Bar */}
      <div className="max-w-xl mx-auto relative group">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 pointer-events-none transition-colors duration-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar concepto o definición en vivo..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3.5 sm:py-4 rounded-2xl bg-zinc-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-xl transition-all duration-300 text-[15px] sm:text-[16px] font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1.5 rounded-xl transition-all"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Alphabet Selector */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-2.5 bg-zinc-950/80 border border-white/10 rounded-2xl max-w-3xl mx-auto shadow-xl">
        <button
          onClick={() => setSelectedLetter('TODOS')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
            selectedLetter === 'TODOS'
              ? 'bg-sky-600 text-white shadow-md font-semibold'
              : 'bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-slate-300'
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
              className={`min-w-[36px] min-h-[38px] rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? 'bg-sky-600 text-white font-semibold shadow-md'
                  : 'bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-slate-300'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Glossary Items List with Staggered Motion */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-zinc-950/80 rounded-3xl border border-white/10 max-w-lg mx-auto shadow-xl">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold tracking-tight text-white mb-1">
            No se encontraron conceptos
          </h4>
          <p className="text-slate-400 font-normal leading-relaxed text-[15px] font-sans">
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
              className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-xl hover:-translate-y-1.5 hover:border-sky-500/30 transition-all duration-500 group overflow-hidden break-words font-sans"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold tracking-tight text-white group-hover:text-sky-300 transition-colors duration-300 truncate font-sans">
                    {entry.term}
                  </h3>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-900 border border-white/15 text-sky-300 text-xs font-mono flex items-center justify-center font-bold">
                    {entry.term.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 font-normal leading-relaxed text-[15px] sm:text-[16px] mb-4 break-words font-sans">
                  {entry.definition}
                </p>
              </div>

              {/* Linked Articles */}
              <div className="pt-3 border-t border-white/10 mt-auto">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-sky-400 shrink-0" />
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
                        className="text-left text-xs sm:text-sm text-slate-400 hover:text-sky-300 flex items-center justify-between gap-1 w-full group/link py-1 min-h-[36px] transition-colors duration-300 cursor-pointer"
                      >
                        <span className="truncate flex-1 font-sans">{article.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-sky-400 opacity-80 group-hover/link:translate-x-1 transition-transform duration-300" />
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

export default GlobalGlossary;
