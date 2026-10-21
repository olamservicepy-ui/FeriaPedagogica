import React, { useState, useRef } from 'react';
import {
  Upload,
  BookOpen,
  Globe2,
  Sparkles,
  Calendar,
  User,
  Mail,
  FileText,
  Plus,
  Trash2,
  Eye,
  Send,
  Database,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Shield,
  Lightbulb,
  Link as LinkIcon
} from 'lucide-react';
import type { NewsArticle, GlossaryItem } from '../types/news';
import {
  saveArticle,
  compressImage,
  getActiveSupabaseConfig,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  exportArticlesToJSON,
  importArticlesFromJSON
} from '../services/storage';
import {
  analyzeArticleDraft,
  type EditorialAnalysisResult
} from '../services/aiAssistant';

interface AdminPublishFormProps {
  allArticles: NewsArticle[];
  onArticlePublished: (newArticle: NewsArticle) => void;
  onPreviewArticle: (draft: NewsArticle) => void;
  onBackToHome: () => void;
}

const CATEGORIES = [
  'Moneda & Divisas',
  'Comercio Exterior',
  'Empleo & MiPyMEs',
  'Integración Regional',
  'Energía & Recursos',
  'Tecnología & Comercio',
  'Geoeconomía & Defensa'
];

const REGIONS = [
  'América Latina',
  'Asia-Pacífico',
  'Europa',
  'Norteamérica',
  'Medio Oriente & África',
  'Global'
];

const DEFAULT_AVATARS = [
  { name: 'Sofía Valenzuela', url: '/authors/sofia-valenzuela.jpg' },
  { name: 'Camila Morales', url: '/authors/camila-morales.jpg' },
  { name: 'Lucía Albarracín', url: '/authors/lucia-albarracin.jpg' },
  { name: 'Ignacio Chen', url: '/authors/ignacio-chen.jpg' }
];

export const AdminPublishForm: React.FC<AdminPublishFormProps> = ({
  allArticles,
  onArticlePublished,
  onPreviewArticle,
  onBackToHome
}) => {
  // Author state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRole, setAuthorRole] = useState(
    'Estudiante Investigador/a • Licenciatura en Relaciones Internacionales'
  );
  const [authorPhoto, setAuthorPhoto] = useState('/authors/sofia-valenzuela.jpg');
  const [photoPreview, setPhotoPreview] = useState('/authors/sofia-valenzuela.jpg');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Article state
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Moneda & Divisas');
  const [region, setRegion] = useState('América Latina');
  const [publishDate, setPublishDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sourcesText, setSourcesText] = useState('');

  // Executive summary
  const [summaryText, setSummaryText] = useState('');

  // Full body paragraphs
  const [fullText, setFullText] = useState('');

  // Dynamic Glossary: array of { term, definition }
  const [glossaryItems, setGlossaryItems] = useState<GlossaryItem[]>([
    {
      term: 'Desdolarización',
      definition:
        'Proceso de sustitución del dólar estadounidense como moneda de reserva y de liquidación en transacciones comerciales y financieras bilaterales.'
    }
  ]);
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');

  // IR Perspective
  const [geopoliticalContext, setGeopoliticalContext] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([
    'Promover mecanismos de compensación en monedas locales en el marco de la ALADI y el Mercosur.',
    'Diversificar los encajes de reservas internacionales incorporando divisas no occidentales y oro físico.'
  ]);
  const [newRecommendation, setNewRecommendation] = useState('');

  // UI feedback & Database Sync
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState(getActiveSupabaseConfig());
  const [customUrl, setCustomUrl] = useState(syncStatus.url);
  const [customKey, setCustomKey] = useState('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Word count helper
  const summaryWordCount = summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0;
  const fullTextWordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(2, Math.ceil((fullTextWordCount + summaryWordCount) / 160));

  // AI Editorial Copilot state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editorialAnalysis, setEditorialAnalysis] = useState<EditorialAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState('');

  const handleAnalyzeWithAI = async () => {
    if (!title.trim() && !fullText.trim() && !summaryText.trim()) {
      alert('Ingresa al menos el título o un fragmento de tu análisis para que el Copiloto Editorial pueda asistirte.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const result = await analyzeArticleDraft({
        title,
        rawText: fullText || summaryText,
        source: sourcesText,
        currentGlossary: glossaryItems,
      });
      setEditorialAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing article with AI:', err);
      setAnalysisError(err.message || 'Error al analizar el artículo con Groq.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestedCategory = (cat: string) => {
    setTopic(cat);
  };

  const handleApplySuggestedSummary = (bullets: string[]) => {
    setSummaryText(bullets.map((b) => (b.startsWith('•') ? b : `• ${b}`)).join('\n'));
  };

  const handleApplySuggestedGlossary = (suggestions: Array<{ term: string; definition: string }>) => {
    const existingTerms = new Set(glossaryItems.map((g) => g.term.toLowerCase()));
    const newItems = suggestions.filter((s) => !existingTerms.has(s.term.toLowerCase()));
    if (newItems.length > 0) {
      setGlossaryItems([...glossaryItems, ...newItems]);
    }
  };

  const handleApplyIRFeedback = (feedback: string) => {
    setGeopoliticalContext((prev) => (prev ? `${prev}\n\nEnfoque Estratégico Sugerido: ${feedback}` : feedback));
  };

  // Handle photo upload with client-side compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImage(file, 1000, 800, 0.82);
      setAuthorPhoto(compressedDataUrl);
      setPhotoPreview(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Hubo un inconveniente al procesar la imagen. Intenta con otra imagen o un enlace web.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Add term to dynamic glossary
  const handleAddGlossaryTerm = () => {
    if (!newTerm.trim() || !newDef.trim()) return;
    setGlossaryItems([
      ...glossaryItems,
      { term: newTerm.trim(), definition: newDef.trim() }
    ]);
    setNewTerm('');
    setNewDef('');
  };

  const handleRemoveGlossaryTerm = (index: number) => {
    setGlossaryItems(glossaryItems.filter((_, i) => i !== index));
  };

  // Add strategic recommendation
  const handleAddRecommendation = () => {
    if (!newRecommendation.trim()) return;
    setRecommendations([...recommendations, newRecommendation.trim()]);
    setNewRecommendation('');
  };

  const handleRemoveRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const handleUpdateRecommendation = (index: number, text: string) => {
    const updated = [...recommendations];
    updated[index] = text;
    setRecommendations(updated);
  };

  // Build NewsArticle draft object
  const buildArticleDraft = (): NewsArticle => {
    // Generate slug id
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'articulo-estudiante';
    const id = `${slug}-${Date.now().toString().slice(-4)}`;

    // Parse summary bullets (split by newline or bullet characters)
    const summaryBullets = summaryText
      .split(/\n+/)
      .map((line) => line.replace(/^[•\-\*\d\.\)\s]+/, '').trim())
      .filter((line) => line.length > 0);

    // Parse full text paragraphs
    const paragraphs = fullText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Parse sources
    const sourcesList = sourcesText
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return {
      id,
      title: title.trim() || 'Título del Análisis en Redacción',
      region,
      topic,
      date: publishDate,
      authors: [authorName.trim() || 'Estudiante Investigador'],
      author_image: authorPhoto,
      author_role: authorRole.trim(),
      summary_bullets: summaryBullets.length > 0 ? summaryBullets : [
        'Resumen en elaboración por el autor estudiantil.'
      ],
      full_text: paragraphs.length > 0 ? paragraphs : [
        'Cuerpo del análisis en proceso de edición.'
      ],
      glossary: glossaryItems,
      ir_perspective: {
        geopolitical_context: geopoliticalContext.trim(),
        strategic_recommendations: recommendations.filter((r) => r.trim().length > 0)
      },
      sources: sourcesList.length > 0 ? sourcesList : ['Observatorio de Economía Internacional - Cátedra RRII'],
      read_time_minutes: estimatedReadTime
    };
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!authorName.trim()) {
      errors.push('El nombre completo del estudiante es obligatorio.');
    }
    if (!authorEmail.trim() || !authorEmail.includes('@')) {
      errors.push('Ingresa un correo institucional o de contacto válido.');
    }
    if (!title.trim() || title.trim().length < 10) {
      errors.push('El título del análisis debe tener al menos 10 caracteres.');
    }
    if (!summaryText.trim() || summaryWordCount < 15) {
      errors.push('El resumen ejecutivo debe contener al menos 15 palabras.');
    }
    if (!fullText.trim() || fullTextWordCount < 30) {
      errors.push('El cuerpo del análisis debe contener al menos 30 palabras desarrolladas.');
    }
    if (!geopoliticalContext.trim()) {
      errors.push('La sección de RR.II. es obligatoria: completa el Análisis Geopolítico.');
    }
    if (recommendations.filter((r) => r.trim().length > 0).length === 0) {
      errors.push('Debes incluir al menos una recomendación estratégica en la sección de RR.II.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submit article
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const draft = buildArticleDraft();

    try {
      const res = await saveArticle(draft);
      onArticlePublished(draft);
      // Give feedback
      if (res.mode === 'supabase') {
        alert('🎉 ¡Artículo publicado exitosamente en Supabase y sincronizado localmente!');
      } else {
        alert('🎉 ¡Artículo publicado exitosamente en el Observatorio (Almacenamiento Local Autónomo)!');
      }
    } catch (err: any) {
      console.error('Error publishing:', err);
      alert('Ocurrió un error al publicar el artículo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview click
  const handlePreview = () => {
    const draft = buildArticleDraft();
    onPreviewArticle(draft);
  };

  // Pre-load example draft
  const handleLoadExample = () => {
    setAuthorName('Mariano A. Cárdenas');
    setAuthorEmail('mariano.cardenas@estudiantes.edu.ar');
    setAuthorRole('Estudiante Investigador • Integración Regional y Bloques Económicos');
    setAuthorPhoto('/authors/camila-morales.jpg');
    setPhotoPreview('/authors/camila-morales.jpg');
    setTitle('El Corredor Bioceánico Capricornio: Impacto en las MiPyMEs y el Comercio con el Sudeste Asiático');
    setTopic('Comercio Exterior');
    setRegion('América Latina');
    setPublishDate(new Date().toISOString().slice(0, 10));
    setSourcesText('CEPAL - Logística Comercial de Sudamérica, Puertos de Antofagasta y Santos, Banco Mundial');
    setSummaryText(
      '• La articulación de la ruta entre los puertos del Atlántico (Santos) y del Pacífico (Antofagasta/Iquique) reduce en hasta 15 días el tránsito marítimo hacia Asia.\n' +
      '• Permite a las economías regionales del Norte Grande argentino y Paraguay eludir los cuellos de botella de la Hidrovía Paraná-Paraguay.\n' +
      '• Representa una oportunidad crítica de inserción internacional para MiPyMEs agroindustriales y proveedoras de servicios logísticos.'
    );
    setFullText(
      'La consolidación de la infraestructura bioceánica a través del Trópico de Capricornio transforma la geografía económica del Cono Sur. Durante décadas, la centralización de los flujos de exportación hacia los puertos fluviales y bonaerenses encareció el costo logístico de las producciones del noroeste argentino, el Chaco paraguayo y el sur boliviano.\n\n' +
      'Con la pavimentación de los tramos pendientes y la estandarización de trámites aduaneros integrados, los tiempos de navegación hacia los mercados de Asia Oriental —principalmente China, Vietnam e Indonesia— se reducen de 40 a 25 días. Esta ventaja comparativa resulta determinante para productos perecederos con alto valor agregado provenientes de cooperativas y medianas empresas.\n\n' +
      'No obstante, el verdadero desafío geopolítico radica en armonizar las normativas fitosanitarias, asegurar financiamiento para parques industriales logísticos y evitar que el corredor funcione únicamente como canal de extracción primaria sin eslabonamientos manufactureros en las ciudades de paso.'
    );
    setGlossaryItems([
      {
        term: 'Corredor Bioceánico',
        definition:
          'Eje de transporte multimodal (carretero, ferroviario y portuario) que conecta las costas de los océanos Atlántico y Pacífico atravesando América del Sur.'
      },
      {
        term: 'Costos de Transacción Logística',
        definition:
          'Gastos directos e indirectos generados por fletes, demoras aduaneras, transbordos y seguros necesarios para trasladar bienes entre fronteras.'
      }
    ]);
    setGeopoliticalContext(
      'El Corredor Capricornio se inserta en la competencia global de conectividad entre la Iniciativa de la Franja y la Ruta china y las prioridades de cadenas de suministro resilientes de Occidente. El control logístico de los pasos cordilleranos y los puertos de aguas profundas otorga al Cono Sur un margen de negociación inédito frente a los grandes bloques de ultramar.'
    );
    setRecommendations([
      'Implementar una Ventanilla Única de Comercio Exterior Digital (VUCE) compartida entre Argentina, Brasil, Paraguay y Chile para despacho anticipado en frontera.',
      'Crear un Fondo Fiduciario Subregional para subsidiar tasas de financiamiento a MiPyMEs locales que incorporen trazabilidad y certificaciones ambientales.',
      'Fortalecer el Comité de Integración Fronteriza dotándolo de facultades operativas frente a contingencias climáticas en la Puna.'
    ]);
    setValidationErrors([]);
  };

  // Save Supabase Configuration
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      alert('Ingresa tanto la URL como la Anon Key de Supabase.');
      return;
    }
    saveCustomSupabaseConfig(customUrl, customKey);
    setSyncStatus(getActiveSupabaseConfig());
    setConfigSuccessMsg('¡Credenciales guardadas y cliente Supabase activado!');
    setTimeout(() => setConfigSuccessMsg(''), 4000);
  };

  const handleClearSupabaseConfig = () => {
    clearCustomSupabaseConfig();
    setCustomUrl('');
    setCustomKey('');
    setSyncStatus(getActiveSupabaseConfig());
    setConfigSuccessMsg('Configuración restablecida al modo LocalStorage.');
    setTimeout(() => setConfigSuccessMsg(''), 3000);
  };

  // Handle JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importArticlesFromJSON(text);
      if (res.success) {
        alert(`¡Base de datos actualizada con éxito! Se importaron ${res.count} artículos.`);
        window.location.reload();
      } else {
        alert('Error al importar JSON: ' + (res.error || 'Archivo inválido'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-950 pb-24">
      {/* Top Banner & Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700" />
              <span>Volver a Portada</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Panel de Publicación Estudiantil
              </span>
              <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Feria Pedagógica RRII
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Badge */}
            <button
              type="button"
              onClick={() => setShowConfigModal(!showConfigModal)}
              title="Ver estado de conexión y base de datos"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                syncStatus.isConfigured
                  ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
                  : 'bg-amber-50/90 text-amber-900 border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus.isConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline font-mono">
                {syncStatus.isConfigured ? 'Supabase Activo' : 'LocalStorage Autónomo'}
              </span>
              <Database className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            </button>

            {/* AI Editorial Copilot Button */}
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 text-white hover:from-emerald-800 hover:to-teal-800 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Analizar título y texto con Groq (Llama-3.3-70b) para sugerir categorías, resumen y glosario"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analizando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Copiloto Editorial IA</span>
                </>
              )}
            </button>

            {/* Quick Demo Pre-fill */}
            <button
              type="button"
              onClick={handleLoadExample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200/80 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 shadow-xs transition-all cursor-pointer"
              title="Cargar un ejemplo completo para ver cómo funciona"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cargar Ejemplo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Database Configuration Drawer/Modal */}
      {showConfigModal && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 space-y-5 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                  Persistencia y Respaldo de Artículos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup & Restore Controls */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Respaldos y Portabilidad JSON
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Descarga la base de datos completa de artículos (incluyendo investigaciones preexistentes y publicaciones de los estudiantes) para incorporar al repositorio o resguardar la feria.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => exportArticlesToJSON(allArticles)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Respaldo JSON ({allArticles.length} artículos)
                  </button>

                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    Importar / Restaurar JSON
                  </button>
                  <input
                    ref={jsonImportRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileImport}
                  />
                </div>
              </div>

              {/* Supabase Connection Setup */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Conexión Supabase (Nube)</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      syncStatus.isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {syncStatus.isConfigured ? 'Conectado' : 'Modo Autónomo Local'}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Puedes configurar las variables en tu archivo <code className="bg-white px-1 py-0.5 rounded border text-emerald-800 font-mono text-[11px]">.env</code> o ingresar las credenciales directamente aquí para pruebas en vivo.
                </p>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-2 pt-1">
                  <div>
                    <input
                      type="url"
                      placeholder="https://xyz.supabase.co"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Supabase anon public key"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-all cursor-pointer"
                    >
                      Guardar Credenciales
                    </button>
                    {syncStatus.source === 'custom' && (
                      <button
                        type="button"
                        onClick={handleClearSupabaseConfig}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                  {configSuccessMsg && (
                    <p className="text-xs text-emerald-700 font-medium">{configSuccessMsg}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Editorial Introduction */}
        <div className="mb-8 space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Publicación Autónoma y Rigor Académico
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Cargar Análisis de Economía & Relaciones Internacionales
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
            Completa la ficha técnica para publicar tu investigación. El sistema aplicará automáticamente la diagramación editorial de la Feria Pedagógica, vinculará los términos de tu glosario y posicionará tu artículo en la portada.
          </p>
        </div>

        {/* Editorial Copilot AI Suggestions Card */}
        {editorialAnalysis && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 border-2 border-emerald-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5 animate-in slide-in-from-top-3 duration-300">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Copiloto Editorial Académico • Sugerencias de Groq
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Propuestas generadas con IA (Llama-3.3-70b) para enriquecer y optimizar tu publicación
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditorialAnalysis(null)}
                className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
              >
                Ocultar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category suggestion */}
              {editorialAnalysis.suggestedCategory && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                      Categoría Recomendada
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplySuggestedCategory(editorialAnalysis.suggestedCategory!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      Aplicar Categoría
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {editorialAnalysis.suggestedCategory}
                  </p>
                  {editorialAnalysis.tags && editorialAnalysis.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {editorialAnalysis.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IR Perspective Feedback */}
              {editorialAnalysis.irPerspectiveFeedback && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                      Enfoque Diplomático & RR.II.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyIRFeedback(editorialAnalysis.irPerspectiveFeedback!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      Inspirar Análisis
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {editorialAnalysis.irPerspectiveFeedback}
                  </p>
                </div>
              )}

              {/* Executive Summary Suggestion */}
              {editorialAnalysis.executiveSummary && editorialAnalysis.executiveSummary.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                      Resumen Ejecutivo Sugerido
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplySuggestedSummary(editorialAnalysis.executiveSummary!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      Insertar en Resumen
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {editorialAnalysis.executiveSummary.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Glossary suggestions */}
              {editorialAnalysis.glossarySuggestions && editorialAnalysis.glossarySuggestions.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                      Términos de Glosario Detectados ({editorialAnalysis.glossarySuggestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplySuggestedGlossary(editorialAnalysis.glossarySuggestions!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      + Incorporar al Glosario
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {editorialAnalysis.glossarySuggestions.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-emerald-900 block">{item.term}</span>
                        <span className="text-slate-600 text-[11px] leading-relaxed">{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Error Alert */}
        {analysisError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <strong>Aviso de Groq:</strong> {analysisError}
          </div>
        )}

        {/* Validation Errors Alert Box */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Por favor revisa los siguientes campos obligatorios:</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 text-rose-800">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-8">
          {/* Card 1: Datos del Estudiante */}
          <section className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  1. Datos del Estudiante Investigador
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Identificación académica y fotografía de autor para la portada editorial difuminada
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                  Nombre Completo <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía M. Valenzuela"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                  Correo Institucional <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="alumno@institucional.edu.ar"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                  Rol Académico o Cátedra
                </label>
                <input
                  type="text"
                  placeholder="Ej. Estudiante Investigador/a • Licenciatura en Relaciones Internacionales"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                />
              </div>

              {/* Author Photo Upload & Live Preview */}
              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-800 font-sans">
                  Fotografía de Autor <span className="text-emerald-700">*</span>
                  <span className="text-slate-500 font-normal ml-1">
                    (Se utilizará en el fondo difuminado de portada y en la ficha de firma)
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  {/* Photo Preview Thumbnail */}
                  <div className="relative group shrink-0">
                    <img
                      src={photoPreview}
                      alt="Previsualización de autor"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-2 border-emerald-600/40 shadow-md"
                      onError={() => setPhotoPreview('/authors/sofia-valenzuela.jpg')}
                    />
                    {isCompressingPhoto && (
                      <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center text-white text-[10px] font-medium">
                        Comprimiendo...
                      </div>
                    )}
                  </div>

                  {/* Actions for Photo */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressingPhoto}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto desde mi Dispositivo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </div>

                    {/* Pre-set Avatars Picker */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-mono block">
                        O selecciona un avatar editorial predeterminado:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {DEFAULT_AVATARS.map((av) => (
                          <button
                            key={av.name}
                            type="button"
                            onClick={() => {
                              setAuthorPhoto(av.url);
                              setPhotoPreview(av.url);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                              authorPhoto === av.url
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <img
                              src={av.url}
                              alt={av.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span>{av.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Datos de la Noticia */}
          <section className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  2. Datos del Análisis Económico
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Título, categorización temática, fuentes y coordenadas geográficas
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                  Título del Análisis Editorial <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. La Guerra por el Litio en el Triángulo Sudamericano y la Transición Energética"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                    Categoría Económica <span className="text-emerald-700">*</span>
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                    Región Geopolítica <span className="text-emerald-700">*</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white cursor-pointer"
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                    Fecha de Publicación <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
                  Medio / Fuente Original o Referencias Académicas
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ej. Reuters, Financial Times, CEPAL, Banco Mundial (separadas por coma)"
                    value={sourcesText}
                    onChange={(e) => setSourcesText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Separa las diferentes fuentes con comas o saltos de línea.
                </p>
              </div>
            </div>
          </section>

          {/* Card 3: Resumen Ejecutivo con Guía Visual */}
          <section className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    3. Resumen Ejecutivo (Puntos Clave)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Ingresa viñetas o párrafos condensados con los hallazgos principales
                  </p>
                </div>
              </div>

              {/* Visual Extension Gauge */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">{summaryWordCount} palabras</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    summaryWordCount >= 30 && summaryWordCount <= 180
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : summaryWordCount > 180
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {summaryWordCount >= 30 && summaryWordCount <= 180
                    ? 'Extensión Óptima'
                    : summaryWordCount > 180
                    ? 'Extenso'
                    : 'Breve (mín 30 pal.)'}
                </span>
              </div>
            </div>

            <div>
              <textarea
                rows={4}
                required
                placeholder={
                  "• Argentina, Bolivia y Chile concentran el 55% de reservas de litio en salmueras.\n" +
                  "• La falta de gobernanza unificada debilita la capacidad de negociación con Asia y Occidente.\n" +
                  "• Se requiere un marco subregional para agregar valor en baterías."
                }
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Guía: Separa cada punto clave con un salto de línea. El lector lo verá en una caja destacada.</span>
                <span className="font-mono">{summaryText.length} caracteres</span>
              </div>
            </div>
          </section>

          {/* Card 4: Cuerpo del Análisis (Texto Completo) */}
          <section className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    4. Desarrollo del Análisis en Profundidad
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Párrafos explicativos. Los términos del glosario se enlazarán automáticamente.
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500">
                <span>{fullTextWordCount} palabras • ~{estimatedReadTime} min lectura</span>
              </div>
            </div>

            <div>
              <textarea
                rows={9}
                required
                placeholder="Escribe o pega aquí el desarrollo analítico de tu investigación. Separa los párrafos con un doble salto de línea (Enter dos veces)..."
                value={fullText}
                onChange={(e) => setFullText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm sm:text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all font-sans"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 font-sans">
                💡 <strong>Consejo editorial:</strong> Si mencionas los términos económicos definidos en la sección siguiente, el sistema los subrayará automáticamente con una ventana emergente interactiva de consulta.
              </p>
            </div>
          </section>

          {/* Card 5: Glosario Dinámico */}
          <section className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    5. Glosario Dinámico
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Añade pares de [Término Económico] y [Definición Sencilla] para divulgación académica
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
                {glossaryItems.length} {glossaryItems.length === 1 ? 'término' : 'términos'}
              </span>
            </div>

            {/* List of current glossary items */}
            {glossaryItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {glossaryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-bold text-emerald-900 tracking-tight">
                          {item.term}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGlossaryTerm(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar término"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {item.definition}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form to add a new term */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                + Agregar Nuevo Término al Glosario
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Término Económico (ej: Arancel)"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Definición sencilla y rigurosa..."
                    value={newDef}
                    onChange={(e) => setNewDef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddGlossaryTerm}
                  disabled={!newTerm.trim() || !newDef.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Término</span>
                </button>
              </div>
            </div>
          </section>

          {/* Card 6: Sección Relaciones Internacionales (Obligatoria) */}
          <section className="bg-white/80 backdrop-blur-xl border-2 border-emerald-600/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] space-y-6 relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      6. Perspectiva de Relaciones Internacionales
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Obligatoria RR.II.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    Análisis geopolítico y recomendaciones estratégicas formuladas para tomadores de decisión
                  </p>
                </div>
              </div>
            </div>

            {/* Geopolitical Context Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 font-sans">
                Análisis Geopolítico <span className="text-emerald-700">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Examina el impacto en el equilibrio de poder global, la competencia hegemónica, los tratados multilaterales o la autonomía estratégica del Sur Global..."
                value={geopoliticalContext}
                onChange={(e) => setGeopoliticalContext(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Strategic Recommendations List */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-800 font-sans">
                Recomendaciones Estratégicas <span className="text-emerald-700">*</span>
                <span className="text-slate-500 font-normal ml-1">
                  (Mínimo 1 propuesta para diplomáticos, ministerios o bloques regionales)
                </span>
              </label>

              <div className="space-y-2.5">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={rec}
                      onChange={(e) => handleUpdateRecommendation(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRecommendation(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar recomendación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Recommendation Row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Escribe una nueva propuesta estratégica..."
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecommendation();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                />
                <button
                  type="button"
                  onClick={handleAddRecommendation}
                  disabled={!newRecommendation.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </section>

          {/* Action Floating / Sticky Bar */}
          <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Revisa tu artículo con <strong>Previsualizar</strong> antes de publicarlo oficialmente.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePreview}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all duration-200 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Previsualizar Noticia</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publicar Noticia</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
