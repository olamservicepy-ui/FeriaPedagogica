import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Archive,
  Trash2,
  Plus,
  Search,
  User,
  Calendar,
  LogOut,
  ArrowLeft,
  FileText,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Save,
} from 'lucide-react';
import type { NewsArticle } from '../types/news';
import { getAdminUser, logout } from '../services/auth';
import { syncNewsToDisk } from '../services/storage';
import { EditArticleModal } from './EditArticleModal';

interface AdminDashboardProps {
  articles: NewsArticle[];
  onUpdateArticle: (article: NewsArticle) => Promise<void>;
  onUpdateAllArticles?: (articles: NewsArticle[]) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onClearAllArticles?: () => Promise<void>;
  onOpenCreateNew: () => void;
  onPreviewArticle: (article: NewsArticle) => void;
  onBackToHome: () => void;
  onLogout: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  onUpdateArticle,
  onUpdateAllArticles,
  onDeleteArticle,
  onClearAllArticles,
  onOpenCreateNew,
  onPreviewArticle,
  onBackToHome,
  onLogout,
  showToast,
}) => {
  const adminUser = getAdminUser();
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<NewsArticle | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncDisk = async () => {
    setIsSyncing(true);
    try {
      const res = await syncNewsToDisk(articles);
      if (res.success) {
        showToast(`Catálogo guardado en news.json exitosamente (${res.count || articles.length} artículos).`, 'success');
      } else {
        showToast(`Error al sincronizar: ${res.error || 'Intenta nuevamente'}`, 'error');
      }
    } catch {
      showToast('Error de conexión al sincronizar news.json', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Categorize articles by status (defaulting undefined to 'published' for legacy articles)
  const pendingArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'draft');
  }, [articles]);

  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published' || !a.status);
  }, [articles]);

  // Active articles list according to current tab
  const tabArticles = useMemo(() => {
    if (activeTab === 'pending') return pendingArticles;
    if (activeTab === 'published') return publishedArticles;
    return articles;
  }, [activeTab, pendingArticles, publishedArticles, articles]);

  // Filtered by search query
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabArticles;
    return tabArticles.filter((a) => {
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchAuthor = (a.authors || []).some((auth) => auth.toLowerCase().includes(q));
      const matchRegion = (a.region || '').toLowerCase().includes(q);
      const matchTopic = (a.topic || '').toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchRegion || matchTopic;
    });
  }, [tabArticles, searchQuery]);

  // Action: Approve (publish)
  const handleApprove = async (article: NewsArticle) => {
    setProcessingId(article.id);
    try {
      const updated: NewsArticle = {
        ...article,
        status: 'published',
      };
      await onUpdateArticle(updated);
      showToast(`¡Artículo "${article.title.slice(0, 45)}..." aprobado y publicado en portada!`, 'success');
    } catch {
      showToast('Error al aprobar el artículo.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Unpublish (pass to draft)
  const handleUnpublish = async (article: NewsArticle) => {
    setProcessingId(article.id);
    try {
      const updated: NewsArticle = {
        ...article,
        status: 'draft',
      };
      await onUpdateArticle(updated);
      showToast(`Artículo "${article.title.slice(0, 45)}..." movido a borrador.`, 'info');
    } catch {
      showToast('Error al cambiar el estado del artículo.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Delete confirmed
  const handleConfirmDelete = async () => {
    if (!confirmDeleteArticle) return;
    const id = confirmDeleteArticle.id;
    const title = confirmDeleteArticle.title;
    setProcessingId(id);
    try {
      await onDeleteArticle(id);
      showToast(`Artículo "${title.slice(0, 45)}..." eliminado correctamente.`, 'warning');
      setConfirmDeleteArticle(null);
    } catch {
      showToast('Error al eliminar el artículo.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Clear all articles confirmed
  const handleConfirmClearAll = async () => {
    if (!onClearAllArticles) return;
    try {
      await onClearAllArticles();
      showToast('Se han eliminado todas las noticias correctamente.', 'warning');
      setConfirmClearAll(false);
    } catch {
      showToast('Error al vaciar las noticias.', 'error');
    }
  };

  // Action: Save edits from modal
  const handleSaveModal = async (updated: NewsArticle) => {
    try {
      await onUpdateArticle(updated);
      setEditingArticle(null);
      showToast(`Cambios guardados con éxito para "${updated.title.slice(0, 45)}..."`, 'success');
    } catch {
      showToast('Error al guardar los cambios del artículo.', 'error');
    }
  };

  // Action: Save and propagate edits to all articles
  const handleSaveAll = async (updatedList: NewsArticle[]) => {
    try {
      if (onUpdateAllArticles) {
        await onUpdateAllArticles(updatedList);
      } else {
        await syncNewsToDisk(updatedList);
      }
      setEditingArticle(null);
      showToast(`¡Artículos guardados y unificados exitosamente (${updatedList.length} en catálogo)!`, 'success');
    } catch {
      showToast('Error al guardar y unificar las noticias.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Top Header Apple Style */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Volver a la portada del Observatorio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Moderación
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {adminUser?.email || 'admin@observatorio.edu'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight font-sans">
                Panel de Administración Editorial
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {articles.length > 0 && onClearAllArticles && (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                title="Eliminar todas las noticias guardadas"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Vaciar Noticias</span>
              </button>
            )}

            <button
              onClick={handleSyncDisk}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/90 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Guardar todos los cambios directamente en src/data/news.json"
            >
              <Save className="w-4 h-4 text-sky-600" />
              <span>{isSyncing ? 'Guardando...' : 'Guardar en news.json'}</span>
            </button>

            <button
              onClick={onOpenCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Redactar Noticia</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                onLogout();
                showToast('Sesión cerrada correctamente.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Cerrar Sesión de Administrador"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Pendientes */}
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-50/80 border-amber-300 shadow-sm ring-2 ring-amber-400/30'
                : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:border-amber-200 hover:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">
                Por Revisar
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {pendingArticles.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Pendientes de Aprobación</p>
            </div>
          </div>

          {/* Card Publicadas */}
          <div
            onClick={() => setActiveTab('published')}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
              activeTab === 'published'
                ? 'bg-emerald-50/80 border-emerald-300 shadow-sm ring-2 ring-emerald-400/30'
                : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider font-mono">
                En Portada
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {publishedArticles.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Artículos Visibles al Público</p>
            </div>
          </div>

          {/* Total Investigaciones */}
          <div
            onClick={() => setActiveTab('all')}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-100/90 border-slate-400 shadow-sm ring-2 ring-slate-400/20'
                : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                Inventario
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {articles.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total de Artículos en Base</p>
            </div>
          </div>

          {/* Acceso Rápido Portada */}
          <div
            onClick={onBackToHome}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Sitio Principal
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-2">
              <span className="text-sm font-semibold text-slate-900 block group-hover:text-emerald-800 transition-colors">
                Ver portada en vivo →
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Comprobar cómo ven los usuarios el portal.</p>
            </div>
          </div>
        </div>

        {/* Tab Selector & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⏳ Pendientes de Aprobación</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                {pendingArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'published'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>✅ Publicadas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                {publishedArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todas ({articles.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px] sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, autor o tema..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Content List Section */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {activeTab === 'pending'
                  ? 'No hay artículos pendientes de aprobación'
                  : 'No se encontraron artículos'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {activeTab === 'pending'
                  ? 'Todos los trabajos de los alumnos han sido moderados y aprobados para su exhibición pública.'
                  : 'Prueba cambiando los términos de búsqueda o revisa las otras pestañas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredArticles.map((article) => {
                const isDraft = article.status === 'draft';
                const isItemProcessing = processingId === article.id;

                return (
                  <div
                    key={article.id}
                    className="group relative rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    {/* Left: Article Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider font-mono border ${
                            isDraft
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isDraft ? '⏳ Pendiente / Borrador' : '✅ Publicada'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 uppercase tracking-wider">
                          {article.region}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
                          {article.topic}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug font-sans">
                        {article.title}
                      </h3>

                      {/* Authors & Summary Snippet */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.authors?.join(', ') || 'Autor Estudiante'}</span>
                        </div>
                        {article.glossary && article.glossary.length > 0 && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{article.glossary.length} conceptos en glosario</span>
                          </div>
                        )}
                      </div>

                      {/* Preview snippet of first bullet */}
                      {article.summary_bullets && article.summary_bullets[0] && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {article.summary_bullets[0]}
                        </p>
                      )}
                    </div>

                    {/* Right: Moderation Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                      {/* Button: Aprobar (if draft) */}
                      {isDraft && (
                        <button
                          onClick={() => handleApprove(article)}
                          disabled={isItemProcessing}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
                          title="Aprobar e incorporar a la portada principal"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobar</span>
                        </button>
                      )}

                      {/* Button: Despublicar (if published) */}
                      {!isDraft && (
                        <button
                          onClick={() => handleUnpublish(article)}
                          disabled={isItemProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                          title="Mover a borradores (ocultar de la portada)"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Despublicar</span>
                        </button>
                      )}

                      {/* Button: Editar */}
                      <button
                        onClick={() => setEditingArticle(article)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                        title="Editar metadatos, glosario y contenido"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {/* Button: Vista Previa */}
                      <button
                        onClick={() => onPreviewArticle(article)}
                        className="p-2 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Ver vista previa de lectura"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Button: Eliminar */}
                      <button
                        onClick={() => setConfirmDeleteArticle(article)}
                        className="p-2 rounded-2xl bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar artículo permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Article Modal */}
      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          allNews={articles}
          onClose={() => setEditingArticle(null)}
          onSave={handleSaveModal}
          onSaveAll={handleSaveAll}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                ¿Eliminar artículo definitivamente?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Estás por eliminar:{' '}
              <span className="font-semibold text-slate-800">
                "{confirmDeleteArticle.title}"
              </span>
              . Esta acción removerá el trabajo de la base de datos y de la portada pública.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDeleteArticle(null)}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Sí, Eliminar Artículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Articles Confirmation Dialog */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                ¿Eliminar todas las noticias guardadas?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Esta acción eliminará <span className="font-semibold text-slate-800">todos los artículos ({articles.length})</span> de la base de datos local y de la portada.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Sí, Vaciar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
