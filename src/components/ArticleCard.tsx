import React from 'react';
import SpotlightCard from './reactbits/SpotlightCard';

export interface Author {
  name: string;
  avatar?: string;
}

export interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    category?: string;
    date: string;
    readTime?: string;
    coverImage?: string;
    authors?: Author[];
  };
  onClick: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const author = article.authors?.[0];
  const displayImage = author?.avatar || article.coverImage || '/placeholder.jpg';

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
      onClick={onClick}
    >
      {/* 1. Contenedor de la Imagen con Zoom sutil al hover */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-900">
        <img
          src={displayImage}
          alt={article.title}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* 2. Cuerpo Editorial */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* Píldora de Categoría / Tipo de contenido */}
          <div className="inline-block">
            <span className="text-[11px] font-bold tracking-widest uppercase text-sky-300 bg-zinc-900 px-2.5 py-1 rounded-md border border-white/10">
              {article.category || 'EXPERT COMMENT'}
            </span>
          </div>

          {/* Título: Tipografía Carnegie + Subrayado animado al hover en cualquier parte de la tarjeta */}
          <h3 className="font-carnegie font-bold text-xl sm:text-2xl text-white leading-snug tracking-tight underline-offset-4 decoration-2 decoration-sky-400 group-hover:underline">
            {article.title}
          </h3>

          {/* Resumen institucional */}
          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {article.summary}
          </p>
        </div>

        {/* Metadatos inferiores (Fecha y Tiempo de lectura en mayúsculas sobrias) */}
        <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime || '3 MINUTE READ'}</span>
        </div>
      </div>
    </SpotlightCard>
  );
};
