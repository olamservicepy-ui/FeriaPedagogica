import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  Link as LinkIcon,
  Printer,
  Share2,
  ChevronLeft,
  Check
} from 'lucide-react';
import type { NewsArticle, GlossaryItem } from '../types/news';
import { getAuthorImage, getAuthorProfile } from '../data/authors';
import { InteractiveText } from './InteractiveText';
import { IRPerspectiveCard } from './IRPerspectiveCard';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  allGlossary: GlossaryItem[];
  onClose: () => void;
  onSelectTerm?: (term: string) => void;
  onSelectAuthor?: (author: string) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  article,
  allGlossary,
  onClose,
  onSelectTerm,
  onSelectAuthor,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [article]);

  if (!article) return null;

  const primaryAuthor = article.authors[0] || 'Investigador';
  const authorPhoto = article.author_image || getAuthorImage(primaryAuthor);
  const authorProfile = getAuthorProfile(primaryAuthor);

  // Combine article glossary with global glossary for in-text enrichment
  const combinedGlossaryMap = new Map<string, GlossaryItem>();
  for (const item of allGlossary) {
    if (item.term && item.definition) {
      combinedGlossaryMap.set(item.term.toLowerCase(), item);
    }
  }
  for (const item of article.glossary || []) {
    if (item.term && item.definition) {
      combinedGlossaryMap.set(item.term.toLowerCase(), item);
    }
  }
  const combinedGlossary = Array.from(combinedGlossaryMap.values());

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalWords = (article.full_text?.join(' ') || '').split(/\s+/).length;
  const readTimeMinutes = Math.max(2, Math.ceil(totalWords / 160));

  const getRegionBadgeStyle = (region: string) => {
    switch (region.toLowerCase()) {
      case 'américa latina':
        return 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80';
      case 'asia-pacífico':
        return 'bg-amber-50/90 text-amber-900 border-amber-200/80';
      case 'europa':
        return 'bg-blue-50/90 text-blue-900 border-blue-200/80';
      case 'global':
      default:
        return 'bg-indigo-50/90 text-indigo-900 border-indigo-200/80';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 lg:p-6 bg-slate-900/25 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full h-full md:h-auto md:max-h-[92vh] max-w-4xl bg-white/95 backdrop-blur-xl border border-white/80 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-sans transition-all duration-200 ease-out transform scale-100 opacity-100"
      >
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-white/80 border-b border-slate-200/50 backdrop-blur-md">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-all duration-300 ease-out cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-700" />
            <span className="truncate max-w-[120px] sm:max-w-none">Volver a portada</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyLink}
              title="Copiar enlace"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-300 ease-out cursor-pointer"
              aria-label="Compartir"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              title="Imprimir o guardar como PDF"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-300 ease-out hidden sm:inline-flex cursor-pointer"
              aria-label="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar lectura"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-300 ease-out cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Editorial con Fondo Difuminado del Autor (h-[380px] a h-[460px]) */}
          <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-10 select-none bg-slate-100">
            {/* Foto del alumno como fondo editorial */}
            <img
              src={authorPhoto}
              alt={primaryAuthor}
              className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.98] transition-transform duration-700 ease-out hover:scale-105"
            />

            {/* Sombra sutil superior para contraste nítido bajo la barra fija */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/10 to-transparent pointer-events-none" />

            {/* Directiva: degradado superpuesto que difumine suavemente la imagen hacia abajo sin bordes duros */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/85 to-transparent pointer-events-none" />

            {/* Metadatos y título principal directamente sobre el hero con contraste nítido */}
            <div className="relative z-10 space-y-3 sm:space-y-4">
              {/* Badges con efecto glass */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-xs uppercase tracking-wider ${getRegionBadgeStyle(
                    article.region
                  )}`}
                >
                  {article.region}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/85 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs">
                  {article.topic}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-white/85 backdrop-blur-md text-slate-700 border border-white/60 shadow-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {readTimeMinutes} min de lectura
                </span>
              </div>

              {/* Título Principal Tipografía Apple */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-semibold tracking-tight text-slate-900 leading-tight font-sans break-words max-w-3xl drop-shadow-xs">
                {article.title}
              </h1>

              {/* Autor, Alumno y Fecha sobre el Hero */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-sm">
                  <img
                    src={authorPhoto}
                    alt={primaryAuthor}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-600/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-[11px]">Investigación:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.authors.map((author, idx) => (
                          <button
                            key={author}
                            type="button"
                            onClick={() => {
                              onSelectAuthor?.(author);
                              onClose();
                            }}
                            className="text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer font-semibold transition-colors"
                            title={`Filtrar publicaciones de ${author}`}
                          >
                            {author}{idx < article.authors.length - 1 ? ',' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate font-mono">
                      {article.author_role || authorProfile?.role || 'Feria Pedagógica • Cátedra de Relaciones Internacionales'}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 text-xs font-mono text-slate-600 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Publicado: {article.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Body - Paso completamente fluido sin bordes duros desde el degradado #F8F9FA */}
          <div className="px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-8 space-y-6 sm:space-y-8 bg-[#F8F9FA]">

          {/* Executive Summary Box */}
          {article.summary_bullets && article.summary_bullets.length > 0 && (
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-5 sm:p-6 space-y-3 overflow-hidden break-words shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                Puntos Clave del Análisis
              </div>
              <ul className="space-y-2.5">
                {article.summary_bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] break-words font-sans">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                    <span className="break-words flex-1 min-w-0">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Full Text with In-Text Interactive Glossary Tooltips */}
          <div className="space-y-5 sm:space-y-6 text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] break-words">
            {article.full_text.map((paragraph, idx) => (
              <InteractiveText
                key={idx}
                text={paragraph}
                glossary={combinedGlossary}
                className="text-justify"
              />
            ))}
          </div>

          {/* Guide banner for interactive glossary tooltips */}
          <div className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed bg-emerald-50/60 backdrop-blur-sm rounded-xl p-3.5 border border-emerald-200/60 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="leading-normal font-sans">
              <strong>Guía interactiva:</strong> Los conceptos con subrayado punteado verde poseen definiciones académicas del glosario. Toca o pasa el cursor sobre ellos para consultar su concepto.
            </span>
          </div>

          {/* Perspectiva de Relaciones Internacionales */}
          {article.ir_perspective && (
            <IRPerspectiveCard perspective={article.ir_perspective} />
          )}

          {/* Article Glossary Box */}
          {article.glossary && article.glossary.length > 0 && (
            <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-5 sm:p-7 md:p-8 space-y-4 overflow-hidden break-words font-sans shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                <div className="p-2 rounded-xl bg-emerald-100/90 text-emerald-800 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                    Glosario Conceptual del Artículo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Términos técnicos y diplomáticos empleados en este documento
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                {article.glossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:border-emerald-300 transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden break-words"
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-emerald-800 tracking-tight truncate">
                        {item.term}
                      </span>
                      {onSelectTerm && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectTerm(item.term);
                          }}
                          className="text-[10px] sm:text-[11px] text-slate-500 hover:text-emerald-700 underline shrink-0 transition-colors"
                        >
                          Ver en A-Z
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 font-normal leading-relaxed text-[13px] sm:text-[14px] font-sans break-words">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources / References */}
          {article.sources && article.sources.length > 0 && (
            <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-5 sm:p-6 space-y-3 overflow-hidden break-words font-sans shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Fuentes & Referencias Académicas Consultadas
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-mono">
                {article.sources.map((src, idx) => (
                  <li key={idx} className="flex items-start gap-2 break-words">
                    <span className="text-emerald-700 font-bold shrink-0">[{idx + 1}]</span>
                    <span className="break-words flex-1">{src}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white/80 border-t border-slate-200/50 backdrop-blur-md flex items-center justify-between text-xs text-slate-600 font-sans">
          <span className="truncate max-w-[180px] sm:max-w-none">Feria Pedagógica RRII</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 min-h-[40px] rounded-xl bg-white/90 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out"
          >
            Cerrar Lectura
          </button>
        </div>
      </div>
    </div>
  );
};
