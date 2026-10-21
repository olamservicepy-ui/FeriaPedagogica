import React, { useState } from 'react';
import type { NewsArticle, PhotoCrop } from '../types/news';
import { getAuthorImage, getAuthorPhotoCrop } from '../data/authors';

export interface Author {
  name: string;
  avatar?: string;
  role?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  authors: (Author | string)[];
  isFeatured?: boolean;
  coverImage?: string;
  [key: string]: any;
}

interface EditorialBentoGridProps {
  articles: (Article | NewsArticle | any)[];
  onSelectArticle: (article: any) => void;
  onSelectAuthor?: (author: string) => void;
}

export const EditorialBentoGrid: React.FC<EditorialBentoGridProps> = ({
  articles,
  onSelectArticle,
  onSelectAuthor,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('TODAS');

  const categories = [
    'TODAS',
    'MACROECONOMÍA',
    'GEOPOLÍTICA',
    'COMERCIO EXTERIOR',
    'POLÍTICA MONETARIA',
  ];

  // Normalizador flexible para soportar tanto Article como NewsArticle
  const normalizedArticles = articles.map((article) => {
    const rawAuthor = article.authors?.[0];
    const authorName = typeof rawAuthor === 'string'
      ? rawAuthor
      : rawAuthor?.name || 'Investigador';

    const authorAvatar = (typeof rawAuthor === 'object' && rawAuthor?.avatar)
      || article.author_image
      || article.coverImage
      || getAuthorImage(authorName);

    const crop: PhotoCrop = article.photoCrop
      || getAuthorPhotoCrop(authorName)
      || { zoom: 1, panX: 0, panY: 0 };

    const category = (article.category || article.thematicAxis || article.topic || article.region || 'ANÁLISIS COYUNTURAL').toUpperCase();
    const summary = article.summary || article.lead || article.summary_bullets?.[0] || '';
    const readTime = article.readTime || `${article.read_time_minutes || 3} MINUTE READ`;
    const date = article.date || '';

    return {
      raw: article,
      id: article.id,
      title: article.title,
      summary,
      category,
      date,
      readTime,
      authorName,
      authorAvatar,
      crop,
      allAuthors: article.authors || [],
    };
  });

  const filteredArticles = filterCategory === 'TODAS'
    ? normalizedArticles
    : normalizedArticles.filter((a) => {
        const cat = a.category?.toUpperCase() || '';
        const searchCat = filterCategory.toUpperCase();
        return cat.includes(searchCat) || searchCat.includes(cat);
      });

  if (!filteredArticles.length) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        No se encontraron investigaciones para la sección <span className="font-bold text-slate-800">{filterCategory}</span>.
      </div>
    );
  }

  // Separamos la destacada principal del resto
  const leadArticle = filteredArticles[0];
  const sideArticles = filteredArticles.slice(1, 4); // 3 noticias compactas horizontales
  const bottomArticles = filteredArticles.slice(4);  // El resto en tarjetas compactas

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Barra de Filtros por Categoría */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
          Secciones:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              filterCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* BLOQUE ASIMÉTRICO PRINCIPAL (Entran 4 noticias en el primer golpe de vista) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* 1. NOTICIA PRINCIPAL / LEAD (Ocupa 7 de 12 columnas) */}
        {leadArticle && (
          <article
            onClick={() => onSelectArticle(leadArticle.raw)}
            className="group cursor-pointer lg:col-span-7 flex flex-col bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 rounded-none"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
              <div
                className="w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-105"
                style={{
                  transform: `scale(${leadArticle.crop.zoom}) translate(${leadArticle.crop.panX}px, ${leadArticle.crop.panY}px)`,
                  transformOrigin: 'top center',
                }}
              >
                <img
                  src={leadArticle.authorAvatar || '/placeholder.jpg'}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
                {leadArticle.category}
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
              <div>
                <h2 className="font-semibold text-2xl sm:text-[28px] text-[#111827] leading-[1.25] tracking-[-0.02em] underline-offset-4 decoration-2 decoration-[#004F8A] group-hover:underline">
                  {leadArticle.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                  {leadArticle.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAuthor?.(leadArticle.authorName);
                  }}
                  className="font-semibold text-slate-700 hover:text-sky-800 transition-colors"
                >
                  {leadArticle.authorName}
                </button>
                <span>{leadArticle.date} • {leadArticle.readTime}</span>
              </div>
            </div>
          </article>
        )}

        {/* 2. LATERAL DERECHO: 3 NOTICIAS HORIZONTALES COMPACTAS (Ocupa 5 de 12 columnas) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {sideArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.raw)}
              className="group cursor-pointer flex gap-4 p-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all rounded-none"
            >
              {/* Foto chica a la izquierda con zoom */}
              <div className="w-28 sm:w-32 h-24 flex-shrink-0 overflow-hidden bg-slate-100 relative">
                <div
                  className="w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{
                    transform: `scale(${article.crop.zoom}) translate(${article.crop.panX}px, ${article.crop.panY}px)`,
                    transformOrigin: 'top center',
                  }}
                >
                  <img
                    src={article.authorAvatar || '/placeholder.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Contenido derecho */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    {article.category}
                  </span>
                  <h3 className="font-carnegie font-bold text-sm text-slate-900 leading-tight line-clamp-2 mt-1 underline-offset-2 decoration-1 group-hover:underline">
                    {article.title}
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span className="truncate max-w-[120px] font-medium text-slate-600">
                    {article.authorName}
                  </span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 3. PARTE INFERIOR: TARJETAS COMPACTAS (3 columnas densas para no scrollear mucho) */}
      {bottomArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bottomArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.raw)}
              className="group cursor-pointer flex flex-col bg-white border border-slate-200 hover:shadow-md transition-shadow rounded-none"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                <div
                  className="w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{
                    transform: `scale(${article.crop.zoom}) translate(${article.crop.panX}px, ${article.crop.panY}px)`,
                    transformOrigin: 'top center',
                  }}
                >
                  <img
                    src={article.authorAvatar || '/placeholder.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="absolute top-2 left-2 bg-white/95 text-slate-800 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 border border-slate-200 z-10">
                  {article.category}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-carnegie font-bold text-base text-slate-900 leading-snug line-clamp-2 underline-offset-4 decoration-1 group-hover:underline">
                    {article.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {article.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[140px]">
                    {article.authorName}
                  </span>
                  <span>{article.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
