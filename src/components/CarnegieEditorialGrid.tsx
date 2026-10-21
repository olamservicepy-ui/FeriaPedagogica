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
  type?: 'Commentary' | 'Article' | 'Paper' | string; // Formato diplomático
  hasImage?: boolean; // Permite alternar notas con foto y solo texto
  [key: string]: any;
}

interface Props {
  articles: (Article | NewsArticle | any)[];
  onSelectArticle: (article: any) => void;
  onSelectAuthor?: (author: string) => void;
}

export const CarnegieEditorialGrid: React.FC<Props> = ({
  articles,
  onSelectArticle,
  onSelectAuthor,
}) => {
  const [activeCategory, setActiveCategory] = useState('TODAS');

  const categories = ['TODAS', 'POLÍTICA EXTERIOR', 'MACROECONOMÍA', 'GEOPOLÍTICA', 'ENERGÍA'];

  // Normalizador transparente para Article y NewsArticle
  const normalizedArticles = articles.map((article, idx) => {
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

    const category = (article.category || article.thematicAxis || article.topic || article.region || 'POLÍTICA EXTERIOR').toUpperCase();
    const summary = article.summary || article.lead || article.summary_bullets?.[0] || '';
    const readTime = article.readTime || `${article.read_time_minutes || 3} MINUTE READ`;
    const date = article.date || '';

    // Asignación de formato diplomático estilo Carnegie
    const types = ['Commentary', 'Policy Paper', 'Análisis Especial', 'Diplomatic Brief'];
    const type = article.type || types[idx % types.length];

    return {
      raw: article,
      id: article.id,
      title: article.title,
      summary,
      category,
      date,
      readTime,
      type,
      authorName,
      authorAvatar,
      crop,
      allAuthors: article.authors || [],
    };
  });

  const filtered = activeCategory === 'TODAS'
    ? normalizedArticles
    : normalizedArticles.filter((a) => {
        const cat = a.category.toUpperCase();
        const search = activeCategory.toUpperCase();
        return cat.includes(search) || search.includes(cat);
      });

  if (!filtered.length) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        No se encontraron investigaciones para la sección <span className="font-bold text-[#004070]">{activeCategory}</span>.
      </div>
    );
  }

  // Desestructuración editorial asimétrica estilo Carnegie
  const leadArticle = filtered[0];          // Gran noticia con foto
  const sideArticles = filtered.slice(1, 4); // Mezcla de texto con y sin foto
  const textOnlyList = filtered.slice(4, 7); // Bloque exclusivo de análisis solo texto
  const standardGrid = filtered.slice(7);    // Resto del archivo

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white text-[#222529]">
      
      {/* 1. Barra de Secciones en Azul Regal Carnegie (#004070) */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#004070]">
            Investigaciones:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors pb-1 border-b-2 cursor-pointer ${
                activeCategory === cat
                  ? 'border-[#004070] text-[#004070]'
                  : 'border-transparent text-slate-500 hover:text-[#004070]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline text-xs text-slate-400 font-medium">
          Observatorio Económico de Relaciones Internacionales
        </span>
      </div>

      {/* 2. BLOQUE PRINCIPAL ASIMÉTRICO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 pb-10 border-b border-slate-200">
        
        {/* COLUMNA IZQUIERDA: Lead con Foto de Alumno (7 cols) */}
        {leadArticle && (
          <article
            onClick={() => onSelectArticle(leadArticle.raw)}
            className="group cursor-pointer lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 mb-4 border border-slate-100">
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
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#004070]">
                  {leadArticle.type || 'Análisis Especial'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  {leadArticle.category}
                </span>
              </div>

              <h2 className="font-carnegie font-bold text-2xl sm:text-3xl text-[#222529] leading-snug tracking-tight underline-offset-4 decoration-2 decoration-[#004070] group-hover:underline">
                {leadArticle.title}
              </h2>

              <p className="mt-3 text-sm text-[#475569] leading-relaxed line-clamp-3">
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
                className="font-semibold text-[#222529] hover:text-[#004070] transition-colors"
              >
                {leadArticle.authorName}
              </button>
              <span>{leadArticle.date} • {leadArticle.readTime}</span>
            </div>
          </article>
        )}

        {/* COLUMNA DERECHA: ASIMÉTRICA (5 cols)
            Alterna 1 noticia con foto chica y notas de SOLO TÍTULO estilo Carnegie */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-200">
          {sideArticles.map((article, idx) => {
            const showThumbnail = idx === 0; // Solo la primera del lateral lleva foto chica
            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article.raw)}
                className={`group cursor-pointer py-4 first:pt-0 last:pb-0 ${
                  showThumbnail ? 'flex gap-4' : 'flex flex-col'
                }`}
              >
                {showThumbnail && (
                  <div className="w-28 h-24 flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-100 relative">
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
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#004070]">
                      {article.type || 'Commentary'}
                    </span>
                    <h3 className="font-carnegie font-bold text-base sm:text-lg text-[#222529] leading-snug mt-1 underline-offset-2 decoration-1 decoration-[#004070] group-hover:underline">
                      {article.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
                    <span className="font-medium text-[#222529]">
                      {article.authorName}
                    </span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* 3. FILA ASIMÉTRICA DE PURO TEXTO / ANÁLISIS RÁPIDO (Estilo columnas Carnegie) */}
      {textOnlyList.length > 0 && (
        <div className="mb-10 pb-10 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {textOnlyList.map((article, idx) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article.raw)}
                className={`group cursor-pointer pt-6 md:pt-0 ${idx > 0 ? 'md:pl-8' : ''} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#004070]">
                      {article.type || 'Commentary'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-carnegie font-bold text-lg text-[#222529] leading-snug tracking-tight underline-offset-2 decoration-1 decoration-[#004070] group-hover:underline">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#475569] leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-[#222529]">
                    {article.authorName}
                  </span>
                  <span>{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESTO DEL ARCHIVO / GRILLA ESTÁNDAR (3 Columnas con foto y texto) */}
      {standardGrid.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardGrid.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.raw)}
              className="group cursor-pointer flex flex-col justify-between border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow rounded-none"
            >
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 mb-3 border border-slate-100">
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
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#004070]">
                    {article.type || 'Policy Paper'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                    {article.category}
                  </span>
                </div>
                <h4 className="font-carnegie font-bold text-base text-[#222529] leading-snug line-clamp-2 underline-offset-2 decoration-1 decoration-[#004070] group-hover:underline">
                  {article.title}
                </h4>
                <p className="mt-2 text-xs text-[#475569] leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-[#222529] truncate max-w-[140px]">
                  {article.authorName}
                </span>
                <span>{article.date}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
