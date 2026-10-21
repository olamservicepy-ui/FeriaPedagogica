export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface IRPerspective {
  geopolitical_context: string;
  strategic_recommendations: string[];
}

export interface KeyIndicator {
  label: string;
  value: string;
  note: string;
}

export interface AcademicMetadata {
  university?: string;
  faculty?: string;
  school?: string;
  department?: string;
  location?: string;
  reviewers?: string;
  fairEdition?: string;
}

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface PhotoCrop {
  zoom: number;
  panX: number;
  panY: number;
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
  author_image?: string;
  author_role?: string;
  photoCrop?: PhotoCrop;
  source_file?: string;
  status?: 'draft' | 'published';
  documentRef?: string;
  issn?: string;
  lead?: string;
  thematicAxis?: string;
  classification?: string;
  executiveSummary?: string;
  keyIndicators?: KeyIndicator[];
  sections?: ArticleSection[];
  academicMetadata?: AcademicMetadata;
}

export interface GlobalGlossaryEntry {
  term: string;
  definition: string;
  articleIds: string[];
  articleTitles: string[];
}
