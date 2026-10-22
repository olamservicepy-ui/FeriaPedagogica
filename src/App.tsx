import { useState, useMemo, useEffect, useCallback } from 'react';
import newsData from './data/news.json';
import type { NewsArticle, GlossaryItem, PhotoCrop } from './types/news';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CarnegieEditorialGrid } from './components/CarnegieEditorialGrid';
import { NewsDetailModal } from './components/NewsDetailModal';
import { GlobalGlossary } from './components/GlobalGlossary';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { AdminPublishForm } from './components/AdminPublishForm';
import { AIAssistantModal } from './components/AIAssistantModal';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/AdminDashboard';
import { ToastNotification, type ToastMessage } from './components/ToastNotification';
import { PhotoCropperModal } from './components/PhotoCropperModal';
import { getAuthorPhotoCrop, getAuthorImage, setAuthorPhotoOverride } from './data/authors';
import { loadAllArticles, saveArticle, deleteArticle, clearAllArticles, syncNewsToDisk, setLocalArticles } from './services/storage';
import { isAuthenticated } from './services/auth';
import { Newspaper } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import GradualBlur from './components/reactbits/GradualBlur';

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    return (newsData as NewsArticle[]).map((a) => ({
      ...a,
      status: a.status || 'published',
    }));
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAuthenticated());

  // Arranca directamente en 'news' que contiene la grilla editorial de artículos
  const [activeTab, setActiveTab] = useState<'news' | 'glossary' | 'about' | 'admin' | 'login' | 'create'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#login') return 'login';
      if (path.startsWith('/admin') || hash === '#admin') {
        return isAuthenticated() ? 'admin' : 'login';
      }
    }
    return 'news';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('TODAS');
  const [selectedTopic, setSelectedTopic] = useState('TODOS');
  const [selectedAuthor, setSelectedAuthor] = useState('TODOS');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [glossaryTermFocus, setGlossaryTermFocus] = useState<string>('');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Framing & Cropper Modal State
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    authorName: string;
    image: string;
    crop: PhotoCrop;
  }>({
    isOpen: false,
    authorName: '',
    image: '',
    crop: { zoom: 1, panX: 0, panY: 0 },
  });

  // Toasts system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenCropper = useCallback((authorName: string, image?: string, crop?: PhotoCrop) => {
    const authorImg = image || getAuthorImage(authorName);
    const authorCrop = crop || getAuthorPhotoCrop(authorName);
    setCropperModal({
      isOpen: true,
      authorName,
      image: authorImg,
      crop: authorCrop,
    });
  }, []);

  const handleSaveCropper = useCallback(async (authorName: string, newImage: string, newCrop: PhotoCrop) => {
    setAuthorPhotoOverride(authorName, newImage, newCrop);

    const normTarget = authorName.toLowerCase().trim();
    setArticles((prev) => {
      const updated = prev.map((art) => {
        const isAuthor = (art.authors || []).some((auth) => {
          const name = typeof auth === 'string' ? auth : (auth as any)?.name || '';
          return name.toLowerCase().trim() === normTarget;
        });
        if (isAuthor) {
          return {
            ...art,
            author_image: newImage,
            photoCrop: newCrop,
          };
        }
        return art;
      });

      setLocalArticles(updated);
      syncNewsToDisk(updated);
      return updated;
    });

    showToast(`¡Foto y encuadre de ${authorName} actualizados!`, 'success');
  }, [showToast]);

  useEffect(() => {
    setIsAdminLoggedIn(isAuthenticated());
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    loadAllArticles().then((res) => {
      if (isMounted && res.articles && res.articles.length > 0) {
        const normalized = res.articles.map((a) => ({
          ...a,
          status: a.status || 'published',
        }));
        setArticles(normalized);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab: 'news' | 'glossary' | 'about' | 'admin' | 'login' | 'create') => {
    if (tab !== 'glossary') setGlossaryTermFocus('');

    if (tab === 'admin') {
      const authed = isAuthenticated();
      setIsAdminLoggedIn(authed);
      if (!authed) {
        setActiveTab('login');
        showToast('Iniciá sesión para acceder al panel de administración.', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
    showToast('¡Bienvenido al Panel de Administración Editorial!', 'success');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('news');
  };

  const handleUpdateArticle = async (updatedArticle: NewsArticle) => {
    await saveArticle(updatedArticle);
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === updatedArticle.id);
      const nextList = exists
        ? prev.map((a) => (a.id === updatedArticle.id ? updatedArticle : a))
        : [updatedArticle, ...prev];
      syncNewsToDisk(nextList);
      return nextList;
    });
  };

  const handleUpdateAllArticles = async (updatedArticles: NewsArticle[]) => {
    setArticles(updatedArticles);
    setLocalArticles(updatedArticles);
    await syncNewsToDisk(updatedArticles);
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
    setArticles((prev) => {
      const nextList = prev.filter((a) => a.id !== id);
      syncNewsToDisk(nextList);
      return nextList;
    });
  };

  const handleClearAllArticles = async () => {
    await clearAllArticles();
    setArticles([]);
    syncNewsToDisk([]);
  };

  const handleArticlePublished = async (newArticle: NewsArticle) => {
    const publishedArticle: NewsArticle = {
      ...newArticle,
      status: 'published',
    };
    await saveArticle(publishedArticle);
    setArticles((prev) => {
      const nextList = [publishedArticle, ...prev.filter((a) => a.id !== publishedArticle.id)];
      syncNewsToDisk(nextList);
      return nextList;
    });
    setActiveTab('admin');
    showToast(`Artículo "${newArticle.title}" publicado con éxito.`, 'success');
  };

  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published' || !a.status);
  }, [articles]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => {
      if (a.region) set.add(a.region);
    });
    return Array.from(set).sort();
  }, [publishedArticles]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => {
      if (a.topic) set.add(a.topic);
    });
    return Array.from(set).sort();
  }, [publishedArticles]);

  const authors = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => {
      (a.authors || []).forEach((auth) => {
        const name = typeof auth === 'string' ? auth : (auth as any)?.name;
        if (name) set.add(name);
      });
    });
    return Array.from(set).sort();
  }, [publishedArticles]);

  const allGlossaryItems = useMemo<GlossaryItem[]>(() => {
    const list: GlossaryItem[] = [];
    publishedArticles.forEach((a) => {
      (a.glossary || []).forEach((g) => {
        if (g.term && g.definition) list.push(g);
      });
    });
    return list;
  }, [publishedArticles]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return publishedArticles.filter((article) => {
      if (selectedRegion !== 'TODAS' && article.region !== selectedRegion) return false;
      if (selectedTopic !== 'TODOS' && article.topic !== selectedTopic) return false;
      if (selectedAuthor !== 'TODOS') {
        const hasAuthor = (article.authors || []).some((a) => {
          const name = typeof a === 'string' ? a : (a as any)?.name || '';
          return name === selectedAuthor;
        });
        if (!hasAuthor) return false;
      }

      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const authorsMatch = (article.authors || []).some((a) => {
        const name = typeof a === 'string' ? a : (a as any)?.name || '';
        return name.toLowerCase().includes(q);
      });
      return titleMatch || authorsMatch;
    });
  }, [publishedArticles, searchQuery, selectedRegion, selectedTopic, selectedAuthor]);

  const handleResetFilters = () => {
    setSelectedRegion('TODAS');
    setSelectedTopic('TODOS');
    setSelectedAuthor('TODOS');
    setSearchQuery('');
  };

  const handleSelectAuthor = (author: string) => {
    setSelectedAuthor(author);
    setActiveTab('news');
  };

  const handleSelectTermFromArticle = (term: string) => {
    setGlossaryTermFocus(term);
    setActiveTab('glossary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-black text-slate-100 font-sans antialiased relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Navbar Superior */}
      <Navbar
        currentView={activeTab}
        onNavigate={(view: any) => {
          if (view === 'asistente') {
            setIsAIAssistantOpen(true);
          } else {
            handleTabChange(view);
          }
        }}
        activeTab={activeTab === 'create' ? 'admin' : activeTab}
        setActiveTab={handleTabChange}
        articlesCount={publishedArticles.length}
        glossaryCount={allGlossaryItems.length}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />
      {/* Contenido Principal */}
      <main className="flex-1">
        {/* VISTA 1: Login */}
        {activeTab === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => handleTabChange('news')}
          />
        )}

        {/* VISTA 2: Panel Admin */}
        {activeTab === 'admin' && (
          <AdminDashboard
            articles={articles}
            onUpdateArticle={handleUpdateArticle}
            onUpdateAllArticles={handleUpdateAllArticles}
            onDeleteArticle={handleDeleteArticle}
            onClearAllArticles={handleClearAllArticles}
            onOpenCreateNew={() => setActiveTab('create')}
            onPreviewArticle={(art) => setSelectedArticle(art)}
            onBackToHome={() => handleTabChange('news')}
            onLogout={handleLogout}
            onOpenCropper={handleOpenCropper}
            showToast={showToast}
          />
        )}

        {/* VISTA 3: Formulario Publicar */}
        {activeTab === 'create' && (
          <AdminPublishForm
            allArticles={articles}
            onArticlePublished={handleArticlePublished}
            onPreviewArticle={(draft) => setPreviewArticle(draft)}
            onBackToHome={() => handleTabChange('admin')}
          />
        )}

        {/* VISTA 4: PORTADA DE NOTICIAS CON GRILLA EDITORIAL CARNEGIE */}
        {activeTab === 'news' && (
          <div className="space-y-6 pb-20">
            {/* Cabecera Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
              <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-widest uppercase bg-[#009EDB]/20 text-[#38bdf8] border border-[#009EDB]/30 rounded-full">
                Observatorio Económico Internacional
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Plataforma de divulgación académica de Economía IV
              </h1>
            </div>

            {/* Barra de Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FilterBar
                regions={regions}
                topics={topics}
                authors={authors}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                selectedAuthor={selectedAuthor}
                setSelectedAuthor={setSelectedAuthor}
                filteredCount={filteredArticles.length}
                totalCount={publishedArticles.length}
                onReset={handleResetFilters}
              />
            </div>

            {/* Grilla Asimétrica con Scroll Reveal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredArticles.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                  <Newspaper className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-white">
                    No se encontraron investigaciones publicadas
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <motion.div
                  key={`${selectedRegion}-${selectedTopic}-${selectedAuthor}-${searchQuery}`}
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <CarnegieEditorialGrid
                    articles={filteredArticles as any}
                    onSelectArticle={(art: any) => setSelectedArticle(art)}
                    onSelectAuthor={handleSelectAuthor}
                  />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 5: Glosario */}
        {activeTab === 'glossary' && (
          <GlobalGlossary
            articles={publishedArticles}
            initialSearchQuery={glossaryTermFocus}
            onSelectArticle={(art: NewsArticle) => setSelectedArticle(art)}
          />
        )}

        {/* VISTA 6: Institucional */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <Footer
        onGoToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenAbout={() => handleTabChange('about')}
        onOpenGlossary={() => handleTabChange('glossary')}
        onOpenAdmin={() => handleTabChange('admin')}
      />

      {/* Visor Modal de la Noticia */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          allArticles={publishedArticles}
          allGlossary={allGlossaryItems}
          onClose={() => setSelectedArticle(null)}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onSelectTerm={handleSelectTermFromArticle}
          onSelectAuthor={handleSelectAuthor}
        />
      )}

      {/* Visor Preview Borrador */}
      {previewArticle && (
        <NewsDetailModal
          article={previewArticle}
          allArticles={articles}
          allGlossary={allGlossaryItems}
          onClose={() => setPreviewArticle(null)}
          onSelectArticle={(art) => setPreviewArticle(art)}
          onSelectTerm={handleSelectTermFromArticle}
          onOpenCropper={handleOpenCropper}
        />
      )}

      {/* Asistente IA */}
      {isAIAssistantOpen && (
        <AIAssistantModal
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          articles={publishedArticles}
        />
      )}

      {/* Modal de Encuadre */}
      <PhotoCropperModal
        isOpen={cropperModal.isOpen}
        authorName={cropperModal.authorName}
        initialImage={cropperModal.image}
        initialCrop={cropperModal.crop}
        onClose={() => setCropperModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveCropper}
      />

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Gradual Blur en el borde inferior fijo de la pantalla */}
      <GradualBlur
        target="page"
        position="bottom"
        height="5rem"
        strength={2.5}
        layers={10}
        curve="ease-out"
        exponential={true}
        tint="rgba(0, 0, 0, 0.85)"
        autoHide={true}
        zIndex={30}
      />
    </div>
  );
}

export default App;
