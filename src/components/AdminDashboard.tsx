import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Edit2,
  Archive,
  Trash2,
  Plus,
  Search,
  User,
  Calendar,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  Save,
  Sliders,
  Filter,
  ChevronDown,
  Layers,
  X,
  Check,
} from 'lucide-react';
import type { NewsArticle, PhotoCrop } from '../types/news';
import { getAdminUser, logout } from '../services/auth';
import { syncNewsToDisk } from '../services/storage';
import { EditArticleModal } from './EditArticleModal';
import { AUTHOR_PROFILES, getAuthorPhotoCrop, getAuthorImage, getAuthorProfile } from '../data/authors';

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
  onOpenCropper?: (author: string, image?: string, crop?: PhotoCrop) => void;
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
  onOpenCropper,
  showToast,
}) => {
  const adminUser = getAdminUser();
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'authors' | 'inventory' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<NewsArticle | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // States for Inventory & Name Reassignment/Normalization
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [reassigningArticle, setReassigningArticle] = useState<NewsArticle | null>(null);
  const [normalizeNameInput, setNormalizeNameInput] = useState('');
  const [propagateNameToAll, setPropagateNameToAll] = useState(true);

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

  // Extract unique authors across all registered profiles and catalog articles
  const uniqueAuthors = useMemo(() => {
    const map = new Map<string, {
      fullName: string;
      role: string;
      career: string;
      avatar: string;
      photoCrop: PhotoCrop;
      articleCount: number;
    }>();

    // 1. Official authors registered in AUTHOR_PROFILES
    Object.values(AUTHOR_PROFILES).forEach((p) => {
      const name = p.name.trim();
      if (!map.has(name)) {
        map.set(name, {
          fullName: name,
          role: p.role || 'Estudiante Investigadora',
          career: p.school || 'Relaciones Internacionales',
          avatar: getAuthorImage(name),
          photoCrop: getAuthorPhotoCrop(name),
          articleCount: 0,
        });
      }
    });

    // 2. Count articles and register any author in articles
    articles.forEach((art) => {
      const rawName = typeof art.authors?.[0] === 'string'
        ? art.authors[0].trim()
        : (art.authors?.[0] as any)?.name?.trim() || '';
      if (!rawName) return;

      const profile = getAuthorProfile(rawName);
      const canonicalName = profile?.name || rawName;

      if (!map.has(canonicalName)) {
        map.set(canonicalName, {
          fullName: canonicalName,
          role: art.author_role || profile?.role || 'Estudiante Investigador',
          career: profile?.school || 'Relaciones Internacionales',
          avatar: art.author_image || getAuthorImage(canonicalName),
          photoCrop: art.photoCrop || profile?.photoCrop || getAuthorPhotoCrop(canonicalName),
          articleCount: 1,
        });
      } else {
        const item = map.get(canonicalName)!;
        item.articleCount += 1;
        if (art.author_image && !item.avatar) {
          item.avatar = art.author_image;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.articleCount - a.articleCount || a.fullName.localeCompare(b.fullName));
  }, [articles]);

  // Filtered articles for the Inventory & Author Assignment view
  const inventoryFilteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const authorName = typeof art.authors?.[0] === 'string'
        ? art.authors[0].trim()
        : (art.authors?.[0] as any)?.name?.trim() || '';

      const matchesStudent =
        selectedStudentFilter === 'ALL' ||
        authorName.toLowerCase() === selectedStudentFilter.toLowerCase();

      const term = inventorySearchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        art.title.toLowerCase().includes(term) ||
        (art.topic || '').toLowerCase().includes(term) ||
        (art.region || '').toLowerCase().includes(term) ||
        authorName.toLowerCase().includes(term);

      return matchesStudent && matchesSearch;
    });
  }, [articles, selectedStudentFilter, inventorySearchTerm]);

  // Open Reassign / Normalize Author Modal
  const openReassignModal = (art: NewsArticle) => {
    setReassigningArticle(art);
    const authorName = typeof art.authors?.[0] === 'string'
      ? art.authors[0].trim()
      : (art.authors?.[0] as any)?.name?.trim() || '';
    setNormalizeNameInput(authorName);
    setPropagateNameToAll(true);
  };

  // Save changes from Author Reassignment / Normalization Modal
  const handleSaveNormalizedAuthor = async () => {
    if (!reassigningArticle || !normalizeNameInput.trim()) return;

    const previousName = typeof reassigningArticle.authors?.[0] === 'string'
      ? reassigningArticle.authors[0].trim()
      : (reassigningArticle.authors?.[0] as any)?.name?.trim() || '';
    const newName = normalizeNameInput.trim();

    const targetAvatar = getAuthorImage(newName);
    const targetCrop = getAuthorPhotoCrop(newName);

    const prevNorm = previousName.toLowerCase();
    const updatedArticles = articles.map((item) => {
      const isTarget = item.id === reassigningArticle.id;
      const itemName = typeof item.authors?.[0] === 'string'
        ? item.authors[0].trim().toLowerCase()
        : (item.authors?.[0] as any)?.name?.trim().toLowerCase() || '';
      const isSameAuthor = itemName === prevNorm;

      if (isTarget || (propagateNameToAll && isSameAuthor)) {
        return {
          ...item,
          authors: [newName],
          author_image: targetAvatar,
          photoCrop: targetCrop,
        };
      }
      return item;
    });

    if (onUpdateAllArticles) {
      await onUpdateAllArticles(updatedArticles);
    } else {
      for (const a of updatedArticles) {
        if (a.id === reassigningArticle.id || (propagateNameToAll && ((typeof a.authors?.[0] === 'string' ? a.authors[0] : (a.authors?.[0] as any)?.name)?.toLowerCase() === prevNorm))) {
          await onUpdateArticle(a);
        }
      }
    }

    setReassigningArticle(null);
    showToast(`✅ Autor reasignado y unificado a "${newName}" en el catálogo.`, 'success');
  };

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

  // Función en el Admin para guardar tanto la foto como los datos en el disco
  const handleSaveAll = async (
    updatedNews: NewsArticle[],
    newAvatarFile?: File,
    authorName?: string
  ) => {
    let finalAvatarUrl = '';

    // 1. Si se cargó un archivo de foto nuevo, se manda a guardar a public/authors
    if (newAvatarFile && authorName) {
      const reader = new FileReader();
      reader.readAsDataURL(newAvatarFile);
      await new Promise((resolve) => {
        reader.onloadend = async () => {
          const fileExt = newAvatarFile.name.split('.').pop() || 'jpg';
          const cleanSlug = authorName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-');
          const filename = `${cleanSlug}.${fileExt}`;

          try {
            const res = await fetch('/api/save-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename,
                base64Data: reader.result,
              }),
            });
            const data = await res.json();
            finalAvatarUrl = data.url; // e.g., '/authors/araceli-paredes.jpg'
          } catch (e) {
            console.error('Error guardando imagen:', e);
          }
          resolve(null);
        };
      });
    }

    // 2. Si se generó una URL de avatar nueva, se la asignamos a todas las noticias de ese autor
    let newsToSave = updatedNews;
    if (finalAvatarUrl && authorName) {
      newsToSave = updatedNews.map((item) => {
        const matchesAuthor = (item.authors || []).some((auth) => {
          const aName = typeof auth === 'string' ? auth : (auth as any)?.name || '';
          return aName.trim().toLowerCase() === authorName.trim().toLowerCase();
        });
        if (!matchesAuthor) return item;

        return {
          ...item,
          author_image: finalAvatarUrl,
          authors: (item.authors || []).map((auth: any) => {
            if (typeof auth === 'string') {
              return auth.trim().toLowerCase() === authorName.trim().toLowerCase() ? authorName : auth;
            }
            return auth?.name?.trim().toLowerCase() === authorName.trim().toLowerCase()
              ? { ...auth, avatar: finalAvatarUrl }
              : auth;
          }),
        };
      });
    }

    // 3. Escribir news.json en el disco duro
    try {
      const response = await fetch('/api/save-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsToSave, null, 2),
      });

      if (response.ok) {
        if (onUpdateAllArticles) {
          await onUpdateAllArticles(newsToSave);
        }
        setEditingArticle(null);
        showToast('✅ Cambios guardados permanentemente en el servidor local.', 'success');
      } else {
        showToast('❌ Ocurrió un error al guardar en disco.', 'error');
      }
    } catch (error) {
      console.error('Error al contactar la API local:', error);
      showToast('Error de conexión con el servidor local.', 'error');
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

          {/* Card Investigadores */}
          <div
            onClick={() => setActiveTab('authors')}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
              activeTab === 'authors'
                ? 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-2 ring-indigo-400/30'
                : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider font-mono">
                Investigadores
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {uniqueAuthors.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Encuadre y Retratos</p>
            </div>
          </div>

          {/* Card Inventario & Unificación */}
          <div
            onClick={() => setActiveTab('inventory')}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-100/90 border-slate-400 shadow-sm ring-2 ring-slate-400/20'
                : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                Inventario
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {articles.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Reasignar y Unificar</p>
            </div>
          </div>
        </div>

        {/* Tab Selector & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⏳ Pendientes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                {pendingArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'published'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>✅ Publicadas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                {publishedArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('authors')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'authors'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Investigadores & Retratos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
                {uniqueAuthors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Inventario & Asignación</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono">
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todas ({articles.length})</span>
            </button>
          </div>

          {/* Search Bar (active on pending, published, all) */}
          {activeTab !== 'authors' && activeTab !== 'inventory' && (
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
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INVESTIGADORES Y ENCUADRE FOTOGRÁFICO (STRICTLY ADMIN ONLY)       */}
        {/* ========================================================================= */}
        {activeTab === 'authors' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Investigadores Oficiales y Encuadre Fotográfico</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ajustá el zoom y la posición de la cabeza para garantizar rostros 100% nítidos en todas las noticias del estudiante.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {uniqueAuthors.length} Investigadores Registrados
              </span>
            </div>

            {/* List of Authors with Live Framing Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {uniqueAuthors.map((author) => {
                const crop = author.photoCrop || { zoom: 1, panX: 0, panY: 0 };
                return (
                  <div
                    key={author.fullName}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Live Crop Thumbnail Preview */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 select-none">
                        <div
                          className="w-full h-full relative"
                          style={{
                            transform: `scale(${crop.zoom}) translate(${crop.panX}px, ${crop.panY}px)`,
                            transformOrigin: 'top center',
                          }}
                        >
                          <img
                            src={author.avatar}
                            alt={author.fullName}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        {/* Soft corner indicator */}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                          {crop.zoom.toFixed(1)}x
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate" title={author.fullName}>
                          {author.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{author.career}</p>
                        <p className="text-[11px] font-semibold text-indigo-700 mt-1">
                          {author.articleCount} {author.articleCount === 1 ? 'dictamen publicado' : 'dictámenes publicados'}
                        </p>
                      </div>
                    </div>

                    {/* Exclusively located here in Admin: Subir y Encuadrar */}
                    <button
                      type="button"
                      onClick={() => onOpenCropper?.(author.fullName, author.avatar, crop)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-700 shadow-xs transition cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Subir y Encuadrar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INVENTARIO DE ARTÍCULOS Y REASIGNACIÓN DE AUTOR                   */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Inventario de Artículos y Asignación de Autores</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Filtrá por estudiante o renombrá nombres duplicados para unificarlos a los oficiales.
                </p>
              </div>

              {/* Search & Student Filter Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar dictamen o tema..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56 text-slate-800"
                  />
                </div>

                {/* Filter by Student Button with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      selectedStudentFilter !== 'ALL'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>
                      {selectedStudentFilter === 'ALL'
                        ? 'Filtrar por Alumno'
                        : selectedStudentFilter.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Filter Popover */}
                  {isFilterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentFilter('ALL');
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center justify-between cursor-pointer ${
                          selectedStudentFilter === 'ALL'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Mostrar Todos ({articles.length})</span>
                      </button>

                      <div className="h-[1px] bg-slate-100 my-1" />

                      <div className="max-h-56 overflow-y-auto space-y-0.5">
                        {uniqueAuthors.map((auth) => (
                          <button
                            key={auth.fullName}
                            type="button"
                            onClick={() => {
                              setSelectedStudentFilter(auth.fullName);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition cursor-pointer ${
                              selectedStudentFilter === auth.fullName
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate mr-2">{auth.fullName}</span>
                            <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded-full font-mono">
                              {auth.articleCount}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Artículo / Título</th>
                    <th className="py-3 px-4">Eje Temático</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Investigador Asignado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {inventoryFilteredArticles.map((art) => {
                    const artAuthor = typeof art.authors?.[0] === 'string'
                      ? art.authors[0]
                      : (art.authors?.[0] as any)?.name || 'Estudiante Investigador';
                    const artProfile = getAuthorProfile(artAuthor);
                    const artAvatar = art.author_image
                      || (typeof art.authors?.[0] === 'object' && (art.authors[0] as any)?.avatar)
                      || artProfile?.image
                      || getAuthorImage(artAuthor);

                    return (
                      <tr key={art.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                          <p className="line-clamp-2 leading-snug">{art.title}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold tracking-wide uppercase border border-slate-200">
                            {art.topic || art.thematicAxis || art.region}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {art.date}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={artAvatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover object-top border border-slate-300"
                            />
                            <span className="font-semibold text-slate-800">{artAuthor}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openReassignModal(art)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-200 text-slate-700 border border-slate-300 shadow-xs transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Reasignar / Unificar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ARTÍCULOS POR REVISAR / PUBLICADAS / TODAS                        */}
        {/* ========================================================================= */}
        {activeTab !== 'authors' && activeTab !== 'inventory' && (
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

                      {/* Button: Reasignar Autor */}
                      <button
                        onClick={() => openReassignModal(article)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                        title="Reasignar autor o unificar duplicados"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Reasignar</span>
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
        )}
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

      {/* 5. MODAL DE ASIGNACIÓN Y UNIFICACIÓN DE NOMBRES (STRICTLY ADMIN ONLY) */}
      {reassigningArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reasignar Autor y Unificar Duplicados
                </h3>
                <p className="text-xs text-slate-500">
                  Unificá la autoría para mantener la lista oficial de investigadores.
                </p>
              </div>
              <button
                onClick={() => setReassigningArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Dictamen que se está modificando
                </label>
                <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-2">
                  {reassigningArticle.title}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Elegir de entre los investigadores registrados
                </label>
                <select
                  value={normalizeNameInput}
                  onChange={(e) => setNormalizeNameInput(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Seleccionar investigador registrado --</option>
                  {uniqueAuthors.map((auth) => (
                    <option key={auth.fullName} value={auth.fullName}>
                      {auth.fullName} ({auth.articleCount} artículos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  O corregir / escribir nombre oficial exacto
                </label>
                <input
                  type="text"
                  value={normalizeNameInput}
                  onChange={(e) => setNormalizeNameInput(e.target.value)}
                  placeholder="Ej: Araceli Alejandra Paredes Sugastti"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propagateNameToAll}
                    onChange={(e) => setPropagateNameToAll(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-tight">
                    Unificar <strong>todas</strong> las noticias que tengan el autor anterior (
                    <span className="text-slate-800 font-bold">
                      {typeof reassigningArticle.authors?.[0] === 'string'
                        ? reassigningArticle.authors[0]
                        : (reassigningArticle.authors?.[0] as any)?.name}
                    </span>
                    ) a este nombre y su foto de perfil.
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReassigningArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNormalizedAuthor}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Guardar y Sincronizar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
