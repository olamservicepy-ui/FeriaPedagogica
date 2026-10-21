import Groq from 'groq-sdk';
import type { NewsArticle } from '../types/news';
import newsSeedData from '../data/news.json';

const GROQ_STORAGE_KEY = 'observatorio_groq_custom_key_v1';

export function getCustomGroqKey(): string {
  try {
    return localStorage.getItem(GROQ_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCustomGroqKey(key: string): void {
  try {
    localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
  } catch (err) {
    console.error('Error saving custom Groq key:', err);
  }
}

export function clearCustomGroqKey(): void {
  try {
    localStorage.removeItem(GROQ_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing custom Groq key:', err);
  }
}

export async function queryAIAssistant(
  question: string,
  articles: NewsArticle[] = []
): Promise<string> {
  const activeDataset = articles.length > 0 ? articles : (newsSeedData as NewsArticle[]);

  // 1. First, attempt to call the backend endpoint (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, articles: activeDataset.slice(0, 25) }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.answer) {
        return data.answer;
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat not available or returned error, trying client-side fallback:', err);
  }

  // 2. Client-side fallback if custom key or VITE_GROQ_API_KEY is available
  const clientKey =
    getCustomGroqKey() ||
    (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() ||
    '';

  if (!clientKey) {
    throw new Error(
      'Para utilizar el Asistente Académico con IA, configura tu GROQ_API_KEY en el archivo .env o ingrésala en la configuración del asistente.'
    );
  }

  const groq = new Groq({
    apiKey: clientKey,
    dangerouslyAllowBrowser: true,
  });

  const context = (activeDataset || []).slice(0, 25).map((a: any, i: number) => (
    `[${i + 1}] Título: ${a.title}
   Autor: ${Array.isArray(a.authors) ? a.authors.join(', ') : (a.authors || '')}
   Tema: ${a.topic || a.category || ''}
   Resumen: ${a.summary_bullets?.[0] || a.summary || ''}`
  )).join('\n\n');

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres el Asistente Académico del Observatorio Económico de Relaciones Internacionales.
Tu única fuente de información son las investigaciones y noticias redactadas por los estudiantes del curso:

${context}

Instrucciones:
1. Responde de forma clara, pedagógica y ejecutiva en español.
2. Cita siempre el nombre del alumno/a autor/a y el medio o título del artículo correspondiente.
3. Si consultan por un término económico, recurre a las definiciones del glosario de los artículos.
4. Si la consulta está fuera del alcance de estos artículos, explica con cortesía que solo dispones de los análisis del observatorio.`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content || 'No se pudo generar una respuesta.';
}

export interface EditorialAnalysisResult {
  suggestedCategory?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  executiveSummary?: string[];
  glossarySuggestions?: Array<{ term: string; definition: string }>;
  irPerspectiveFeedback?: string;
}

export async function analyzeArticleDraft(params: {
  title: string;
  rawText: string;
  source?: string;
  currentGlossary?: Array<{ term: string; definition: string }>;
}): Promise<EditorialAnalysisResult> {
  const { title, rawText, source = '', currentGlossary = [] } = params;

  // 1. Try backend endpoint /api/analyze
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, rawText, source, currentGlossary }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('/api/analyze endpoint call error, trying client-side fallback:', err);
  }

  // 2. Client-side fallback with Groq
  const clientKey =
    getCustomGroqKey() ||
    (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() ||
    '';

  if (!clientKey) {
    throw new Error(
      'Para utilizar el Asistente Editorial con IA, configura tu GROQ_API_KEY en el archivo .env o en la configuración del asistente.'
    );
  }

  const groq = new Groq({
    apiKey: clientKey,
    dangerouslyAllowBrowser: true,
  });

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Actúa como editor académico del observatorio de Relaciones Internacionales. 
Analiza la noticia y responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "suggestedCategory": "Categoría (ej: Política Monetaria, Empleo & Producción, Comercio Exterior)",
  "tags": ["tag1", "tag2"],
  "readingTimeMinutes": 3,
  "executiveSummary": ["Punto clave 1", "Punto clave 2"],
  "glossarySuggestions": [{"term": "Término", "definition": "Definición sencilla"}],
  "irPerspectiveFeedback": "Consejo para reforzar el enfoque diplomático o de comercio exterior."
}`,
      },
      {
        role: 'user',
        content: `Título: ${title}\nFuente: ${source}\nTexto: ${rawText}\nGlosario cargado: ${JSON.stringify(currentGlossary)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
  return parsed;
}

