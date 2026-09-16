import React, { useState, useMemo } from 'react';
import { BookOpen, Search, FileText, ArrowRight } from 'lucide-react';
import type { NewsArticle, GlobalGlossaryEntry } from '../types/news';

interface GlobalGlossaryProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  initialSearchQuery?: string;
}

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          Compendio Conceptual
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 break-words font-sans">
          Glosario Global de Economía Internacional
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 font-sans">
          Índice unificado y desduplicado con todos los conceptos teóricos, regulatorios y geopolíticos analizados en las investigaciones de la feria.
        </p>
      </div>

      {/* Live Search Bar */}
      <div className="max-w-xl mx-auto relative">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar concepto o definición en vivo..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-xs sm:text-sm shadow-xs font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Alphabet Selector with touch-friendly targets */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-2 bg-white border border-slate-200/80 rounded-2xl max-w-3xl mx-auto shadow-xs">
        <button
          onClick={() => setSelectedLetter('TODOS')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedLetter === 'TODOS'
              ? 'bg-emerald-700 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              className={`min-w-[34px] min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Glossary Items List */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto shadow-xs">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800 mb-1">
            No se encontraron conceptos
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Intenta con otra palabra clave o selecciona "TODOS" en el selector alfabético.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 shadow-xs hover:shadow-sm group overflow-hidden break-words font-sans"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {entry.term}
                  </h3>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-mono flex items-center justify-center font-bold">
                    {entry.term.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 break-words font-sans">
                  {entry.definition}
                </p>
              </div>

              {/* Linked Articles */}
              <div className="pt-3 border-t border-slate-100 mt-auto">
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
                        className="text-left text-xs text-slate-600 hover:text-emerald-700 flex items-center justify-between gap-1 w-full group/link py-1 min-h-[36px]"
                      >
                        <span className="truncate flex-1 font-sans">{article.title}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 text-emerald-600 opacity-80" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
