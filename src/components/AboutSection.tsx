import React from 'react';
import { Award, BookOpen, Terminal, Sparkles, CheckCircle2, Code2, Users2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 py-6 sm:py-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Award className="w-4 h-4 text-emerald-600" />
          Feria Pedagógica Universitaria
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 font-sans">
          Sobre el Observatorio Editorial
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
          Un espacio de articulación académica entre la teoría de la economía política internacional y el pensamiento estratégico diplomático.
        </p>
      </div>

      {/* Mission & Purpose Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 font-sans">Propósito Académico</h3>
          <p className="text-sm text-slate-700 leading-relaxed font-sans">
            La Feria Pedagógica de la carrera de Relaciones Internacionales tiene por meta consolidar competencias de análisis crítico, prospectiva geopolítica y comunicación ejecutiva en estudiantes de grado. Cada artículo publicado es el resultado de un riguroso proceso de investigación sobre transformaciones geoeconómicas contemporáneas.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 w-fit">
            <Users2 className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 font-sans">Cátedras Participantes</h3>
          <ul className="space-y-2.5 text-sm text-slate-700">
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
      </div>

      {/* Technical Ingestion Pipeline Section for Students & Faculty */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-sans">
                Flujo Automatizado de Publicación (`/raw_inputs/`)
              </h3>
              <p className="text-xs text-slate-500">
                Mecanismo de ingesta estructurada para alumnos y coordinadores
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-white text-xs font-mono text-emerald-800 border border-slate-200 shadow-2xs">
            CI / CD Scripting
          </span>
        </div>

        <div className="space-y-4 text-sm text-slate-700 font-sans">
          <p>
            Para publicar un nuevo análisis, los estudiantes redactan un documento en formato Markdown o texto plano y lo depositan en la carpeta <code className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-slate-200 font-mono text-xs">/raw_inputs/</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs space-y-2 shadow-xs">
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                Comando Node.js:
              </div>
              <div className="p-2 rounded bg-slate-50 text-emerald-800 border border-slate-200 font-semibold">
                npm run ingest
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Ejecuta el parser en JavaScript y actualiza <span className="text-slate-700 font-semibold">src/data/news.json</span> al instante.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs space-y-2 shadow-xs">
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                Comando Python:
              </div>
              <div className="p-2 rounded bg-slate-50 text-blue-900 border border-slate-200 font-semibold">
                python scripts/ingest_news.py
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Script de ingesta en Python 3 con validación de secciones y extracción de glosario.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 shadow-xs">
            <strong className="text-slate-800 block">Esquema requerido en el archivo .md:</strong>
            <ul className="list-disc pl-5 space-y-1 font-sans">
              <li>Título H1 (<code className="text-emerald-700"># Título</code>) y metadatos (<code className="text-slate-700">**Región:**</code>, <code className="text-slate-700">**Tema:**</code>, <code className="text-slate-700">**Autores:**</code>).</li>
              <li>Secciones H2: <code className="text-slate-700">## Resumen Ejecutivo</code>, <code className="text-slate-700">## Cuerpo del Análisis</code>.</li>
              <li>Sección H2: <code className="text-slate-700">## Perspectiva de Relaciones Internacionales</code> con contexto y recomendaciones.</li>
              <li>Sección H2: <code className="text-slate-700">## Glosario</code> y <code className="text-slate-700">## Fuentes</code>.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Evaluation and Institutional Attribution */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center space-y-2 shadow-xs">
        <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
        <h4 className="text-base sm:text-lg font-semibold text-slate-900 font-sans">
          Comité Editorial & Evaluación Académica
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
          Plataforma desarrollada para la exposición pública de producciones académicas estudiantiles en el marco de las actividades de extensión universitaria de la Licenciatura en Relaciones Internacionales.
        </p>
      </div>
    </div>
  );
};
