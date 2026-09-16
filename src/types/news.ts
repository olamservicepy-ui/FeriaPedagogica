export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface IRPerspective {
  geopolitical_context: string;
  strategic_recommendations: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  region: string;
  topic: string;
  date: string;
  authors: string[];
  summary_bullets: string[];
  full_text: string[];
  glossary: GlossaryItem[];
  ir_perspective: IRPerspective;
  sources: string[];
  read_time_minutes?: number;
}

export interface GlobalGlossaryEntry {
  term: string;
  definition: string;
  articleIds: string[];
  articleTitles: string[];
}
