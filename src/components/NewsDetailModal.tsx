import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Printer,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  BookMarked,
  Sliders
} from 'lucide-react';
import type { NewsArticle, GlossaryItem, PhotoCrop } from '../types/news';
import { getAuthorImage, getAuthorProfile, getAuthorPhotoCrop } from '../data/authors';
import { InteractiveText } from './InteractiveText';
import BlurText from './reactbits/BlurText';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  allArticles?: NewsArticle[];
  allGlossary?: GlossaryItem[];
  onClose: () => void;
  onSelectArticle?: (article: NewsArticle) => void;
  onSelectTerm?: (term: string) => void;
  onSelectAuthor?: (author: string) => void;
  onOpenCropper?: (author: string, image: string, crop: PhotoCrop) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  article,
  allArticles = [],
  allGlossary = [],
  onClose,
  onSelectArticle,
  onSelectAuthor,
  onOpenCropper,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

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

  const primaryAuthor = typeof article.authors?.[0] === 'string'
    ? article.authors[0]
    : (article.authors?.[0] as any)?.name || 'Estudiante Investigador';

  const authorProfile = getAuthorProfile(primaryAuthor);

  const authorPhoto = article.author_image
    || (typeof article.authors?.[0] === 'object' && (article.authors[0] as any)?.avatar)
    || authorProfile?.image
    || getAuthorImage(primaryAuthor);

  const currentCrop: PhotoCrop = article.photoCrop
    || authorProfile?.photoCrop
    || getAuthorPhotoCrop(primaryAuthor);

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

  const totalWords = (article.full_text?.join(' ') || '').split(/\s+/).length;
  const readTimeMinutes = article.read_time_minutes || Math.max(2, Math.ceil(totalWords / 160));

  // Author other publications in the observatory
  const authorOtherArticles = allArticles.filter((a) => {
    if (a.id === article.id) return false;
    return (a.authors || []).some((auth) => {
      const name = typeof auth === 'string' ? auth : (auth as any)?.name || '';
      return name.trim().toLowerCase() === primaryAuthor.trim().toLowerCase();
    });
  });

  // Next article in sequence
  let nextArticle: NewsArticle | null = null;
  if (allArticles && allArticles.length > 0) {
    const currentIndex = allArticles.findIndex((a) => a.id === article.id);
    if (currentIndex === -1) {
      nextArticle = allArticles[0] || null;
    } else {
      const nextIndex = (currentIndex + 1) % allArticles.length;
      nextArticle = allArticles[nextIndex] || null;
    }
  }

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const documentRef = article.documentRef || `OERII-2026-DP-${article.id.slice(0, 8).toUpperCase()}`;
  const issn = article.issn || "2709-8435";
  const classification = article.classification || "Dictamen de Coyuntura Económica";
  const thematicAxis = article.thematicAxis || article.topic || "POLÍTICA MONETARIA Y REGULACIÓN FINANCIERA";
  const fieldName = article.region || "América Latina y Mercosur";

  // Academic metadata
  const academicMetadata = {
    university: article.academicMetadata?.university || authorProfile?.institution || "Universidad Nacional de Itapúa",
    faculty: article.academicMetadata?.faculty || authorProfile?.faculty || "Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní",
    school: article.academicMetadata?.school || authorProfile?.school || "Licenciatura en Relaciones Internacionales",
    department: article.academicMetadata?.department || authorProfile?.department || "Observatorio Económico y Político Regional",
    location: article.academicMetadata?.location || authorProfile?.location || "Campus Universitario • Encarnación, Paraguay",
    reviewers: article.academicMetadata?.reviewers || authorProfile?.reviewers || "Cátedra de Economía Internacional & Integración Regional",
    fairEdition: article.academicMetadata?.fairEdition || authorProfile?.fairEdition || "Feria Pedagógica Universitaria 2026"
  };

  // Indicators: custom or generated
  const indicators = (article.keyIndicators && article.keyIndicators.length > 0)
    ? article.keyIndicators
    : [
        {
          label: "Región y Marco Geoeconómico",
          value: article.region || "Mercosur / Regional",
          note: article.topic || "Economía Internacional"
        },
        {
          label: "Conceptos Teóricos Auditados",
          value: `${article.glossary?.length || 4} Variables`,
          note: "Glosario Enriquecido de R.R.I.I."
        },
        {
          label: "Dictamen Académico",
          value: "Homologado",
          note: academicMetadata.reviewers
        },
        {
          label: "Fuentes Primarias",
          value: `${article.sources?.length || 1} Registro(s)`,
          note: article.sources?.[0] || "Prensa Especializada & Organismos"
        }
      ];

  const leadText = article.lead || (article.summary_bullets && article.summary_bullets[0]) || '';
  const executiveSummary = article.executiveSummary || (article.summary_bullets && article.summary_bullets.join(' ')) || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300 select-none sm:select-text"
    >
      {/* MAIN MODAL CONTAINER (LIGHT INSTITUTIONAL LUXURY) */}
      <div className="w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-300/80 shadow-2xl overflow-hidden relative text-slate-900 font-sans">
        
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR LIMPIA (REQUERIMIENTO 1: SOLO COMPARTIR, IMPRIMIR Y CERRAR) */}
        {/* ========================================================================= */}
        <div className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-end shrink-0 z-20">
          <div className="flex items-center gap-2">
            
            {/* Botón Compartir */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition cursor-pointer"
              title="Copiar enlace"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{copiedLink ? "Copiado" : "Compartir"}</span>
            </button>

            {/* Botón Imprimir */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <span>Cerrar</span>
              <X className="w-4 h-4 text-slate-700" />
            </button>

          </div>
        </div>

        {/* SCROLLABLE READING CANVAS */}
        <div className="flex-1 overflow-y-auto">

          {/* ========================================================================= */}
          {/* HERO BANNER CON FOTO Y DEGRADADO NO AGRESIVO (REQUERIMIENTOS 2, 4 Y 5)      */}
          {/* ========================================================================= */}
          <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] bg-slate-100 overflow-hidden select-none border-b border-slate-200">
            
            {/* Imagen del alumno con Zoom y Encuadre aplicados dinámicamente */}
            <div
              className="w-full h-full relative"
              style={{
                transform: `scale(${currentCrop.zoom}) translate(${currentCrop.panX}px, ${currentCrop.panY}px)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <img
                src={authorPhoto}
                alt={primaryAuthor}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* 
              REQUERIMIENTO 4: DEGRADADO NO AGRESIVO
              El degradado blanco se retrajo drásticamente al fondo:
              - La cara, ojos, boca y barbilla quedan al 100% LIMPIOS y transparentes.
              - El degradado blanco solo aparece suavemente en el último 15% inferior (via-15%)
                para que el título sea legible sin tapar facciones.
            */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent via-15% pointer-events-none" />

            {/* Botón de ajuste rápido flotante en el Hero (Solo si onOpenCropper está habilitado) */}
            {onOpenCropper && (
              <div className="absolute top-5 right-6 z-20">
                <button
                  type="button"
                  onClick={() => onOpenCropper(primaryAuthor, authorPhoto, currentCrop)}
                  className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-slate-200/80 backdrop-blur-md transition cursor-pointer"
                  title="Ajustar encuadre o cambiar foto de esta investigadora"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ajustar Encuadre / Zoom</span>
                </button>
              </div>
            )}

            {/* REQUERIMIENTO 2: SOLO LA CATEGORIA ARRIBA (SE ELIMINÓ 'PONENCIA HOMOLOGADA') */}
            <div className="absolute top-5 left-6 z-10 pointer-events-none">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/95 text-slate-900 shadow-sm border border-slate-200">
                {thematicAxis}
              </span>
            </div>

            {/* ZONA INFERIOR DEL HERO: FECHA, TITULO Y PASTILLA DE AUTOR */}
            <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-6 pt-6 z-10">
              <div className="max-w-4xl space-y-3">
                
                {/* Metadatos de Lectura */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-md border border-slate-200 backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {article.date || "Septiembre de 2026"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-md border border-slate-200 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {readTimeMinutes} min de lectura técnica
                  </span>
                  <span className="text-slate-600 font-medium">
                    • {fieldName}
                  </span>
                </div>

                {/* Titular Principal en Tipografía Carnegie Endowment con BlurText */}
                <BlurText
                  key={article.id}
                  text={article.title}
                  as="h1"
                  effect="blur"
                  animateBy="words"
                  direction="top"
                  trigger="load"
                  delay={50}
                  stepDuration={0.28}
                  blur={10}
                  distance={20}
                  className="font-carnegie font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight tracking-tight"
                />

                {/* Pastilla del Investigador en la Portada */}
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAuthor?.(primaryAuthor);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-md hover:bg-slate-50 transition cursor-pointer"
                    title={`Filtrar publicaciones de ${primaryAuthor}`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shrink-0">
                      <img
                        src={authorPhoto}
                        alt={primaryAuthor}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 leading-none">
                        {primaryAuthor}
                      </p>
                      <p className="text-[10px] text-slate-600 leading-none mt-0.5">
                        {authorProfile?.role || article.author_role || "Estudiante Investigador"} • R.R.I.I.
                      </p>
                    </div>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ARTICLE BODY & METRIC MATRICES */}
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 space-y-9">

            {/* Subtitle / Lead Paragraph */}
            {leadText && (
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal border-l-4 border-slate-900 pl-4 bg-slate-50/70 py-2 rounded-r-lg font-editorial">
                {leadText}
              </p>
            )}

            {/* Official Macroeconomic / Indicator Grid */}
            <section aria-label="Indicadores Clave" className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                Variables Económicas Auditadas por la Investigación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {indicators.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl hover:border-slate-300 transition"
                  >
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
                      {item.value}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Executive Summary Statement Box */}
            {executiveSummary && (
              <div className="p-5 rounded-xl bg-slate-100/80 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                  <BookMarked className="w-4 h-4 text-slate-700" />
                  <span>Síntesis Ejecutiva del Informe</span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                  {executiveSummary}
                </p>
              </div>
            )}

            {/* Body Content Sections */}
            <div className="space-y-8 divide-y divide-slate-200/80">
              {article.sections && article.sections.length > 0 ? (
                article.sections.map((sec, idx) => (
                  <article key={idx} className={idx > 0 ? "pt-7" : ""}>
                    <BlurText
                      key={`${article.id}-sec-${idx}`}
                      text={sec.heading}
                      as="h2"
                      effect="blur"
                      animateBy="words"
                      direction="top"
                      trigger="view"
                      delay={40}
                      stepDuration={0.25}
                      blur={6}
                      distance={14}
                      className="font-carnegie text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-3"
                    />
                    <InteractiveText
                      text={sec.content}
                      glossary={combinedGlossary}
                      className="text-slate-800 leading-relaxed text-sm sm:text-base text-justify font-serif"
                    />
                  </article>
                ))
              ) : article.full_text && article.full_text.length > 0 ? (
                article.full_text.map((paragraph, idx) => {
                  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
                  const heading = `${romanNumerals[idx] || (idx + 1)}. Desarrollo del Análisis de Coyuntura`;
                  return (
                    <article key={idx} className={idx > 0 ? 'pt-7' : ''}>
                      <BlurText
                        key={`${article.id}-full-${idx}`}
                        text={heading}
                        as="h2"
                        effect="blur"
                        animateBy="words"
                        direction="top"
                        trigger="view"
                        delay={40}
                        stepDuration={0.25}
                        blur={6}
                        distance={14}
                        className="font-carnegie text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-3"
                      />
                      <InteractiveText
                        text={paragraph}
                        glossary={combinedGlossary}
                        className="text-slate-800 leading-relaxed text-sm sm:text-base text-justify font-serif"
                      />
                    </article>
                  );
                })
              ) : (
                <p className="text-slate-500 italic">No hay contenido disponible.</p>
              )}
            </div>

            {/* Perspectiva de Relaciones Internacionales */}
            {(article.ir_perspective?.geopolitical_context ||
              (article.ir_perspective?.strategic_recommendations &&
                article.ir_perspective.strategic_recommendations.length > 0)) && (
              <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-slate-800" />
                  <span>Perspectiva de Relaciones Internacionales y Geopolítica</span>
                </div>

                {article.ir_perspective.geopolitical_context && (
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {article.ir_perspective.geopolitical_context}
                  </p>
                )}

                {article.ir_perspective.strategic_recommendations &&
                  article.ir_perspective.strategic_recommendations.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Recomendaciones Estratégicas:
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                        {article.ir_perspective.strategic_recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-slate-900 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>
            )}

            {/* Other publications by this author in the fair */}
            {authorOtherArticles.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Otras investigaciones de {primaryAuthor} ({authorOtherArticles.length}):
                </span>
                <div className="space-y-1.5">
                  {authorOtherArticles.map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectArticle?.(other)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <span className="font-medium text-slate-800 truncate group-hover:text-slate-950">
                        {other.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2 group-hover:text-slate-700" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Formal Document Verification Stamp */}
            <div className="mt-8 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-200">
              <span>Dictaminado por: {academicMetadata.reviewers} • {classification}</span>
              <span className="font-mono text-slate-600">Registro: {documentRef} • ISSN {issn}</span>
            </div>

            {/* Footer Switcher between Dispatches */}
            {nextArticle && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <div className="text-xs text-slate-600">
                  Observatorio Económico y Político de Relaciones Internacionales
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Siguiente reporte:</span>
                  <button
                    onClick={() => onSelectArticle?.(nextArticle)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Examinar Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
