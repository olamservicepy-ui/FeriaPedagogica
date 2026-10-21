import { useState, useMemo } from 'react';
import {
  Filter,
  ChevronDown,
  Clock,
  Building2,
  ArrowRight,
  Globe2,
  Share2,
  Printer,
  X
} from 'lucide-react';

export interface Author {
  name: string;
  role: string;
  career: string;
  avatar: string;
}

export interface AcademicArticle {
  id: string;
  themeId: string;
  thematicTitle: string;
  title: string;
  category: string;
  type: string;
  date: string;
  readTime: string;
  summary: string;
  lead: string;
  layoutVariant: 'lead-photo' | 'compact-photo' | 'text-only' | string;
  author: Author;
}

// Sample dataset structured by thematic academic axes
export const INITIAL_ARTICLES: AcademicArticle[] = [
  {
    id: "art-01",
    themeId: "macroeconomia",
    thematicTitle: "I. Macroeconomía, Política Fiscal y Sector Financiero",
    title: "Entre enero y agosto, déficit fiscal alcanzó 1,7% del PIB, mientras inversión pública creció casi 20%",
    category: "POLÍTICA FISCAL",
    type: "Informe Especial",
    date: "15 de Septiembre, 2026",
    readTime: "3 min de lectura",
    summary: "El informe de Situación Financiera de la Dirección de Política Macrofiscal detalló la convergencia gradual hacia el tope de la Ley de Responsabilidad Fiscal, impulsada por mejoras tributarias y obras viales de interconexión regional.",
    lead: "La inversión física en corredores logísticos y la recaudación aduanera marcan la trayectoria de las finanzas públicas paraguayas hacia el cierre del ejercicio fiscal 2026.",
    layoutVariant: "lead-photo",
    author: {
      name: "Liz Rocío Peña Bloy",
      role: "Estudiante Investigadora",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-02",
    themeId: "macroeconomia",
    thematicTitle: "I. Macroeconomía, Política Fiscal y Sector Financiero",
    title: "Senado solicita información al Banco Central sobre balances fiduciarios y fusiones en la banca digital",
    category: "SUPERVISIÓN BANCARIA",
    type: "Dictamen Técnico",
    date: "09 de Septiembre, 2026",
    readTime: "4 min de lectura",
    summary: "Requerimientos de solvencia, encajes legales y monitoreo prudencial tras la consolidación de licencias bancarias digitales en el sistema de pagos del Cono Sur.",
    lead: "La interpelación parlamentaria indaga sobre las garantías colaterales y la exposición del crédito al consumo ante la Superintendencia de Bancos.",
    layoutVariant: "compact-photo",
    author: {
      name: "Arianne Saray Ríos Flor",
      role: "Estudiante Investigadora",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-03",
    themeId: "macroeconomia",
    thematicTitle: "I. Macroeconomía, Política Fiscal y Sector Financiero",
    title: "El efecto de las tasas de interés de la Reserva Federal sobre las colocaciones de deuda soberana del Mercosur",
    category: "MERCADO DE CAPITALES",
    type: "Commentary",
    date: "28 de Agosto, 2026",
    readTime: "2 min de lectura",
    summary: "Análisis de la dispersión de spreads de los bonos soberanos latinoamericanos y la ventana de refinanciamiento ante el endurecimiento de la liquidez externa.",
    lead: "El margen de maniobra fiscal de los países en desarrollo se estrecha ante el rendimiento sostenido de los títulos del Tesoro norteamericano.",
    layoutVariant: "text-only",
    author: {
      name: "Matías E. Duarte Rolón",
      role: "Estudiante Investigador",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-04",
    themeId: "geopolitica",
    thematicTitle: "II. Integración Regional, Transporte y Geopolítica",
    title: "El Corredor Bioceánico y el Chaco como nodo logístico entre el Atlántico y los puertos del Pacífico",
    category: "INTEGRACIÓN FÍSICA",
    type: "Ponencia Central",
    date: "14 de Septiembre, 2026",
    readTime: "5 min de lectura",
    summary: "La habilitación de tramos viales transversales acorta en hasta 14 días las travesías marítimas de la agroindustria sudamericana rumbo a Shanghái y Singapur.",
    lead: "La integración territorial de Paraguay, Brasil, Argentina y Chile replantea las dinámicas arancelarias y las ventanillas de paso aduanero intermodal.",
    layoutVariant: "lead-photo",
    author: {
      name: "Araceli Alejandra Paredes Sugastti",
      role: "Estudiante Investigadora",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-05",
    themeId: "geopolitica",
    thematicTitle: "II. Integración Regional, Transporte y Geopolítica",
    title: "Peajes y libre navegabilidad en la Hidrovía Paraguay-Paraná: El debate de la soberanía fluvial",
    category: "DIPLOMACIA FLUVIAL",
    type: "Documento de Trabajo",
    date: "04 de Septiembre, 2026",
    readTime: "3 min de lectura",
    summary: "Discrepancias normativas sobre las tasas de mantenimiento de balizamiento aplicadas en el tramo Confluencia-Santa Fe y la vigencia del Tratado de Santa Cruz de la Sierra.",
    lead: "La hidrovía moviliza más del 75% del comercio exterior paraguayo, requiriendo un arbitraje institucional transparente en el Comité Intergubernamental de la Cuenca del Plata.",
    layoutVariant: "compact-photo",
    author: {
      name: "Camila V. Benítez Sosa",
      role: "Estudiante Investigadora",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-06",
    themeId: "geopolitica",
    thematicTitle: "II. Integración Regional, Transporte y Geopolítica",
    title: "Ventanillas únicas digitales de comercio exterior: El cuello de botella en los pasos fronterizos del Mercosur",
    category: "FACILITACIÓN DEL COMERCIO",
    type: "Policy Brief",
    date: "22 de Agosto, 2026",
    readTime: "2 min de lectura",
    summary: "A pesar de las obras físicas, las asimetrías de software aduanero entre países vecinos restan hasta un 30% de la celeridad prometida por los nuevos corredores viales.",
    lead: "La interoperabilidad de datos fronterizos demanda una secretaría técnica permanente con financiamiento multilateral de CAF y FONPLATA.",
    layoutVariant: "text-only",
    author: {
      name: "Esteban R. González Silva",
      role: "Estudiante Investigador",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-07",
    themeId: "energia",
    thematicTitle: "III. Soberanía Energética y Negociaciones Bilaterales",
    title: "Revisión del Anexo C de Itaipú: Soberanía de despacho, fijación de tarifas y mercado libre brasileño",
    category: "DIPLOMACIA ENERGÉTICA",
    type: "Monografía Estratégica",
    date: "18 de Septiembre, 2026",
    readTime: "6 min de lectura",
    summary: "Tras la cancelación de la deuda de construcción de la central hidroeléctrica, la delegación paraguaya sostiene la postura de comercialización en el mercado libre de energía.",
    lead: "El dilema histórico entre maximizar las rentas financieras por cesión de energía o impulsar parques industriales electrointensivos dentro del territorio nacional.",
    layoutVariant: "lead-photo",
    author: {
      name: "Nelson Raúl Coronel Segovia",
      role: "Estudiante Investigador",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-08",
    themeId: "energia",
    thematicTitle: "III. Soberanía Energética y Negociaciones Bilaterales",
    title: "Yacyretá y la compensación por territorio inundado: Los litigios financieros en la Cuenca del Paraná",
    category: "TRATADOS BINACIONALES",
    type: "Dictamen Técnico",
    date: "01 de Septiembre, 2026",
    readTime: "4 min de lectura",
    summary: "El estado de las transferencias fiduciarias por cesión de energía y la postergada ratificación parlamentaria de la Nota Reversal de 2017.",
    lead: "La sustentabilidad operativa de la Entidad Binacional Yacyretá depende de la regularización de las deudas cruzadas entre las empresas estatales de ambos márgenes.",
    layoutVariant: "compact-photo",
    author: {
      name: "Valeria M. Ferreira Cabrera",
      role: "Estudiante Investigadora",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "art-09",
    themeId: "energia",
    thematicTitle: "III. Soberanía Energética y Negociaciones Bilaterales",
    title: "Matriz energética renovable y radicación de data centers en el eje de 500 kV",
    category: "DESARROLLO SOSTENIBLE",
    type: "Commentary",
    date: "25 de Agosto, 2026",
    readTime: "2 min de lectura",
    summary: "Evaluación de proyectos de inteligencia artificial y almacenamiento masivo de datos como consumidores de carga de base limpia y no contaminante.",
    lead: "El excedente hidroeléctrico representa la mayor ventaja competitiva paraguaya para la transición hacia infraestructuras tecnológicas verdes de escala global.",
    layoutVariant: "text-only",
    author: {
      name: "Lucas D. Ramírez Ortiz",
      role: "Estudiante Investigador",
      career: "Lic. en Relaciones Internacionales",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
    }
  }
];

export function AcademicPlatformEconomiaIV() {
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeArticleModal, setActiveArticleModal] = useState<AcademicArticle | null>(null);

  // Available filters
  const filterOptions = [
    { id: "TODAS", label: "Todas las investigaciones", count: INITIAL_ARTICLES.length },
    { id: "POLÍTICA FISCAL", label: "Política Fiscal", count: 1 },
    { id: "SUPERVISIÓN BANCARIA", label: "Supervisión Bancaria", count: 1 },
    { id: "MERCADO DE CAPITALES", label: "Mercado de Capitales", count: 1 },
    { id: "INTEGRACIÓN FÍSICA", label: "Integración Física", count: 1 },
    { id: "DIPLOMACIA FLUVIAL", label: "Diplomacia Fluvial", count: 1 },
    { id: "FACILITACIÓN DEL COMERCIO", label: "Facilitación del Comercio", count: 1 },
    { id: "DIPLOMACIA ENERGÉTICA", label: "Diplomacia Energética", count: 1 },
    { id: "TRATADOS BINACIONALES", label: "Tratados Binacionales", count: 1 },
    { id: "DESARROLLO SOSTENIBLE", label: "Desarrollo Sostenible", count: 1 }
  ];

  // Group filtered articles by their academic theme
  const groupedThematicArticles = useMemo(() => {
    const filtered = selectedCategory === "TODAS"
      ? INITIAL_ARTICLES
      : INITIAL_ARTICLES.filter(item => item.category === selectedCategory);

    const groups: Record<string, { themeId: string; thematicTitle: string; articles: AcademicArticle[] }> = {};
    filtered.forEach(art => {
      if (!groups[art.themeId]) {
        groups[art.themeId] = {
          themeId: art.themeId,
          thematicTitle: art.thematicTitle,
          articles: []
        };
      }
      groups[art.themeId].articles.push(art);
    });

    return Object.values(groups);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A2530] font-sans antialiased selection:bg-[#E0F2FE] selection:text-[#002A54]">
      
      {/* 1. TOP INSTITUTIONAL BAR */}
      <header className="w-full bg-[#002A54] text-white border-b border-[#004F8A] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#009EDB] text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#BAE6FD]">
                FERIA PEDAGÓGICA - FACULTAD DE HUMANIDADES, CIENCIAS SOCIALES Y CULTURA GUARANÍ - EDICIÓN 2026
              </p>
              <p className="text-[10px] text-slate-300 font-medium">
                Cátedra de Economía IV • Carrera de Relaciones Internacionales
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#009EDB] animate-pulse" />
            <span>Observatorio de Relaciones Internacionales</span>
          </div>

        </div>
      </header>

      {/* 2. HERO COVER BANNER */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F0F9FF] text-[#004F8A] border border-[#BAE6FD]">
              <Globe2 className="w-3.5 h-3.5 text-[#009EDB]" />
              <span>Divulgación Académica y Científica</span>
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#002A54] tracking-tight leading-[1.15]">
              Plataforma de divulgación académica de Economía IV
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Repositorio de monografías, dictámenes de coyuntura macroeconómica e investigaciones analíticas producidas por estudiantes de Relaciones Internacionales en el marco de la Feria Pedagógica Universitaria.
            </p>

          </div>

          {/* 3. DROPDOWN FILTER SECTION */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Línea de Estudio:
              </span>

              {/* DROPDOWN MENU */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-white text-xs font-bold text-[#002A54] border border-slate-300 rounded-xl shadow-xs hover:border-[#009EDB] transition-all cursor-pointer"
                  aria-expanded={isDropdownOpen}
                >
                  <Filter className="w-3.5 h-3.5 text-[#009EDB]" />
                  <span>
                    {filterOptions.find(f => f.id === selectedCategory)?.label || "Filtrar por eje temático"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Seleccionar Criterio
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-0.5">
                      {filterOptions.map((opt) => {
                        const isSelected = selectedCategory === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedCategory(opt.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#F0F9FF] text-[#004F8A] font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate mr-2">{opt.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                              isSelected ? 'bg-[#BAE6FD] text-[#002A54]' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {opt.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-[#002A54]">{groupedThematicArticles.reduce((acc, g) => acc + g.articles.length, 0)}</strong> investigaciones publicadas
            </div>

          </div>
        </div>
      </section>

      {/* 4. THEMATIC ASYMMETRIC BENTO GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {groupedThematicArticles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            No se encontraron investigaciones para la categoría seleccionada.
          </div>
        ) : (
          groupedThematicArticles.map((themeGroup) => {
            const lead = themeGroup.articles.find(a => a.layoutVariant === "lead-photo") || themeGroup.articles[0];
            const compact = themeGroup.articles.find(a => a.layoutVariant === "compact-photo");
            const textOnly = themeGroup.articles.find(a => a.layoutVariant === "text-only");
            const others = themeGroup.articles.filter(a => a.id !== lead?.id && a.id !== compact?.id && a.id !== textOnly?.id);

            return (
              <section key={themeGroup.themeId} className="space-y-6">
                
                {/* Academic Chapter Heading */}
                <div className="flex items-center justify-between border-b-2 border-[#002A54] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-6 bg-[#009EDB] rounded-xs" />
                    <h2 className="text-lg sm:text-xl font-black text-[#002A54] tracking-tight">
                      {themeGroup.thematicTitle}
                    </h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#004F8A]">
                    {themeGroup.articles.length} {themeGroup.articles.length === 1 ? 'Análisis' : 'Análisis'}
                  </span>
                </div>

                {/* 3-Column Asymmetric Bento Composition */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* COLUMN 1: Lead Analysis with Large Student Photo (6 cols) */}
                  {lead && (
                    <article
                      onClick={() => setActiveArticleModal(lead)}
                      className="group cursor-pointer lg:col-span-6 bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#009EDB] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Hero Image Container with top alignment so student face is clear */}
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 select-none">
                          <img
                            src={lead.author.avatar}
                            alt={lead.author.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute top-3 left-3 bg-[#002A54] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs">
                            {lead.category}
                          </span>
                        </div>

                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#004F8A] uppercase tracking-wider">
                            <span>{lead.type}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-normal">{lead.date}</span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-[#002A54] leading-snug tracking-tight underline-offset-4 decoration-2 decoration-[#009EDB] group-hover:underline">
                            {lead.title}
                          </h3>

                          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {lead.summary}
                          </p>
                        </div>
                      </div>

                      {/* Author Strip */}
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={lead.author.avatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover object-top border border-slate-300"
                          />
                          <span className="font-bold text-[#002A54]">{lead.author.name}</span>
                        </div>
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#009EDB]" />
                          {lead.readTime}
                        </span>
                      </div>
                    </article>
                  )}

                  {/* COLUMN 2: Compact Split Layout with Small Photo (3 cols) */}
                  {compact && (
                    <article
                      onClick={() => setActiveArticleModal(compact)}
                      className="group cursor-pointer lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#009EDB] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Compact Top Image */}
                        <div className="relative w-full h-44 overflow-hidden bg-slate-100 select-none">
                          <img
                            src={compact.author.avatar}
                            alt={compact.author.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#002A54] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border border-slate-200">
                            {compact.category}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <span className="text-[10px] font-bold text-[#004F8A] uppercase tracking-wider block">
                            {compact.type}
                          </span>

                          <h3 className="text-base font-bold text-[#002A54] leading-snug underline-offset-2 decoration-1 decoration-[#009EDB] group-hover:underline">
                            {compact.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {compact.summary}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                          {compact.author.name}
                        </span>
                        <span>{compact.readTime}</span>
                      </div>
                    </article>
                  )}

                  {/* COLUMN 3: 100% Text-Only Think Tank Card (3 cols) */}
                  {textOnly && (
                    <article
                      onClick={() => setActiveArticleModal(textOnly)}
                      className="group cursor-pointer lg:col-span-3 bg-[#F0F9FF]/60 border border-[#BAE6FD] rounded-2xl p-5 hover:bg-[#F0F9FF] hover:border-[#009EDB] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#004F8A] bg-white px-2 py-0.5 rounded border border-[#BAE6FD]">
                            {textOnly.type}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {textOnly.date}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            {textOnly.category}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-[#002A54] leading-snug underline-offset-2 decoration-1 decoration-[#009EDB] group-hover:underline">
                            {textOnly.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                          {textOnly.summary}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#BAE6FD]/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#002A54]">
                          {textOnly.author.name}
                        </span>
                        <span className="text-[#004F8A] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Leer</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  )}

                </div>

                {/* Additional articles if any in this category */}
                {others.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {others.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => setActiveArticleModal(item)}
                        className="group cursor-pointer bg-white border border-slate-200 rounded-xl p-4 hover:border-[#009EDB] transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#004F8A] uppercase">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-[#002A54] leading-snug underline-offset-2 group-hover:underline">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {item.summary}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-[#002A54]">{item.author.name}</span>
                          <span>{item.readTime}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

              </section>
            );
          })
        )}
      </main>

      {/* 5. FORMAL ACADEMIC READER MODAL */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-300 shadow-2xl overflow-hidden relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Top Bar */}
            <div className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-20">
              <span className="text-xs font-bold text-[#004F8A] uppercase tracking-wider">
                {activeArticleModal.category} • OBSERVATORIO R.R.I.I.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator?.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                    alert("Enlace copiado al portapapeles");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Compartir</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveArticleModal(null)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition ml-1 cursor-pointer"
                >
                  <span>Cerrar</span>
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Hero Banner with top-anchored photo and delayed bottom-only gradient */}
              <div className="relative w-full h-80 sm:h-96 bg-slate-100 overflow-hidden select-none border-b border-slate-200">
                <img
                  src={activeArticleModal.author.avatar}
                  alt={activeArticleModal.author.name}
                  className="w-full h-full object-cover object-top"
                />

                {/* Soft gradient starting at 15% from bottom, keeping facial features completely clear */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent via-15% pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-6 pt-6 z-10">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#004F8A] bg-white/95 px-2.5 py-1 rounded border border-slate-200">
                      {activeArticleModal.type}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002A54] leading-tight tracking-tight">
                      {activeArticleModal.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8 space-y-6">
                
                {/* Author Card */}
                <div className="p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeArticleModal.author.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover object-top border-2 border-white shadow-xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#002A54]">{activeArticleModal.author.name}</p>
                      <p className="text-[11px] text-slate-600">{activeArticleModal.author.role} • {activeArticleModal.author.career}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:inline">{activeArticleModal.date}</span>
                </div>

                <p className="text-base text-slate-800 leading-relaxed border-l-4 border-[#009EDB] pl-4 font-serif">
                  {activeArticleModal.lead}
                </p>

                <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                  <p>{activeArticleModal.summary}</p>
                  <p>
                    Este dictamen forma parte de los trabajos evaluados en la Feria Pedagógica de la Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní, integrando fuentes estadísticas oficiales, normativas bancarias y acuerdos multilaterales del Mercosur.
                  </p>
                </div>

                <footer className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                  <span>Cátedra de Economía IV</span>
                  <span>Feria Pedagógica 2026</span>
                </footer>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AcademicPlatformEconomiaIV;
