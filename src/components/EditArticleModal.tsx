import React, { useState, useMemo } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  FileText,
  Upload,
  Users
} from 'lucide-react';
import type { NewsArticle, GlossaryItem } from '../types/news';

interface EditArticleModalProps {
  article: NewsArticle;
  allNews?: NewsArticle[];
  onClose: () => void;
  onSave: (updatedArticle: NewsArticle) => void;
  onSaveAll?: (updatedNews: NewsArticle[]) => void;
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
  allNews = [],
  onClose,
  onSave,
  onSaveAll,
}) => {
  const [title, setTitle] = useState(article.title || '');
  const [region, setRegion] = useState(article.region || 'América Latina');
  const [topic, setTopic] = useState(article.topic || 'Comercio');
  const [date, setDate] = useState(article.date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'draft' | 'published'>(article.status || 'published');

  // 1. Extraer los autores únicos existentes y su foto actual de todas las noticias
  const existingAuthorsMap = useMemo(() => {
    const map = new Map<string, string>();
    allNews.forEach((item) => {
      const authList = Array.isArray(item.authors) ? item.authors : [item.authors || ''];
      authList.forEach((auth: any) => {
        const cleanName = (typeof auth === 'string' ? auth : auth?.name || '').trim();
        if (cleanName && !map.has(cleanName)) {
          const avatar = item.author_image || (typeof auth === 'object' ? auth?.avatar : '') || '';
          map.set(cleanName, avatar);
        }
      });
    });
    return map;
  }, [allNews]);

  const authorsList = useMemo(
    () => Array.from(existingAuthorsMap.keys()).sort((a, b) => a.localeCompare(b)),
    [existingAuthorsMap]
  );

  const initialAuthorName = (article.authors && article.authors.length > 0)
    ? (typeof article.authors[0] === 'string' ? article.authors[0] : (article.authors[0] as any)?.name || '')
    : '';

  const [selectedAuthorName, setSelectedAuthorName] = useState<string>(initialAuthorName);
  const [customAuthorName, setCustomAuthorName] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [authorAvatar, setAuthorAvatar] = useState<string>(
    article.author_image || existingAuthorsMap.get(initialAuthorName) || ''
  );
  const [authorRole, setAuthorRole] = useState(
    article.author_role || 'Estudiante Investigador • Relaciones Internacionales'
  );
  const [propagateToAll, setPropagateToAll] = useState<boolean>(true);

  // Manejar cambio en el selector de autor
  const handleSelectAuthor = (name: string) => {
    if (name === '__new__') {
      setIsCreatingNew(true);
      setSelectedAuthorName('');
    } else {
      setIsCreatingNew(false);
      setSelectedAuthorName(name);
      const existingAvatar = existingAuthorsMap.get(name);
      if (existingAvatar) {
        setAuthorAvatar(existingAvatar);
      }
    }
  };

  // Subida de imagen en base64 para vista previa inmediata
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAuthorAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

    const finalAuthorName = (isCreatingNew ? customAuthorName : selectedAuthorName).trim();
    if (!finalAuthorName) {
      alert('Por favor selecciona o escribe el nombre del autor.');
      setIsSubmitting(false);
      return;
    }

    const previousAuthorName = initialAuthorName.trim();
    const finalAvatar = authorAvatar.trim() || article.author_image || '/authors/sofia-valenzuela.jpg';

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
      authors: [finalAuthorName],
      author_role: authorRole.trim(),
      author_image: finalAvatar,
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

    // Propagar unificación a todas las noticias de este autor si está activado
    if (propagateToAll && allNews && allNews.length > 0 && onSaveAll) {
      const updatedArticles = allNews.map((item) => {
        if (item.id === updatedArticle.id) {
          return updatedArticle;
        }

        const matchesPrevious = previousAuthorName && (item.authors || []).some(
          (a) => (typeof a === 'string' ? a : (a as any)?.name || '').trim().toLowerCase() === previousAuthorName.toLowerCase()
        );
        const matchesTarget = finalAuthorName && (item.authors || []).some(
          (a) => (typeof a === 'string' ? a : (a as any)?.name || '').trim().toLowerCase() === finalAuthorName.toLowerCase()
        );

        if (matchesPrevious || matchesTarget) {
          return {
            ...item,
            authors: (item.authors || []).map((a) => {
              const nameStr = typeof a === 'string' ? a : (a as any)?.name || '';
              if (
                (previousAuthorName && nameStr.trim().toLowerCase() === previousAuthorName.toLowerCase()) ||
                (finalAuthorName && nameStr.trim().toLowerCase() === finalAuthorName.toLowerCase())
              ) {
                return finalAuthorName;
              }
              return nameStr;
            }),
            author_image: finalAvatar || item.author_image,
          };
        }

        return item;
      });

      onSaveAll(updatedArticles);
    } else {
      onSave(updatedArticle);
    }

    onClose();
  };

  const currentDisplayAuthor = isCreatingNew ? customAuthorName : selectedAuthorName;

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
            Metadatos & Autor
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
          {/* TAB 1: METADATOS & AUTOR */}
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
                  placeholder="Título analítico y periodístico..."
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

              {/* SECCIÓN AVANZADA: ASIGNACIÓN Y UNIFICACIÓN DE AUTOR Y FOTO */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Autoría, Foto y Unificación de Catálogo
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {authorsList.length} autores registrados
                  </span>
                </div>

                {/* Foto y Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                  <div className="relative shrink-0">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt="Foto del autor"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl border-2 border-emerald-300">
                        {currentDisplayAuthor ? currentDisplayAuthor[0]?.toUpperCase() : '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Foto del Autor / Investigador
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Subir foto desde PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={authorAvatar}
                        onChange={(e) => setAuthorAvatar(e.target.value)}
                        placeholder="O pega una URL de foto..."
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Puedes subir un archivo de imagen directo (JPG, PNG) o ingresar una ruta/URL.
                    </p>
                  </div>
                </div>

                {/* Selectores de Autor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Etiquetar de la lista de autores existentes
                    </label>
                    <select
                      value={isCreatingNew ? '__new__' : selectedAuthorName}
                      onChange={(e) => handleSelectAuthor(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    >
                      <option value="" disabled>Seleccionar estudiante...</option>
                      {authorsList.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option value="__new__">+ Escribir nombre nuevo / corregir...</option>
                    </select>
                  </div>

                  {isCreatingNew ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-emerald-700">
                        Nuevo Nombre Oficial del Alumno
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Araceli Alejandra Paredes Sugastti"
                        value={customAuthorName}
                        onChange={(e) => setCustomAuthorName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-emerald-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Filiación o Rol Institucional
                      </label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="Estudiante Investigador • Relaciones Internacionales"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Checkbox de Unificación Automática */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="propagateToAll"
                    checked={propagateToAll}
                    onChange={(e) => setPropagateToAll(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="propagateToAll" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
                    <strong>Unificar automáticamente:</strong> Aplicar este nombre oficial y foto a{' '}
                    <span className="text-emerald-800 font-semibold underline decoration-emerald-300">
                      todas las noticias del catálogo
                    </span>{' '}
                    que pertenezcan a <strong>{initialAuthorName || 'este autor'}</strong>.
                  </label>
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
                    <label className="block text-xs font-semibold text-slate-800">Puntos Clave del Resumen</label>
                    <span className="text-[11px] text-slate-400">Balas sintéticas que explican la noticia en portada</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200/60 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {summaryBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        placeholder="Punto analítico clave..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                      {summaryBullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desarrollo Completo (Párrafos) */}
              <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Cuerpo Analítico de la Noticia
                  </label>
                  <span className="text-[11px] text-slate-400">Separa párrafos con doble salto de línea</span>
                </div>
                <textarea
                  rows={10}
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  placeholder="Redacta el análisis en profundidad con datos, contexto y conclusiones..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* TAB 3: GLOSARIO PEDAGÓGICO */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Términos Económicos y Conceptos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aparecerán resaltados interactivamente para los lectores en el texto del artículo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGlossaryItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200/60 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Término</span>
                </button>
              </div>

              {glossary.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-500 text-xs">
                  No hay términos en el glosario para este artículo. Haz clic en "Nuevo Término" para añadir uno.
                </div>
              ) : (
                <div className="space-y-3">
                  {glossary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Concepto #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGlossaryItem(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Término / Sigla</label>
                          <input
                            type="text"
                            value={item.term}
                            onChange={(e) => handleGlossaryChange(idx, 'term', e.target.value)}
                            placeholder="Ej: Tasa de Política Monetaria (TPM)"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Definición Pedagógica</label>
                          <textarea
                            rows={2}
                            value={item.definition}
                            onChange={(e) => handleGlossaryChange(idx, 'definition', e.target.value)}
                            placeholder="Definición clara y accesible para estudiantes..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
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
              {/* Contexto geopolítico */}
              <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800">
                  Impacto Geopolítico y Dinámicas de Poder
                </label>
                <textarea
                  rows={4}
                  value={geopoliticalContext}
                  onChange={(e) => setGeopoliticalContext(e.target.value)}
                  placeholder="Explica cómo esta noticia influye en las relaciones internacionales, alianzas o soberanía..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Recomendaciones estratégicas */}
              <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Recomendaciones Estratégicas de Política Exterior
                    </label>
                    <span className="text-[11px] text-slate-400">Propuestas de acción para Cancillería o Comercio Exterior</span>
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
                <span>{propagateToAll ? 'Guardar y Unificar' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
