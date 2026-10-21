import { Award, BookOpen, Terminal, Sparkles, CheckCircle2, Code2, Users2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export const AboutSection: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-4xl mx-auto space-y-10 sm:space-y-12 py-6 sm:py-8 font-sans"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-all duration-700 ease-out">
          <Award className="w-4 h-4 text-emerald-600" />
          Feria Pedagógica Universitaria
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 font-sans">
          Sobre el Observatorio Editorial
        </h2>
        <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] max-w-2xl mx-auto font-sans">
          Un espacio de articulación académica entre la teoría de la economía política internacional y el pensamiento estratégico diplomático.
        </p>
      </motion.div>

      {/* Mission & Purpose Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-700 ease-out space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 w-fit">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 font-sans">Propósito Académico</h3>
          <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
            La Feria Pedagógica de la carrera de Relaciones Internacionales tiene por meta consolidar competencias de análisis crítico, prospectiva geopolítica y comunicación ejecutiva en estudiantes de grado. Cada artículo publicado es el resultado de un riguroso proceso de investigación sobre transformaciones geoeconómicas contemporáneas.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-700 ease-out space-y-3">
          <div className="p-3 rounded-2xl bg-amber-50/90 text-amber-800 border border-amber-200/80 w-fit">
            <Users2 className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 font-sans">Cátedras Participantes</h3>
          <ul className="space-y-2.5 text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[16px]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Economía Política Internacional</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Teoría y Práctica del Comercio Internacional</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Procesos de Integración Regional y Bloques Económicos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Seminario de Geopolítica de los Recursos Estratégicos</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Technical Ingestion Pipeline Section for Students & Faculty */}
      <motion.section variants={itemVariants} className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 space-y-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)] transition-all duration-700 ease-out">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50/90 text-blue-700 border border-blue-200/80">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 font-sans">
                Flujo Automatizado de Publicación (`/entradas_crudos/`)
              </h3>
              <p className="text-xs text-slate-500">
                Mecanismo de ingesta estructurada para alumnos y coordinadores
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-white/90 text-xs font-mono text-emerald-800 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            CI / CD Scripting
          </span>
        </div>

        <div className="space-y-4 text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px] font-sans">
          <p>
            Para publicar un nuevo análisis, los estudiantes redactan un documento en formato PDF o Word y lo depositan en la carpeta <code className="px-2 py-0.5 rounded-lg bg-slate-100 text-emerald-800 border border-slate-200/60 font-mono text-xs">/entradas_crudos/</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 font-mono text-xs space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-slate-800 font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                Comando Node.js:
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-emerald-800 border border-slate-200/60 font-semibold">
                npm run ingest
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Ejecuta el parser en JavaScript y actualiza <span className="text-slate-700 font-semibold">src/data/news.json</span> al instante.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 font-mono text-xs space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-slate-800 font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                Comando Python:
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-blue-900 border border-slate-200/60 font-semibold">
                python standardize_news.py
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Script de ingesta con Groq LLM que estandariza PDFs y DOCX a formato editorial.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 text-xs sm:text-sm text-slate-600 space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <strong className="text-slate-900 font-semibold block">Estructura editorial estándar:</strong>
            <ul className="list-disc pl-5 space-y-1 font-sans">
              <li>Título H1 y metadatos (Región, Eje Temático, Autor y Matrícula).</li>
              <li>Secciones H2: Resumen Ejecutivo, Antecedentes y Desarrollo del Análisis.</li>
              <li>Sección H2: Perspectiva de Relaciones Internacionales con recomendaciones estratégicas.</li>
              <li>Variables Económicas Auditadas y Glosario Pedagógico.</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Evaluation and Institutional Attribution */}
      <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-center space-y-2 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)] transition-all duration-700 ease-out">
        <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
        <h4 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 font-sans">
          Comité Editorial & Evaluación Académica
        </h4>
        <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[16px] max-w-xl mx-auto font-sans">
          Plataforma desarrollada para la exposición pública de producciones académicas estudiantiles en el marco de las actividades de extensión universitaria de la Licenciatura en Relaciones Internacionales.
        </p>
      </motion.div>
    </motion.div>
  );
};
