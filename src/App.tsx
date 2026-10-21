import { useState, useMemo, useEffect, useCallback } from 'react';
import newsData from './data/news.json';
import type { NewsArticle, GlossaryItem, PhotoCrop } from './types/news';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
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

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

  // Navigation tab state: 'news' | 'glossary' | 'about' | 'admin' | 'login' | 'create'
  const [activeTab, setActiveTab] = useState<'news' | 'glossary' | 'about' | 'admin' | 'login' | 'create'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#login') {
        return 'login';
      }
      if (
        path === '/admin' ||
        path === '/nuevo-articulo' ||
        path.startsWith('/admin/') ||
        hash === '#admin' ||
        hash === '#nuevo-articulo'
      ) {
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

  // Floating Toasts system
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

  // Open the Framing / Crop Tool for a student
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

  // Save new crop and image across all student articles
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

    setSelectedArticle((prev) => {
      if (!prev) return null;
      const isSelectedAuthor = (prev.authors || []).some((auth) => {
        const name = typeof auth === 'string' ? auth : (auth as any)?.name || '';
        return name.toLowerCase().trim() === normTarget;
      });
      if (isSelectedAuthor) {
        return {
          ...prev,
          author_image: newImage,
          photoCrop: newCrop,
        };
      }
      return prev;
    });

    showToast(`¡Foto y encuadre de ${authorName} actualizados en todas sus investigaciones!`, 'success');
  }, [showToast]);

  // Sync auth status periodically or on visibility change
  useEffect(() => {
    setIsAdminLoggedIn(isAuthenticated());
  }, [activeTab]);

  // Load articles from Supabase / localStorage on mount
  useEffect(() => {
    let isMounted = true;
    loadAllArticles().then((res) => {
      if (isMounted) {
        if (res.articles && res.articles.length > 0) {
          const normalized = res.articles.map((a) => ({
            ...a,
            status: a.status || 'published',
          }));
          setArticles(normalized);
        } else {
          setArticles([]);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for browser navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/login' || hash === '#login') {
        setActiveTab('login');
      } else if (
        path === '/admin' ||
        path === '/nuevo-articulo' ||
        hash === '#admin' ||
        hash === '#nuevo-articulo'
      ) {
        if (isAuthenticated()) {
          setActiveTab('admin');
        } else {
          setActiveTab('login');
          if (path !== '/login') {
            window.history.replaceState(null, '', '/login');
          }
        }
      } else {
        setActiveTab('news');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync route and handle protected route redirect when activeTab changes
  const handleTabChange = (tab: 'news' | 'glossary' | 'about' | 'admin' | 'login' | 'create') => {
    if (tab !== 'glossary') setGlossaryTermFocus('');

    if (tab === 'admin') {
      const authed = isAuthenticated();
      setIsAdminLoggedIn(authed);
      if (!authed) {
        // Redirige automáticamente a /login si no hay sesión activa
        setActiveTab('login');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.history.pushState(null, '', '/login');
        }
        showToast('Debes iniciar sesión para acceder al panel de administración.', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setActiveTab(tab);

    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else if (tab === 'login') {
        if (window.location.pathname !== '/login') {
          window.history.pushState(null, '', '/login');
        }
      } else {
        if (window.location.pathname === '/admin' || window.location.pathname === '/login') {
          window.history.pushState(null, '', '/');
        }
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
    showToast('¡Bienvenido al Panel de Administración Editorial!', 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('news');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  // Update or approve an article
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

  // Update all articles at once (e.g. author unification across the entire catalog)
  const handleUpdateAllArticles = async (updatedArticles: NewsArticle[]) => {
    setArticles(updatedArticles);
    setLocalArticles(updatedArticles);
    await syncNewsToDisk(updatedArticles);
  };

  // Delete article
  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
    setArticles((prev) => {
      const nextList = prev.filter((a) => a.id !== id);
      syncNewsToDisk(nextList);
      return nextList;
    });
  };

  // Clear all articles
  const handleClearAllArticles = async () => {
    await clearAllArticles();
    setArticles([]);
    syncNewsToDisk([]);
  };

  // Handle successful publication from admin create form
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
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
    showToast(`Artículo "${newArticle.title}" publicado con éxito.`, 'success');
  };

  // CRITICAL REQUIREMENT 2:
  // "En la página principal (/), muestra ÚNICAMENTE las noticias cuyo estado sea 'published'."
  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published' || !a.status);
  }, [articles]);

  // Extract unique regions, topics & authors dynamically from PUBLISHED articles
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
        if (auth) set.add(auth);
      });
    });
    return Array.from(set).sort();
  }, [publishedArticles]);

  // Aggregate all glossary items for global lookups from PUBLISHED articles
  const allGlossaryItems = useMemo<GlossaryItem[]>(() => {
    const list: GlossaryItem[] = [];
    publishedArticles.forEach((a) => {
      (a.glossary || []).forEach((g) => {
        if (g.term && g.definition) {
          list.push(g);
        }
      });
    });
    return list;
  }, [publishedArticles]);

  // Deduplicated glossary terms count
  const uniqueGlossaryCount = useMemo(() => {
    const set = new Set<string>();
    allGlossaryItems.forEach((g) => set.add(g.term.toLowerCase()));
    return set.size;
  }, [allGlossaryItems]);

  // Filter public articles based on search query, region, topic, and author
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return publishedArticles.filter((article) => {
      if (selectedRegion !== 'TODAS' && article.region !== selectedRegion) {
        return false;
      }

      if (selectedTopic !== 'TODOS' && article.topic !== selectedTopic) {
        return false;
      }

      if (selectedAuthor !== 'TODOS' && !article.authors.includes(selectedAuthor)) {
        return false;
      }

      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const authorsMatch = article.authors.some((a) => a.toLowerCase().includes(q));
      const regionMatch = article.region.toLowerCase().includes(q);
      const topicMatch = article.topic.toLowerCase().includes(q);
      const bulletsMatch = (article.summary_bullets || []).some((b) => b.toLowerCase().includes(q));
      const glossaryMatch = (article.glossary || []).some((g) => g.term.toLowerCase().includes(q));

      return titleMatch || authorsMatch || regionMatch || topicMatch || bulletsMatch || glossaryMatch;
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
    handleTabChange('news');
    if (selectedArticle) {
      setSelectedArticle(null);
    }
  };

  const handleSelectTermFromArticle = (term: string) => {
    setGlossaryTermFocus(term);
    handleTabChange('glossary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-[#F8F9FA] to-slate-100/70 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 font-sans antialiased subpixel-antialiased"
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab === 'create' ? 'admin' : activeTab}
        setActiveTab={handleTabChange}
        articlesCount={publishedArticles.length}
        glossaryCount={uniqueGlossaryCount}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: Login Form (/login) */}
        {activeTab === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => handleTabChange('news')}
          />
        )}

        {/* VIEW 2: Protected Admin Dashboard (/admin) */}
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

        {/* VIEW 3: Create / Self-Publish Form */}
        {activeTab === 'create' && (
          <AdminPublishForm
            allArticles={articles}
            onArticlePublished={handleArticlePublished}
            onPreviewArticle={(draft) => setPreviewArticle(draft)}
            onBackToHome={() => handleTabChange('admin')}
          />
        )}

        {/* VIEW 4: News Feed Public Portada (/) */}
        {activeTab === 'news' && (
          <div className="space-y-8 pb-16">
            {/* Hero Banner */}
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              articlesCount={publishedArticles.length}
              glossaryCount={uniqueGlossaryCount}
              regionsCount={regions.length}
            />

            {/* Articles List & Filter Container */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Filter Bar */}
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

              {/* Grid of Published News Cards */}
              {filteredArticles.length === 0 ? (
                <div className="p-8 sm:p-16 text-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-3 max-w-lg mx-auto my-8 sm:my-12">
                  <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    No se encontraron análisis publicados
                  </h3>
                  <p className="text-slate-600 font-normal leading-relaxed text-[15px] sm:text-[17px]">
                    No hay resultados que coincidan con los criterios de búsqueda o filtros seleccionados.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs sm:text-sm font-semibold border border-emerald-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-pointer"
                  >
                    Restablecer todos los filtros
                  </button>
                </div>
              ) : (
                <motion.div
                  key={`${selectedRegion}-${selectedTopic}-${selectedAuthor}-${searchQuery}`}
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="pt-2"
                >
                  <CarnegieEditorialGrid
                    articles={filteredArticles}
                    onSelectArticle={(art) => setSelectedArticle(art)}
                    onSelectAuthor={handleSelectAuthor}
                  />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: Glossary View */}
        {activeTab === 'glossary' && (
          <GlobalGlossary
            articles={publishedArticles}
            initialSearchQuery={glossaryTermFocus}
            onSelectArticle={(art: NewsArticle) => setSelectedArticle(art)}
          />
        )}

        {/* VIEW 6: About Section */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <Footer
        onGoToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenAbout={() => handleTabChange('about')}
        onOpenGlossary={() => handleTabChange('glossary')}
        onOpenAdmin={() => handleTabChange('admin')}
      />

      {/* News Detail Modal */}
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

      {/* Draft Preview Modal */}
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

      {/* Floating AI Assistant Modal */}
      {isAIAssistantOpen && (
        <AIAssistantModal
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          articles={publishedArticles}
        />
      )}

      {/* Photo Cropper & Framing Modal */}
      <PhotoCropperModal
        isOpen={cropperModal.isOpen}
        authorName={cropperModal.authorName}
        initialImage={cropperModal.image}
        initialCrop={cropperModal.crop}
        onClose={() => setCropperModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveCropper}
      />

      {/* Floating Toast Notification System */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
