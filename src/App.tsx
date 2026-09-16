import { useState, useMemo } from 'react';
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
import { Newspaper } from 'lucide-react';

export function App() {
  const [articles] = useState<NewsArticle[]>(newsData as NewsArticle[]);
  const [activeTab, setActiveTab] = useState<'news' | 'glossary' | 'about'>('news');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('TODAS');
  const [selectedTopic, setSelectedTopic] = useState('TODOS');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [glossaryTermFocus, setGlossaryTermFocus] = useState<string>('');

  // Extract unique regions & topics dynamically
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

  // Filter articles based on search query, region, and topic
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

      // Search query filter
      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const regionMatch = article.region.toLowerCase().includes(q);
      const topicMatch = article.topic.toLowerCase().includes(q);
      const authorsMatch = article.authors.some((a) => a.toLowerCase().includes(q));
      const bulletsMatch = article.summary_bullets.some((b) => b.toLowerCase().includes(q));
      const glossaryMatch = (article.glossary || []).some((g) => g.term.toLowerCase().includes(q));

      return titleMatch || regionMatch || topicMatch || authorsMatch || bulletsMatch || glossaryMatch;
    });
  }, [articles, searchQuery, selectedRegion, selectedTopic]);

  const handleResetFilters = () => {
    setSelectedRegion('TODAS');
    setSelectedTopic('TODOS');
    setSearchQuery('');
  };

  const handleSelectTermFromArticle = (term: string) => {
    setGlossaryTermFocus(term);
    setActiveTab('glossary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'glossary') setGlossaryTermFocus('');
          scrollToTop();
        }}
        articlesCount={articles.length}
        glossaryCount={uniqueGlossaryCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
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
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                filteredCount={filteredArticles.length}
                totalCount={articles.length}
                onReset={handleResetFilters}
              />

              {/* Grid of News Cards */}
              {filteredArticles.length === 0 ? (
                <div className="p-8 sm:p-16 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 max-w-lg mx-auto my-8 sm:my-12">
                  <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                    No se encontraron análisis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    No hay resultados que coincidan con los criterios de búsqueda o filtros seleccionados.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <GlobalGlossary
              articles={articles}
              onSelectArticle={(art) => setSelectedArticle(art)}
              initialSearchQuery={glossaryTermFocus}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <AboutSection />
          </div>
        )}
      </main>

      {/* News Detail Reading Modal */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          allGlossary={allGlossaryItems}
          onClose={() => setSelectedArticle(null)}
          onSelectTerm={handleSelectTermFromArticle}
        />
      )}

      {/* Footer */}
      <Footer
        onGoToTop={scrollToTop}
        onOpenAbout={() => {
          setActiveTab('about');
          scrollToTop();
        }}
        onOpenGlossary={() => {
          setActiveTab('glossary');
          scrollToTop();
        }}
      />
    </div>
  );
}

export default App;
