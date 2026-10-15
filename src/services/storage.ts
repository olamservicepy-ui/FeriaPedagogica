import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import newsSeedData from '../data/news.json';
import type { NewsArticle } from '../types/news';

const STORAGE_KEY = 'observatorio_articles_v2';
try {
  if (typeof window !== 'undefined' && localStorage.getItem('observatorio_articles_v1')) {
    localStorage.removeItem('observatorio_articles_v1');
  }
} catch {
  // Ignore localStorage access errors
}
const SUPABASE_CONFIG_KEY = 'observatorio_supabase_custom_config_v1';

// Check environment variables first, then fallback to local configuration if any
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

interface CustomConfig {
  url?: string;
  anonKey?: string;
}

function getStoredCustomConfig(): CustomConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading custom Supabase config:', err);
  }
  return {};
}

let supabaseClient: SupabaseClient | null = null;

export function getActiveSupabaseConfig(): {
  url: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
} {
  const custom = getStoredCustomConfig();
  const activeUrl = envUrl || custom.url || '';
  const activeKey = envKey || custom.anonKey || '';

  if (activeUrl && activeKey) {
    return {
      url: activeUrl,
      isConfigured: true,
      source: envUrl ? 'env' : 'custom',
    };
  }

  return {
    url: '',
    isConfigured: false,
    source: 'none',
  };
}

export function initSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const custom = getStoredCustomConfig();
  const activeUrl = envUrl || custom.url;
  const activeKey = envKey || custom.anonKey;

  if (activeUrl && activeKey) {
    try {
      supabaseClient = createClient(activeUrl, activeKey);
      return supabaseClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    supabaseClient = null; // force re-initialization
    initSupabase();
  } catch (err) {
    console.error('Failed to save Supabase config to localStorage:', err);
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabaseClient = null;
  } catch (err) {
    console.error('Failed to clear Supabase config:', err);
  }
}

// LocalStorage helpers
export function getLocalArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local articles:', err);
    return [];
  }
}

export function setLocalArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (err) {
    console.error('Error saving local articles:', err);
  }
}

/**
 * Load all articles:
 * 1. Fetches from Supabase if configured.
 * 2. Fetches from LocalStorage (newly added student articles).
 * 3. Combines with seed data from `news.json` ensuring no duplicates.
 * 4. Places recently published/custom articles at the top.
 */
export async function loadAllArticles(): Promise<{
  articles: NewsArticle[];
  source: 'supabase' | 'localStorage';
}> {
  const client = initSupabase();
  const seedArticles = newsSeedData as NewsArticle[];
  const localCustomArticles = getLocalArticles();

  if (client) {
    try {
      const { data, error } = await client
        .from('articles')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map Supabase items ensuring types match NewsArticle
        const remoteArticles: NewsArticle[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          region: item.region,
          topic: item.topic,
          date: item.date,
          authors: Array.isArray(item.authors) ? item.authors : [item.authors || 'Investigador'],
          summary_bullets: Array.isArray(item.summary_bullets) ? item.summary_bullets : [],
          full_text: Array.isArray(item.full_text) ? item.full_text : [item.full_text || ''],
          glossary: Array.isArray(item.glossary) ? item.glossary : [],
          ir_perspective: item.ir_perspective || {
            geopolitical_context: '',
            strategic_recommendations: [],
          },
          sources: Array.isArray(item.sources) ? item.sources : [],
          read_time_minutes: item.read_time_minutes,
          author_image: item.author_image,
          author_role: item.author_role,
          status: item.status || 'published',
          source_file: item.source_file,
        }));

        // Merge: remote custom articles first, then local, then seed articles (avoiding duplicate IDs)
        const combined = mergeArticles([
          ...remoteArticles,
          ...localCustomArticles,
          ...seedArticles,
        ]);

        return { articles: combined, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Could not retrieve articles from Supabase, falling back to local:', err);
    }
  }

  // Fallback: merge local custom articles with initial seed
  const combined = mergeArticles([...localCustomArticles, ...seedArticles]);
  return { articles: combined, source: 'localStorage' };
}

/**
 * Save an article:
 * - Always saves to LocalStorage so it persists offline and immediately.
 * - Attempts to save to Supabase if configured.
 */
export async function saveArticle(article: NewsArticle): Promise<{
  success: boolean;
  mode: 'supabase' | 'localStorage';
  error?: string;
}> {
  // 1. Save to LocalStorage
  const currentLocal = getLocalArticles();
  const updatedLocal = [article, ...currentLocal.filter((a) => a.id !== article.id)];
  setLocalArticles(updatedLocal);

  // 2. Try Supabase
  const client = initSupabase();
  if (client) {
    try {
      const { error } = await client.from('articles').upsert([
        {
          id: article.id,
          title: article.title,
          region: article.region,
          topic: article.topic,
          date: article.date,
          authors: article.authors,
          author_image: article.author_image,
          author_role: article.author_role,
          summary_bullets: article.summary_bullets,
          full_text: article.full_text,
          glossary: article.glossary,
          ir_perspective: article.ir_perspective,
          sources: article.sources,
          read_time_minutes: article.read_time_minutes,
          status: article.status || 'published',
          source_file: article.source_file,
        },
      ]);

      if (error) {
        console.warn('Supabase insert warning:', error.message);
        return {
          success: true,
          mode: 'localStorage',
          error: `Guardado en almacenamiento local (Aviso Supabase: ${error.message})`,
        };
      }

      return { success: true, mode: 'supabase' };
    } catch (err: any) {
      console.warn('Supabase save error:', err);
      return {
        success: true,
        mode: 'localStorage',
        error: err.message || 'Error de conexión con Supabase',
      };
    }
  }

  return { success: true, mode: 'localStorage' };
}

/**
 * Remove an article by ID
 */
export async function deleteArticle(id: string): Promise<boolean> {
  // Remove from localStorage
  const current = getLocalArticles();
  setLocalArticles(current.filter((a) => a.id !== id));

  // Try Supabase if configured
  const client = initSupabase();
  if (client) {
    try {
      await client.from('articles').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}

/**
 * Remove all articles from local storage and remote if configured
 */
export async function clearAllArticles(): Promise<boolean> {
  setLocalArticles([]);
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('observatorio_articles_v1');
  } catch (err) {
    console.error('Error clearing local storage:', err);
  }

  const client = initSupabase();
  if (client) {
    try {
      await client.from('articles').delete().neq('id', '');
    } catch (err) {
      console.warn('Supabase delete all error:', err);
    }
  }

  return true;
}

/**
 * Merge articles ensuring unique IDs, preserving custom articles order
 */
function mergeArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const result: NewsArticle[] = [];

  for (const art of articles) {
    if (art && art.id && !seen.has(art.id)) {
      seen.add(art.id);
      result.push(art);
    }
  }

  return result;
}

/**
 * Export complete articles database as downloadable JSON
 */
export function exportArticlesToJSON(articles: NewsArticle[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(articles, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `observatorio-articulos-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import articles from a user-supplied JSON text
 */
export function importArticlesFromJSON(jsonString: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'El archivo JSON debe contener un arreglo de artículos.' };
    }

    // Validate minimum required fields
    const validArticles = parsed.filter(
      (item) => item && typeof item.title === 'string' && Array.isArray(item.authors)
    );

    if (validArticles.length === 0) {
      return { success: false, count: 0, error: 'No se encontraron artículos válidos en el archivo JSON.' };
    }

    const current = getLocalArticles();
    const merged = mergeArticles([...validArticles, ...current]);
    setLocalArticles(merged);

    return { success: true, count: validArticles.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Error al procesar el archivo JSON' };
  }
}

/**
 * Reset local database to default seed data
 */
export function resetDatabaseToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing local storage:', err);
  }
}

/**
 * Client-side image compression to lightweight data URL (< 150KB)
 */
export function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
