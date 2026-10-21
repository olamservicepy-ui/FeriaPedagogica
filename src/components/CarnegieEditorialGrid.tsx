// src/components/CarnegieEditorialGrid.tsx
import React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { NewsArticle } from '../types/news';
import { getAuthorImage, getAuthorPhotoCrop } from '../data/authors';

interface Props {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectAuthor?: (author: string) => void;
}

// Animación de aparición gradual al hacer scroll
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Función auxiliar para obtener el nombre principal del autor
const getPrimaryAuthor = (article: NewsArticle): string => {
  if (!article.authors || article.authors.length === 0) return 'Equipo Editorial';
  const first = article.authors[0];
  return typeof first === 'string' ? first : (first as any)?.name || 'Equipo Editorial';
};

// Función auxiliar para resolver la foto correcta del estudiante
const getStudentImage = (article: NewsArticle, authorName: string): string => {
  return article.author_image || getAuthorImage(authorName) || '/placeholder.jpg';
};

export const CarnegieEditorialGrid: React.FC<Props> = ({ articles, onSelectArticle }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No se encontraron investigaciones disponibles.
      </div>
    );
  }

  const leadArticle = articles[0];
  const sideArticles = articles.slice(1, 4);
  const textOnlyArticles = articles.slice(4, 7);
  const restArticles = articles.slice(7);

  // Datos del Lead
  const leadAuthor = getPrimaryAuthor(leadArticle);
  const leadImg = getStudentImage(leadArticle, leadAuthor);
  const leadCrop = leadArticle.photoCrop || getAuthorPhotoCrop(leadAuthor);

  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      
      {/* 1. SECCIÓN ASIMÉTRICA PRINCIPAL (Lead + 3 notas laterales) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
        
        {/* Noticia Principal (Lead - 7 columnas) */}
        {leadArticle && (
          <motion.article
            variants={cardVariants}
            onClick={() => onSelectArticle(leadArticle)}
            className="group cursor-pointer lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              {/* Contenedor de la Foto con Zoom sutil y encuadre del alumno */}
              <div className="relative w-full overflow-hidden bg-slate-100 mb-4 border border-slate-200 aspect-[16/10] max-h-[380px]">
                <img
                  src={leadImg}
                  alt={leadAuthor}
                  style={{
                    transform: `scale(${leadCrop?.zoom || 1}) translate(${leadCrop?.panX || 0}%, ${leadCrop?.panY || 0}%)`,
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#004F8A]">
                  {leadArticle.topic || 'Análisis Especial'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{leadArticle.region}</span>
              </div>

              {/* Título estilo Carnegie con subrayado al hover */}
              <h2 className="font-bold text-2xl sm:text-3xl text-[#1A2530] leading-snug tracking-tight underline-offset-4 decoration-2 decoration-[#004F8A] group-hover:underline">
                {leadArticle.title}
              </h2>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                {leadArticle.summary_bullets?.[0] || leadArticle.title}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                {leadAuthor}
              </span>
              <span>{leadArticle.date || 'Edición 2026'} • 3 MIN READ</span>
            </div>
          </motion.article>
        )}

        {/* Lateral Asimétrico (5 columnas: 1 con foto miniatura + 2 de solo texto) */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-200">
          {sideArticles.map((article, idx) => {
            const hasThumbnail = idx === 0;
            const author = getPrimaryAuthor(article);
            const img = getStudentImage(article, author);
            const crop = article.photoCrop || getAuthorPhotoCrop(author);

            return (
              <motion.article
                key={article.id}
                variants={cardVariants}
                onClick={() => onSelectArticle(article)}
                className={`group cursor-pointer py-4 first:pt-0 last:pb-0 ${
                  hasThumbnail ? 'flex gap-4' : 'flex flex-col'
                }`}
              >
                {hasThumbnail && (
                  <div className="w-28 sm:w-32 h-24 flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img
                      src={img}
                      alt={author}
                      style={{
                        transform: `scale(${crop?.zoom || 1}) translate(${crop?.panX || 0}%, ${crop?.panY || 0}%)`,
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#004F8A]">
                      {article.topic || 'Comentario'}
                    </span>
                    <h3 className="font-bold text-base text-[#1A2530] leading-snug mt-1 underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                      {article.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {author}
                    </span>
                    <span>3 MIN READ</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* 2. BLOQUE EDITORIAL ASIMÉTRICO DE PURO TEXTO */}
      {textOnlyArticles.length > 0 && (
        <div className="py-8 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {textOnlyArticles.map((item, idx) => {
              const author = getPrimaryAuthor(item);
              return (
                <motion.article
                  key={item.id}
                  variants={cardVariants}
                  onClick={() => onSelectArticle(item)}
                  className={`group cursor-pointer flex flex-col justify-between ${
                    idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-[#004F8A]">
                        {item.topic || 'Dictamen'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">{item.region}</span>
                    </div>
                    <h4 className="font-bold text-base text-[#1A2530] leading-snug underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.summary_bullets?.[0] || item.title}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{author}</span>
                    <span>2 MIN READ</span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. RESTO DE NOTICIAS EN CUADRÍCULA CON FOTO */}
      {restArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {restArticles.map((article) => {
            const author = getPrimaryAuthor(article);
            const img = getStudentImage(article, author);
            const crop = article.photoCrop || getAuthorPhotoCrop(author);

            return (
              <motion.article
                key={article.id}
                variants={cardVariants}
                onClick={() => onSelectArticle(article)}
                className="group cursor-pointer flex flex-col justify-between bg-white border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={img}
                    alt={author}
                    style={{
                      transform: `scale(${crop?.zoom || 1}) translate(${crop?.panX || 0}%, ${crop?.panY || 0}%)`,
                    }}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-[#002A54]/90 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5">
                    {article.topic}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-bold text-base text-[#1A2530] leading-snug underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                      {article.title}
                    </h4>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {article.summary_bullets?.[0] || article.title}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{author}</span>
                    <span>{article.date || 'Edición 2026'}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CarnegieEditorialGrid;
