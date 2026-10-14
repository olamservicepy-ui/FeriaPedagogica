import { useState, useMemo, useEffect } from 'react';
import newsData from './data/news.json';
import type { NewsArticle, GlossaryItem } from './types/news';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { NewsCard } from './components/NewsCard';
import { NewsDetailModal } from './components/NewsDetailModal';
import { GlobalGlossary } from './components/GlobalGlossary';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { AdminPublishForm } from './components/AdminPublishForm';
import { AIAssistantModal } from './components/AIAssistantModal';
import { loadAllArticles } from './services/storage';
import { Newspaper, CheckCircle2, Bot, Sparkles } from 'lucide-react';

export function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(newsData as NewsArticle[]);
  const [activeTab, setActiveTab] = useState<'news' | 'glossary' | 'about' | 'admin'>(() => {
    // Initial route detection
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path === '/admin' ||
        path === '/nuevo-articulo' ||
        path.startsWith('/admin/') ||
        hash === '#admin' ||
        hash === '#nuevo-articulo'
      ) {
        return 'admin';
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
  const [publishSuccessBanner, setPublishSuccessBanner] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Load articles from Supabase / localStorage on mount
  useEffect(() => {
    let isMounted = true;
    loadAllArticles().then((res) => {
      if (isMounted && res.articles && res.articles.length > 0) {
        setArticles(res.articles);
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
      if (
        path === '/admin' ||
        path === '/nuevo-articulo' ||
        hash === '#admin' ||
        hash === '#nuevo-articulo'
      ) {
        setActiveTab('admin');
      } else {
        setActiveTab('news');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync route when activeTab changes
  const handleTabChange = (tab: 'news' | 'glossary' | 'about' | 'admin') => {
    setActiveTab(tab);
    if (tab !== 'glossary') setGlossaryTermFocus('');

    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else {
        if (window.location.pathname === '/admin' || window.location.pathname === '/nuevo-articulo') {
          window.history.pushState(null, '', '/');
        }
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle successful publication from admin form
  const handleArticlePublished = (newArticle: NewsArticle) => {
    // Add new article to the very top
    setArticles((prev) => [newArticle, ...prev.filter((a) => a.id !== newArticle.id)]);
    setActiveTab('news');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setPublishSuccessBanner(`¡Artículo "${newArticle.title}" publicado con éxito en la portada!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Open detail modal directly so student can inspect their live article
    setSelectedArticle(newArticle);

    setTimeout(() => {
      setPublishSuccessBanner(null);
    }, 7000);
  };

  // Extract unique regions, topics & authors dynamically
  const regions = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.region) set.add(a.region);
    });
    return Array.from(set).sort();
  }, [articles]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.topic) set.add(a.topic);
    });
    return Array.from(set).sort();
  }, [articles]);

  const authors = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      (a.authors || []).forEach((auth) => {
        if (auth) set.add(auth);
      });
    });
    return Array.from(set).sort();
  }, [articles]);

  // Aggregate all glossary items for global lookups
  const allGlossaryItems = useMemo<GlossaryItem[]>(() => {
    const list: GlossaryItem[] = [];
    articles.forEach((a) => {
      (a.glossary || []).forEach((g) => {
        if (g.term && g.definition) {
          list.push(g);
        }
      });
    });
    return list;
  }, [articles]);

  // Deduplicated glossary terms count
  const uniqueGlossaryCount = useMemo(() => {
    const set = new Set<string>();
    allGlossaryItems.forEach((g) => set.add(g.term.toLowerCase()));
    return set.size;
  }, [allGlossaryItems]);

  // Filter articles based on search query, region, topic, and author
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      // Region filter
      if (selectedRegion !== 'TODAS' && article.region !== selectedRegion) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'TODOS' && article.topic !== selectedTopic) {
        return false;
      }

      // Author filter
      if (selectedAuthor !== 'TODOS' && !article.authors.includes(selectedAuthor)) {
        return false;
      }

      // Search query filter: matches title, authors, region, topic, summary, and glossary
      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const authorsMatch = article.authors.some((a) => a.toLowerCase().includes(q));
      const regionMatch = article.region.toLowerCase().includes(q);
      const topicMatch = article.topic.toLowerCase().includes(q);
      const bulletsMatch = article.summary_bullets.some((b) => b.toLowerCase().includes(q));
      const glossaryMatch = (article.glossary || []).some((g) => g.term.toLowerCase().includes(q));

      return titleMatch || authorsMatch || regionMatch || topicMatch || bulletsMatch || glossaryMatch;
    });
  }, [articles, searchQuery, selectedRegion, selectedTopic, selectedAuthor]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-[#F8F9FA] to-slate-100/70 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 font-sans antialiased subpixel-antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        articlesCount={articles.length}
        glossaryCount={uniqueGlossaryCount}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Success Notification Banner after publishing */}
      {publishSuccessBanner && (
        <div className="bg-emerald-800 text-white px-4 py-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>{publishSuccessBanner}</span>
            </div>
            <button
              onClick={() => setPublishSuccessBanner(null)}
              className="text-emerald-200 hover:text-white underline text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Admin / Self-Publishing Panel */}
        {activeTab === 'admin' && (
          <AdminPublishForm
            allArticles={articles}
            onArticlePublished={handleArticlePublished}
            onPreviewArticle={(draft) => setPreviewArticle(draft)}
            onBackToHome={() => handleTabChange('news')}
          />
        )}

        {/* News Feed View */}
        {activeTab === 'news' && (
          <div className="space-y-8 pb-16">
            {/* Hero Banner */}
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              articlesCount={articles.length}
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
                totalCount={articles.length}
                onReset={handleResetFilters}
              />

              {/* Grid of News Cards */}
              {filteredArticles.length === 0 ? (
                <div className="p-8 sm:p-16 text-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-3 max-w-lg mx-auto my-8 sm:my-12">
                  <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    No se encontraron análisis
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {filteredArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onSelect={(art) => setSelectedArticle(art)}
                      onSelectAuthor={handleSelectAuthor}
                      selectedAuthor={selectedAuthor}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Glossary Tab View */}
        {activeTab === 'glossary' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <GlobalGlossary
              articles={articles}
              onSelectArticle={(art) => setSelectedArticle(art)}
              initialSearchQuery={glossaryTermFocus}
            />
          </div>
        )}

        {/* Institutional / About View */}
        {activeTab === 'about' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <AboutSection />
          </div>
        )}
      </main>

      {/* News Detail Reading Modal (Published Article) */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          allGlossary={allGlossaryItems}
          onClose={() => setSelectedArticle(null)}
          onSelectTerm={handleSelectTermFromArticle}
          onSelectAuthor={handleSelectAuthor}
        />
      )}

      {/* Preview Modal for Article Draft before Publishing */}
      {previewArticle && (
        <NewsDetailModal
          article={previewArticle}
          allGlossary={allGlossaryItems}
          onClose={() => setPreviewArticle(null)}
          onSelectTerm={handleSelectTermFromArticle}
          onSelectAuthor={handleSelectAuthor}
        />
      )}

      {/* Footer */}
      <Footer
        onGoToTop={scrollToTop}
        onOpenAbout={() => {
          handleTabChange('about');
        }}
        onOpenGlossary={() => {
          handleTabChange('glossary');
        }}
        onOpenAdmin={() => {
          handleTabChange('admin');
        }}
      />

      {/* Floating AI Assistant Action Button (shown when not in admin view) */}
      {activeTab !== 'admin' && (
        <button
          type="button"
          onClick={() => setIsAIAssistantOpen(true)}
          title="Consultar al Asistente Académico IA (Llama-3.1 en Groq)"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.16)] hover:border-emerald-300 hover:text-emerald-950 transition-all duration-300 ease-out cursor-pointer group hover:scale-105"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1">
              Asistente IA <Sparkles className="w-3 h-3 text-emerald-600" />
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Llama-3.1 • Groq</span>
          </div>
        </button>
      )}

      {/* Academic AI Assistant Dialog */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        articles={articles}
      />
    </div>
  );
}

export default App;
