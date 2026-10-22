// src/components/CarnegieEditorialGrid.tsx
import React from 'react';
import type { NewsArticle } from '../types/news';
import { getAuthorImage, getAuthorPhotoCrop } from '../data/authors';
import GlassSurface from './reactbits/GlassSurface';
import AnimatedContent from './reactbits/AnimatedContent';
import BlurText from './reactbits/BlurText';
import SpotlightCard from './reactbits/SpotlightCard';

interface Props {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectAuthor?: (author: string) => void;
}

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
      
      {/* 1. SECCIÓN ASIMÉTRICA PRINCIPAL (Lead + 3 notas laterales con AnimatedContent y SpotlightCard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
        
        {/* Noticia Principal (Lead - 7 columnas con AnimatedContent y SpotlightCard) */}
        {leadArticle && (
          <AnimatedContent
            distance={50}
            direction="vertical"
            duration={0.85}
            ease="power3.out"
            threshold={0.1}
            className="lg:col-span-7 h-full"
          >
            <SpotlightCard
              theme="light"
              spotlightColor="#004F8A"
              intensity={0.28}
              spotlightSize={360}
              softness={0.7}
              borderGlow={0.8}
              proximity={90}
              smoothing={0.25}
              flare={true}
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all cursor-pointer h-full"
              onClick={() => onSelectArticle(leadArticle)}
            >
              <div className="flex flex-col justify-between h-full group">
                <div>
                  {/* Contenedor de la Foto con Zoom sutil y encuadre del alumno */}
                  <div className="relative w-full overflow-hidden bg-slate-100 mb-4 rounded-xl border border-slate-200/80 aspect-[16/10] max-h-[380px]">
                    <img
                      src={leadImg}
                      alt={leadAuthor}
                      style={{
                        transform: `scale(${leadCrop?.zoom || 1}) translate(${leadCrop?.panX || 0}%, ${leadCrop?.panY || 0}%)`,
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-[#004F8A] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                      Investigación Destacada
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#004F8A]">
                      {leadArticle.topic || 'Análisis Especial'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">{leadArticle.region}</span>
                  </div>

                  {/* Título estilo Carnegie con subrayado al hover y efecto BlurText */}
                  <BlurText
                    text={leadArticle.title}
                    as="h2"
                    effect="blur"
                    animateBy="words"
                    direction="top"
                    delay={70}
                    stepDuration={0.3}
                    blur={8}
                    distance={18}
                    className="font-semibold text-2xl sm:text-[28px] text-[#111827] leading-[1.25] tracking-[-0.02em] underline-offset-4 decoration-2 decoration-[#004F8A] group-hover:underline"
                  />

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
              </div>
            </SpotlightCard>
          </AnimatedContent>
        )}

        {/* Lateral Asimétrico (5 columnas con AnimatedContent en cascada stagger y SpotlightCards) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <AnimatedContent
            distance={35}
            direction="vertical"
            duration={0.7}
            ease="power3.out"
            stagger={0.12}
            threshold={0.1}
            className="flex flex-col justify-between gap-4 h-full"
          >
            {sideArticles.map((article, idx) => {
              const hasThumbnail = idx === 0;
              const author = getPrimaryAuthor(article);
              const img = getStudentImage(article, author);
              const crop = article.photoCrop || getAuthorPhotoCrop(author);

              return (
                <SpotlightCard
                  key={article.id}
                  theme="light"
                  spotlightColor="#004F8A"
                  intensity={0.22}
                  spotlightSize={260}
                  softness={0.7}
                  borderGlow={0.7}
                  proximity={75}
                  smoothing={0.25}
                  flare={true}
                  className="rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col justify-between"
                  onClick={() => onSelectArticle(article)}
                >
                  <div className={`flex ${hasThumbnail ? 'gap-4 items-start' : 'flex-col'} h-full justify-between`}>
                    {hasThumbnail && (
                      <div className="w-24 sm:w-28 h-20 sm:h-24 flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200 relative rounded-lg">
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

                    <div className="flex-1 flex flex-col justify-between h-full">
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
                  </div>
                </SpotlightCard>
              );
            })}
          </AnimatedContent>
        </div>
      </div>

      {/* 2. BLOQUE EDITORIAL ASIMÉTRICO DE PURO TEXTO CON GLASSSURFACE + ANIMATEDCONTENT + SPOTLIGHTCARD */}
      {textOnlyArticles.length > 0 && (
        <div className="py-8 border-b border-slate-200">
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={24}
            displace={0.4}
            backgroundOpacity={0.06}
            className="w-full p-6 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
          >
            <AnimatedContent
              distance={35}
              direction="vertical"
              duration={0.75}
              ease="power3.out"
              stagger={0.1}
              threshold={0.1}
              className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {textOnlyArticles.map((item) => {
                const author = getPrimaryAuthor(item);
                return (
                  <SpotlightCard
                    key={item.id}
                    theme="light"
                    spotlightColor="#009EDB"
                    intensity={0.22}
                    spotlightSize={240}
                    softness={0.7}
                    borderGlow={0.65}
                    proximity={70}
                    smoothing={0.25}
                    flare={true}
                    className="rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
                    onClick={() => onSelectArticle(item)}
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
                  </SpotlightCard>
                );
              })}
            </AnimatedContent>
          </GlassSurface>
        </div>
      )}

      {/* 3. RESTO DE NOTICIAS EN CUADRÍCULA CON ANIMATEDCONTENT STAGGER Y SPOTLIGHTCARD */}
      {restArticles.length > 0 && (
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.75}
          ease="power3.out"
          stagger={0.08}
          threshold={0.05}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 w-full"
        >
          {restArticles.map((article) => {
            const author = getPrimaryAuthor(article);
            const img = getStudentImage(article, author);
            const crop = article.photoCrop || getAuthorPhotoCrop(author);

            return (
              <div key={article.id} className="h-full">
                <SpotlightCard
                  theme="light"
                  spotlightColor="#004F8A"
                  intensity={0.24}
                  spotlightSize={280}
                  softness={0.7}
                  borderGlow={0.75}
                  proximity={80}
                  smoothing={0.25}
                  flare={true}
                  className="rounded-2xl p-0 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col justify-between overflow-hidden group"
                  onClick={() => onSelectArticle(article)}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={img}
                        alt={author}
                        style={{
                          transform: `scale(${crop?.zoom || 1}) translate(${crop?.panX || 0}%, ${crop?.panY || 0}%)`,
                        }}
                        className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-[#002A54]/90 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm">
                        {article.topic}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
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
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </AnimatedContent>
      )}

    </div>
  );
};

export default CarnegieEditorialGrid;
