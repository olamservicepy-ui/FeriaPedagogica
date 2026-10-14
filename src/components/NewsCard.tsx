import React from 'react';
import { Calendar, Users, ArrowUpRight, Compass, BookOpen, Clock } from 'lucide-react';
import type { NewsArticle } from '../types/news';

interface NewsCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  onSelectAuthor?: (author: string) => void;
  selectedAuthor?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelect,
  onSelectAuthor,
  selectedAuthor,
}) => {
  // Region-specific accent colors (light mode)
  const getRegionBadgeStyle = (region: string) => {
    switch (region.toLowerCase()) {
      case 'américa latina':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'asia-pacífico':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'europa':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'global':
      default:
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return dateStr;
    }
  };

  const totalWords = (article.full_text?.join(' ') || '').split(/\s+/).length;
  const readTimeMinutes = Math.max(2, Math.ceil(totalWords / 160));

  return (
    <article
      onClick={() => onSelect(article)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out p-6 md:p-7 cursor-pointer overflow-hidden font-sans"
    >
      <div>
        {/* Meta badges: Region & Topic & Read Time */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ease-out ${getRegionBadgeStyle(
                article.region
              )}`}
            >
              {article.region}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200/80 border border-slate-200/40 text-slate-700 transition-all duration-300 ease-out">
              {article.topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{readTimeMinutes} min</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors duration-300 ease-out line-clamp-2 leading-snug mb-3">
          {article.title}
        </h3>

        {/* Executive summary bullets teaser */}
        {article.summary_bullets && article.summary_bullets.length > 0 && (
          <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] line-clamp-3 mb-4">
            {article.summary_bullets[0]}
          </p>
        )}
      </div>

      {/* Footer metadata */}
      <div className="pt-4 mt-auto border-t border-slate-100/80">
        <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate max-w-[68%]">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="truncate flex items-center gap-1">
              {article.authors.map((author, idx) => {
                const isSelected = selectedAuthor === author;
                return (
                  <React.Fragment key={author}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAuthor?.(author);
                      }}
                      className={`truncate transition-colors hover:underline cursor-pointer font-medium ${
                        isSelected
                          ? 'text-emerald-700 font-semibold underline'
                          : 'hover:text-emerald-700 text-slate-600'
                      }`}
                      title={`Filtrar publicaciones de ${author}`}
                    >
                      {author}
                    </button>
                    {idx < article.authors.length - 1 && <span className="text-slate-400">,</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(article.date)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {article.glossary?.length > 0 && (
              <span
                className="inline-flex items-center gap-1 text-slate-600 bg-slate-100/80 backdrop-blur-sm border border-slate-200/40 px-2.5 py-0.5 rounded-xl transition-all duration-300 ease-out"
                title={`${article.glossary.length} términos de glosario analizados`}
              >
                <BookOpen className="w-3 h-3 text-emerald-600" />
                <span>{article.glossary.length} términos</span>
              </span>
            )}
            {article.ir_perspective && (
              <span
                className="inline-flex items-center gap-1 text-slate-600 bg-slate-100/80 backdrop-blur-sm border border-slate-200/40 px-2.5 py-0.5 rounded-xl transition-all duration-300 ease-out"
                title="Incluye análisis de perspectiva en relaciones internacionales"
              >
                <Compass className="w-3 h-3 text-emerald-700" />
                <span>Perspectiva RRII</span>
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all duration-300 ease-out">
            Leer análisis
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
