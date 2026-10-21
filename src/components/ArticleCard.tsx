import React from 'react';

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
    <article
      onClick={onClick}
      className="group cursor-pointer flex flex-col bg-white border border-slate-200/90 rounded-none overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      {/* 1. Contenedor de la Imagen con Zoom sutil al hover */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
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
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-700 bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200">
              {article.category || 'EXPERT COMMENT'}
            </span>
          </div>

          {/* Título: Tipografía Carnegie + Subrayado animado al hover en cualquier parte de la tarjeta */}
          <h3 className="font-carnegie font-bold text-xl sm:text-2xl text-slate-900 leading-snug tracking-tight underline-offset-4 decoration-2 decoration-slate-900 group-hover:underline">
            {article.title}
          </h3>

          {/* Resumen institucional */}
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
            {article.summary}
          </p>
        </div>

        {/* Metadatos inferiores (Fecha y Tiempo de lectura en mayúsculas sobrias) */}
        <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime || '3 MINUTE READ'}</span>
        </div>
      </div>
    </article>
  );
};
