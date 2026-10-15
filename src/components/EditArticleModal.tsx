import React, { useState } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  User,
  FileText
} from 'lucide-react';
import type { NewsArticle, GlossaryItem } from '../types/news';

interface EditArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
  onSave: (updatedArticle: NewsArticle) => void;
}

const REGIONS = [
  'Cono Sur',
  'América Latina',
  'Global',
  'Asia-Pacífico',
  'Unión Europea',
  'Norteamérica',
  'África & Medio Oriente'
];

const TOPICS = [
  'Comercio',
  'Energía',
  'Geopolítica',
  'Política Monetaria',
  'Integración Regional',
  'Alimentos',
  'Finanzas',
  'Tecnología'
];

export const EditArticleModal: React.FC<EditArticleModalProps> = ({
  article,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(article.title || '');
  const [region, setRegion] = useState(article.region || 'Cono Sur');
  const [topic, setTopic] = useState(article.topic || 'Comercio');
  const [date, setDate] = useState(article.date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'draft' | 'published'>(article.status || 'published');
  
  // Authors
  const [authors, setAuthors] = useState<string[]>(
    article.authors && article.authors.length > 0 ? [...article.authors] : ['Estudiante de Relaciones Internacionales']
  );
  const [newAuthorInput, setNewAuthorInput] = useState('');
  const [authorRole, setAuthorRole] = useState(article.author_role || 'Investigación académica • Estudiantes de Relaciones Internacionales');
  const [authorImage, setAuthorImage] = useState(article.author_image || '/authors/sofia-valenzuela.jpg');

  // Summary bullets
  const [summaryBullets, setSummaryBullets] = useState<string[]>(
    article.summary_bullets && article.summary_bullets.length > 0
      ? [...article.summary_bullets]
      : ['']
  );

  // Full text paragraphs
  const [fullText, setFullText] = useState<string>(
    Array.isArray(article.full_text) ? article.full_text.join('\n\n') : (article.full_text || '')
  );

  // Dynamic Glossary
  const [glossary, setGlossary] = useState<GlossaryItem[]>(
    article.glossary && article.glossary.length > 0 ? [...article.glossary] : []
  );

  // IR Perspective
  const [geopoliticalContext, setGeopoliticalContext] = useState(
    article.ir_perspective?.geopolitical_context || ''
  );
  const [strategicRecommendations, setStrategicRecommendations] = useState<string[]>(
    article.ir_perspective?.strategic_recommendations && article.ir_perspective.strategic_recommendations.length > 0
      ? [...article.ir_perspective.strategic_recommendations]
      : ['']
  );

  // Sources
  const [sources, setSources] = useState<string[]>(
    article.sources && article.sources.length > 0 ? [...article.sources] : ['']
  );

  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'glossary' | 'ir'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for authors
  const handleAddAuthor = () => {
    if (newAuthorInput.trim()) {
      setAuthors([...authors, newAuthorInput.trim()]);
      setNewAuthorInput('');
    }
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  // Handlers for summary bullets
  const handleBulletChange = (idx: number, value: string) => {
    const updated = [...summaryBullets];
    updated[idx] = value;
    setSummaryBullets(updated);
  };

  const handleAddBullet = () => {
    setSummaryBullets([...summaryBullets, '']);
  };

  const handleRemoveBullet = (idx: number) => {
    setSummaryBullets(summaryBullets.filter((_, i) => i !== idx));
  };

  // Handlers for glossary
  const handleGlossaryChange = (idx: number, field: 'term' | 'definition', value: string) => {
    const updated = [...glossary];
    updated[idx] = { ...updated[idx], [field]: value };
    setGlossary(updated);
  };

  const handleAddGlossaryItem = () => {
    setGlossary([...glossary, { term: '', definition: '' }]);
  };

  const handleRemoveGlossaryItem = (idx: number) => {
    setGlossary(glossary.filter((_, i) => i !== idx));
  };

  // Handlers for recommendations
  const handleRecommendationChange = (idx: number, value: string) => {
    const updated = [...strategicRecommendations];
    updated[idx] = value;
    setStrategicRecommendations(updated);
  };

  const handleAddRecommendation = () => {
    setStrategicRecommendations([...strategicRecommendations, '']);
  };

  const handleRemoveRecommendation = (idx: number) => {
    setStrategicRecommendations(strategicRecommendations.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const paragraphs = fullText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updatedArticle: NewsArticle = {
      ...article,
      title: title.trim(),
      region,
      topic,
      date,
      status,
      authors: authors.filter((a) => a.trim().length > 0),
      author_role: authorRole.trim(),
      author_image: authorImage.trim(),
      summary_bullets: summaryBullets.map((b) => b.trim()).filter((b) => b.length > 0),
      full_text: paragraphs.length > 0 ? paragraphs : [title],
      glossary: glossary.filter((g) => g.term.trim().length > 0 && g.definition.trim().length > 0),
      ir_perspective: {
        geopolitical_context: geopoliticalContext.trim(),
        strategic_recommendations: strategicRecommendations
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
      },
      sources: sources.map((s) => s.trim()).filter((s) => s.length > 0),
    };

    onSave(updatedArticle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/40 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#F8F9FA] border border-white/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/80 shrink-0">
              <FileText className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Modo Edición Editorial
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {status === 'published' ? '● Publicada' : '⏳ Pendiente / Borrador'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate font-sans">
                {title || 'Editar Artículo'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar sin guardar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-white/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Metadatos & Autores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Resumen & Cuerpo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'glossary'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Glosario ({glossary.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ir')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ir'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Perspectiva RR.II.
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: METADATOS & AUTORES */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Título Principal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Título del Artículo *
                </label>
                <textarea
                  required
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título analítico y riguroso..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Grid: Estado, Región, Eje, Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Selector de Estado */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Estado de Publicación</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="published">✅ Publicada (Visible en portada)</option>
                    <option value="draft">⏳ Borrador / En Revisión</option>
                  </select>
                </div>

                {/* Región */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Región Geoeconómica</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Eje Temático */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Eje Temático</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Fecha de Publicación</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Autores */}
              <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Estudiantes Investigadores / Autores
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{authors.length} autor(es)</span>
                </div>

                {/* Pills de autores */}
                <div className="flex flex-wrap gap-2">
                  {authors.map((auth, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{auth}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Añadir nuevo autor */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newAuthorInput}
                    onChange={(e) => setNewAuthorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAuthor();
                      }
                    }}
                    placeholder="Agregar nombre del estudiante..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddAuthor}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>

                {/* Rol de autor & Imagen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Filiación o Rol</label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="Investigación académica • Alumna RI"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">URL / Ruta Foto de Autor</label>
                    <input
                      type="text"
                      value={authorImage}
                      onChange={(e) => setAuthorImage(e.target.value)}
                      placeholder="/authors/sofia-valenzuela.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fuentes */}
              <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800">Fuentes Citadas</label>
                <input
                  type="text"
                  value={sources.join(', ')}
                  onChange={(e) => setSources(e.target.value.split(',').map((s) => s.trim()))}
                  placeholder="BCP, FAO, Última Hora, Reuters..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
                <span className="text-[11px] text-slate-400">Separa las fuentes con comas.</span>
              </div>
            </div>
          )}

          {/* TAB 2: RESUMEN EJECUTIVO & CUERPO */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Resumen ejecutivo bullets */}
              <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      Puntos Clave del Resumen Ejecutivo
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Sintetizan los hallazgos esenciales del informe de los alumnos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200/60 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Punto</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {summaryBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-mono shrink-0 mt-2">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        placeholder="Escribe el punto clave..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                      {summaryBullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuerpo del Artículo */}
              <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Cuerpo del Artículo (Párrafos)
                  </label>
                  <span className="text-[11px] text-slate-400">Separa párrafos con doble salto de línea</span>
                </div>
                <textarea
                  rows={10}
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  placeholder="Redacta el análisis completo o pega el desarrollo del informe de los alumnos..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 3: GLOSARIO DINÁMICO */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Conceptos y Glosario Pedagógico</h3>
                  <p className="text-xs text-slate-500">
                    Definiciones que se integrarán en el glosario interactivo del portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGlossaryItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Concepto</span>
                </button>
              </div>

              {glossary.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 text-slate-400 text-xs">
                  No hay términos de glosario definidos para este artículo. Haz clic en "Añadir Concepto" para crear uno.
                </div>
              ) : (
                <div className="space-y-3">
                  {glossary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
                            Término / Concepto
                          </label>
                          <input
                            type="text"
                            value={item.term}
                            onChange={(e) => handleGlossaryChange(idx, 'term', e.target.value)}
                            placeholder="ej: EMBI, Tasa de Política Monetaria, Trato Especial..."
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGlossaryItem(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer mt-4"
                          title="Eliminar término"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
                          Definición Pedagógica
                        </label>
                        <textarea
                          rows={2}
                          value={item.definition}
                          onChange={(e) => handleGlossaryChange(idx, 'definition', e.target.value)}
                          placeholder="Definición clara, académica y rigurosa..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PERSPECTIVA RR.II. */}
          {activeTab === 'ir' && (
            <div className="space-y-6">
              {/* Contexto Geopolítico */}
              <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800">
                  Contexto Geopolítico & Equilibrio de Poder
                </label>
                <p className="text-[11px] text-slate-400">
                  Análisis de interdependencia, diplomacia económica o impacto sistémico redactado por el alumno.
                </p>
                <textarea
                  rows={4}
                  value={geopoliticalContext}
                  onChange={(e) => setGeopoliticalContext(e.target.value)}
                  placeholder="Explica las dinámicas de poder, tratados internacionales o vulnerabilidades..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Recomendaciones Estratégicas */}
              <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                      Recomendaciones Estratégicas
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Propuestas formuladas para la política exterior o actores multilaterales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRecommendation}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200/60 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {strategicRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-2">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={rec}
                        onChange={(e) => handleRecommendationChange(idx, e.target.value)}
                        placeholder="Recomendación estratégica para diplomacia o política comercial..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                      {strategicRecommendations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRecommendation(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="sticky bottom-0 pt-4 -mx-6 -mb-6 px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">
              ID: <span className="font-semibold text-slate-700">{article.id}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300 ease-out cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
