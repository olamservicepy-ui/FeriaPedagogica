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
  Sliders,
} from 'lucide-react';
import type { NewsArticle, GlossaryItem, PhotoCrop, KeyIndicator } from '../types/news';
import { getAuthorImage, getAuthorProfile, getAuthorPhotoCrop } from '../data/authors';
import { InteractiveText } from './InteractiveText';
import BlurText from './reactbits/BlurText';
import GradualBlur from './reactbits/GradualBlur';

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
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 380);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  if (!article) return null;

  // Primary Author Resolution
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

  // Filter other publications by the same author
  const authorOtherArticles = allArticles.filter(
    (a) => a.id !== article.id && a.authors?.some((auth: any) =>
      (typeof auth === 'string' ? auth : auth.name) === primaryAuthor
    )
  );

  // Find next article for pagination in footer
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1
    ? allArticles[currentIndex + 1]
    : allArticles[0] && allArticles[0].id !== article.id
      ? allArticles[0]
      : null;

  // Combine article glossary with global glossary
  const combinedGlossary = [...(article.glossary || []), ...allGlossary];

  // Reading time calculation
  const totalWords = (article.full_text?.join(' ') || '').split(/\s+/).length;
  const readTimeMinutes = article.read_time_minutes || Math.max(3, Math.ceil(totalWords / 160));

  const thematicAxis = article.thematicAxis || article.topic || "Integración Regional";
  const fieldName = article.region || "Relaciones Internacionales";

  // Institutional metadata
  const academicMetadata = {
    university: article.academicMetadata?.university || authorProfile?.institution || "Universidad Nacional de Itapúa",
    faculty: article.academicMetadata?.faculty || authorProfile?.faculty || "Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní",
    school: article.academicMetadata?.school || authorProfile?.school || "Licenciatura en Relaciones Internacionales",
    department: article.academicMetadata?.department || authorProfile?.department || "Observatorio Económico y Político Regional",
    location: article.academicMetadata?.location || authorProfile?.location || "Campus Universitario • Encarnación, Paraguay",
    reviewers: article.academicMetadata?.reviewers || authorProfile?.reviewers || "Cátedra de Economía Internacional IV",
    fairEdition: article.academicMetadata?.fairEdition || authorProfile?.fairEdition || "Feria Pedagógica Universitaria 2026"
  };

  const documentRef = article.documentRef || `UNI-FP26-RI-${String(article.id).padStart(3, '0')}`;
  const issn = article.issn || "2709-8435";
  const classification = article.classification || "Análisis Estratégico Homologado";

  // Indicators / Macro variables
  const indicators: KeyIndicator[] = (article.keyIndicators && article.keyIndicators.length > 0)
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

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto select-none sm:select-text transition-opacity duration-300 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in duration-300'
      }`}
    >
      {/* MAIN MODAL CONTAINER (DARK INSTITUTIONAL LUXURY) */}
      <div
        key={article.id}
        className={`w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col bg-zinc-950 rounded-3xl border border-white/15 shadow-2xl overflow-hidden relative text-slate-100 font-sans ${
          isClosing ? 'blur-out-contract' : 'blur-in-expand'
        }`}
      >
        
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR LIMPIA */}
        {/* ========================================================================= */}
        <div className="h-14 px-6 border-b border-white/10 bg-zinc-950/95 flex items-center justify-end shrink-0 z-20">
          <div className="flex items-center gap-2">
            
            {/* Botón Compartir */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg shadow-sm transition cursor-pointer"
              title="Copiar enlace"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{copiedLink ? "Copiado" : "Compartir"}</span>
            </button>

            {/* Botón Imprimir */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg shadow-sm transition cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>

            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

            {/* Botón Cerrar */}
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/20 rounded-lg shadow-sm transition cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <span>Cerrar</span>
              <X className="w-4 h-4 text-slate-300" />
            </button>

          </div>
        </div>

        {/* SCROLLABLE READING CANVAS */}
        <div className="flex-1 overflow-y-auto relative">

          {/* ========================================================================= */}
          {/* HERO BANNER CON FOTO Y DEGRADADO NO AGRESIVO HACIA NEGRO                  */}
          {/* ========================================================================= */}
          <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] bg-zinc-900 overflow-hidden select-none border-b border-white/10">
            
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

            {/* Degradado oscuro suave que no cubre los ojos del autor */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent via-15% pointer-events-none" />

            {/* Botón de ajuste rápido flotante en el Hero (Solo si onOpenCropper está habilitado) */}
            {onOpenCropper && (
              <div className="absolute top-5 right-6 z-20">
                <button
                  type="button"
                  onClick={() => onOpenCropper(primaryAuthor, authorPhoto, currentCrop)}
                  className="flex items-center gap-1.5 bg-black/85 hover:bg-black text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-white/20 backdrop-blur-md transition cursor-pointer"
                  title="Ajustar encuadre o cambiar foto de esta investigadora"
                >
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ajustar Encuadre / Zoom</span>
                </button>
              </div>
            )}

            {/* Categoría arriba */}
            <div className="absolute top-5 left-6 z-10 pointer-events-none">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-black/85 text-sky-300 shadow-sm border border-sky-400/30 backdrop-blur-md">
                {thematicAxis}
              </span>
            </div>

            {/* ZONA INFERIOR DEL HERO: FECHA, TITULO Y PASTILLA DE AUTOR */}
            <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-6 pt-6 z-10">
              <div className="max-w-4xl space-y-3">
                
                {/* Metadatos de Lectura */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-md border border-white/15 backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {article.date || "Septiembre de 2026"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-md border border-white/15 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {readTimeMinutes} min de lectura técnica
                  </span>
                  <span className="text-slate-400 font-medium">
                    • {fieldName}
                  </span>
                </div>

                {/* Titular Principal con BlurText */}
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
                  className="font-carnegie font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight"
                />

                {/* Pastilla del Investigador en la Portada */}
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAuthor?.(primaryAuthor);
                      handleClose();
                    }}
                    className="flex items-center gap-2.5 bg-black/85 px-3 py-1.5 rounded-xl border border-white/15 shadow-sm backdrop-blur-md hover:bg-zinc-900 transition cursor-pointer"
                    title={`Filtrar publicaciones de ${primaryAuthor}`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0">
                      <img
                        src={authorPhoto}
                        alt={primaryAuthor}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-none">
                        {primaryAuthor}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">
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
              <p className="text-base sm:text-lg text-white leading-relaxed font-normal border-l-4 border-sky-500 pl-4 bg-zinc-900/60 py-2 rounded-r-lg font-editorial">
                {leadText}
              </p>
            )}

            {/* Official Macroeconomic / Indicator Grid */}
            <section aria-label="Indicadores Clave" className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Variables Económicas Auditadas por la Investigación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {indicators.map((item, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/80 border border-white/10 p-3.5 rounded-xl hover:border-sky-500/30 transition"
                  >
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-white mt-1 tracking-tight">
                      {item.value}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Executive Summary Statement Box */}
            {executiveSummary && (
              <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <BookMarked className="w-4 h-4 text-sky-400" />
                  <span>Síntesis Ejecutiva del Informe</span>
                </div>
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  {executiveSummary}
                </p>
              </div>
            )}

            {/* Body Content Sections */}
            <div className="space-y-8 divide-y divide-white/10">
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
                      className="font-carnegie text-lg sm:text-xl font-bold text-white tracking-tight mb-3"
                    />
                    <InteractiveText
                      text={sec.content}
                      glossary={combinedGlossary}
                      className="text-white leading-relaxed text-sm sm:text-base text-justify font-serif"
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
                        className="font-carnegie text-lg sm:text-xl font-bold text-white tracking-tight mb-3"
                      />
                      <InteractiveText
                        text={paragraph}
                        glossary={combinedGlossary}
                        className="text-white leading-relaxed text-sm sm:text-base text-justify font-serif"
                      />
                    </article>
                  );
                })
              ) : (
                <p className="text-slate-400 italic">No hay contenido disponible.</p>
              )}
            </div>

            {/* Perspectiva de Relaciones Internacionales */}
            {(article.ir_perspective?.geopolitical_context ||
              (article.ir_perspective?.strategic_recommendations &&
                article.ir_perspective.strategic_recommendations.length > 0)) && (
              <section className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Perspectiva de Relaciones Internacionales y Geopolítica</span>
                </div>

                {article.ir_perspective.geopolitical_context && (
                  <p className="text-white text-sm leading-relaxed">
                    {article.ir_perspective.geopolitical_context}
                  </p>
                )}

                {article.ir_perspective.strategic_recommendations &&
                  article.ir_perspective.strategic_recommendations.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                        Recomendaciones Estratégicas:
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-white">
                        {article.ir_perspective.strategic_recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-sky-400 font-bold">•</span>
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
              <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Otras investigaciones de {primaryAuthor} ({authorOtherArticles.length}):
                </span>
                <div className="space-y-1.5">
                  {authorOtherArticles.map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectArticle?.(other)}
                      className="w-full text-left p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-sky-500/40 hover:bg-zinc-900 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <span className="font-medium text-slate-200 truncate group-hover:text-white">
                        {other.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2 group-hover:text-sky-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Formal Document Verification Stamp */}
            <div className="mt-8 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-white/10">
              <span>Dictaminado por: {academicMetadata.reviewers} • {classification}</span>
              <span className="font-mono text-slate-400">Registro: {documentRef} • ISSN {issn}</span>
            </div>

            {/* Footer Switcher between Dispatches */}
            {nextArticle && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="text-xs text-slate-400">
                  Observatorio Económico y Político de Relaciones Internacionales
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Siguiente reporte:</span>
                  <button
                    onClick={() => onSelectArticle?.(nextArticle)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <span>Examinar Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Gradual blur at the bottom of the modal scroll area */}
          <GradualBlur
            position="bottom"
            height="4.5rem"
            strength={2}
            layers={8}
            curve="ease-out"
            exponential={true}
            tint="rgba(9, 9, 11, 0.85)"
            autoHide={true}
            zIndex={15}
          />

        </div>

      </div>
    </div>
  );
};

export default NewsDetailModal;
