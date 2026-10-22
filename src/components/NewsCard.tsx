import React from 'react';
import { ArrowUpRight, Sliders } from 'lucide-react';
import type { NewsArticle, PhotoCrop } from '../types/news';
import { getAuthorImage, getAuthorProfile, getAuthorPhotoCrop } from '../data/authors';

import SpotlightCard from './reactbits/SpotlightCard';

interface NewsCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  onSelectAuthor?: (author: string) => void;
  onOpenCropper?: (author: string, image: string, crop: PhotoCrop) => void;
  selectedAuthor?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelect,
  onSelectAuthor,
  onOpenCropper,
  selectedAuthor,
}) => {

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
  const readTimeMinutes = article.read_time_minutes || Math.max(2, Math.ceil(totalWords / 160));

  const primaryAuthor = typeof article.authors?.[0] === 'string'
    ? article.authors[0]
    : (article.authors?.[0] as any)?.name || 'Estudiante Investigador';

  const authorProfile = getAuthorProfile(primaryAuthor);
  const authorImg = article.author_image
    || (typeof article.authors?.[0] === 'object' && (article.authors[0] as any)?.avatar)
    || authorProfile?.image
    || getAuthorImage(primaryAuthor);

  const crop: PhotoCrop = article.photoCrop
    || authorProfile?.photoCrop
    || getAuthorPhotoCrop(primaryAuthor);

  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="#38bdf8"
      intensity={0.28}
      spotlightSize={280}
      softness={0.7}
      borderGlow={0.8}
      proximity={80}
      smoothing={0.25}
      flare={true}
      className="group cursor-pointer flex flex-col border border-white/10 bg-zinc-950 rounded-2xl p-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-sky-500/30 text-slate-100"
      onClick={() => onSelect(article)}
    >
      {/* 1. Contenedor de la Imagen con Zoom sutil al hover */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-900 select-none border-b border-white/10">
        <div
          className="w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-105"
          style={{
            transform: `scale(${crop.zoom}) translate(${crop.panX}px, ${crop.panY}px)`,
            transformOrigin: 'top center',
          }}
        >
          <img
            src={authorImg}
            alt={primaryAuthor}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Botón rápido para encuadrar foto */}
        {onOpenCropper && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCropper(primaryAuthor, authorImg, crop);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-black text-slate-200 hover:text-white shadow-sm border border-white/20 backdrop-blur-sm transition cursor-pointer z-10"
            title={`Ajustar encuadre de ${primaryAuthor}`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Cuerpo Editorial */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* Píldora de Categoría / Tipo de contenido */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-sky-300 bg-zinc-900 px-2.5 py-1 rounded-md border border-white/10">
              {article.thematicAxis || article.topic || 'ANÁLISIS COYUNTURAL'}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {article.region}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-carnegie font-bold text-xl sm:text-2xl text-white leading-snug tracking-tight underline-offset-4 decoration-2 decoration-sky-400 group-hover:underline">
            {article.title}
          </h3>

          {/* Resumen institucional */}
          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {article.lead || (article.summary_bullets && article.summary_bullets[0]) || ''}
          </p>
        </div>

        {/* Metadatos inferiores y Fila de Investigador */}
        <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>{formatDate(article.date).toUpperCase()}</span>
            <span>•</span>
            <span>{readTimeMinutes} MINUTE READ</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 truncate max-w-[70%]">
              <span className="text-slate-400 font-medium">Por:</span>
              <div className="truncate flex items-center gap-1 font-semibold text-slate-200">
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
                        className={`truncate transition-colors hover:underline cursor-pointer ${
                          isSelected
                            ? 'text-sky-400 font-bold underline'
                            : 'hover:text-sky-300 text-slate-300'
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

            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0">
              Leer análisis
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
