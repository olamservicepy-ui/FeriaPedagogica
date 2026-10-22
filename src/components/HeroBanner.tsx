import { Search, Compass, Globe, X } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import GlassSurface from './reactbits/GlassSurface';
import BlurText from './reactbits/BlurText';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  articlesCount: number;
  glossaryCount: number;
  regionsCount: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  articlesCount,
  glossaryCount,
  regionsCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-20 md:pb-20 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC]">
      {/* Aceternity UI Style Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 relative z-10"
      >
        {/* Top Tag */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <GlassSurface
            width="auto"
            height={38}
            borderRadius={19}
            displace={0.4}
            backgroundOpacity={0.12}
            className="px-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 inline-flex"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-sans">Feria Pedagógica Universitaria de Relaciones Internacionales</span>
            </div>
          </GlassSurface>
        </motion.div>

        {/* Main Headline with BlurText */}
        <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
          <BlurText
            text="Análisis de Economía Internacional & Geopolítica Global"
            as="h1"
            effect="blur"
            animateBy="words"
            direction="top"
            delay={90}
            stepDuration={0.35}
            blur={12}
            distance={28}
            className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 font-sans leading-tight break-words justify-center"
          />
          <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] max-w-2xl mx-auto font-sans">
            Plataforma de divulgación académica y pensamiento estratégico elaborada por estudiantes. Investigaciones coyunturales, perspectiva de relaciones internacionales y glosario conceptual interactivo.
          </p>
        </motion.div>

        {/* Real-time Search Input with Aceternity Glow */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto relative pt-1 sm:pt-2">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4.5 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none shrink-0 transition-colors duration-700 ease-out" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema, país, autor (ej: 'BRICS', 'litio', 'Mercosur')..."
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3.5 sm:py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] focus:shadow-[0_12px_36px_-8px_rgba(16,185,129,0.12)] transition-all duration-700 ease-out text-[15px] sm:text-[16px] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-700 ease-out"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Statistics Pill Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 text-xs sm:text-sm text-slate-600 font-sans"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all duration-700 ease-out">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-900 font-bold">{articlesCount}</span>
            <span>Artículos</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all duration-700 ease-out">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-900 font-bold">{glossaryCount}</span>
            <span>Términos conceptuales</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all duration-700 ease-out">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-900 font-bold">{regionsCount}</span>
            <span>Regiones geoeconómicas</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
