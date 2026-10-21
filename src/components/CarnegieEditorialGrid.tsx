// src/components/CarnegieEditorialGrid.tsx
import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { getAuthorImage } from '../data/authors';

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
  type?: string;
  author_image?: string;
  [key: string]: any;
}

interface Props {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onSelectAuthor?: (author: string) => void;
}

// Animación de aparición ascendente por elemento
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const getAuthorName = (art: Article): string => {
  const first = art.authors?.[0];
  if (typeof first === 'string') return first;
  return first?.name || 'Investigador';
};

const getAuthorAvatar = (art: Article): string => {
  const first = art.authors?.[0];
  const name = typeof first === 'string' ? first : first?.name || '';
  return (
    (typeof first === 'object' && first?.avatar) ||
    art.author_image ||
    art.coverImage ||
    getAuthorImage(name) ||
    '/placeholder.jpg'
  );
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

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      
      {/* 1. SECCIÓN ASIMÉTRICA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
        
        {/* Noticia Principal */}
        {leadArticle && (
          <motion.article
            variants={cardVariants}
            onClick={() => onSelectArticle(leadArticle)}
            className="group cursor-pointer lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full overflow-hidden bg-slate-100 mb-4 border border-slate-200 aspect-video max-h-[380px]">
                <img
                  src={getAuthorAvatar(leadArticle)}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#004F8A]">
                  {leadArticle.type || 'Análisis Especial'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{leadArticle.category}</span>
              </div>

              <h2 className="font-bold text-2xl sm:text-3xl text-[#1A2530] leading-snug tracking-tight underline-offset-4 decoration-2 decoration-[#004F8A] group-hover:underline">
                {leadArticle.title}
              </h2>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                {leadArticle.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                {getAuthorName(leadArticle)}
              </span>
              <span>{leadArticle.date} • {leadArticle.readTime || '3 MIN READ'}</span>
            </div>
          </motion.article>
        )}

        {/* Lateral Asimétrico */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-200">
          {sideArticles.map((article, idx) => {
            const hasThumbnail = idx === 0;
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
                  <div className="w-28 sm:w-32 h-24 flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={getAuthorAvatar(article)}
                      alt={article.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#004F8A]">
                      {article.type || 'Commentary'}
                    </span>
                    <h3 className="font-bold text-base text-[#1A2530] leading-snug mt-1 underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                      {article.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {getAuthorName(article)}
                    </span>
                    <span>{article.readTime || '3 MIN READ'}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* 2. BLOQUE EDITORIAL SOLO TEXTO */}
      {textOnlyArticles.length > 0 && (
        <div className="py-8 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {textOnlyArticles.map((item, idx) => (
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
                      {item.type || 'Paper'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">{item.category}</span>
                  </div>
                  <h4 className="font-bold text-base text-[#1A2530] leading-snug underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">{getAuthorName(item)}</span>
                  <span>{item.readTime || '3 MIN READ'}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* 3. RESTO DE NOTICIAS EN CUADRÍCULA */}
      {restArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {restArticles.map((article) => (
            <motion.article
              key={article.id}
              variants={cardVariants}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer flex flex-col justify-between bg-white border border-slate-200 p-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004F8A]">
                  {article.category}
                </span>
                <h4 className="font-bold text-base text-[#1A2530] leading-snug mt-1 underline-offset-2 decoration-1 decoration-[#004F8A] group-hover:underline">
                  {article.title}
                </h4>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{getAuthorName(article)}</span>
                <span>{article.date}</span>
              </div>
            </motion.article>
          ))}
        </div>
      )}

    </div>
  );
};

export default CarnegieEditorialGrid;
