import type { PhotoCrop } from '../types/news';

export interface AuthorProfile {
  name: string;
  role: string;
  image: string;
  photoCrop?: PhotoCrop;
  institution: string;
  faculty?: string;
  school?: string;
  department?: string;
  location?: string;
  reviewers?: string;
  fairEdition?: string;
  academicId?: string;
  specialization?: string;
  email?: string;
  bio?: string;
}

const DEFAULT_FACULTY = "Facultad de Humanidades, Ciencias Sociales y Cultura Guaraní";
const DEFAULT_SCHOOL = "Licenciatura en Relaciones Internacionales";
const DEFAULT_DEPT = "Observatorio Económico y Político Regional";
const DEFAULT_LOCATION = "Campus Universitario • Encarnación, Paraguay";
const DEFAULT_REVIEWERS = "Cátedra de Economía Internacional & Integración Regional";
const DEFAULT_FAIR = "Feria Pedagógica Universitaria 2026";
const DEFAULT_INSTITUTION = "Universidad Nacional de Itapúa (UNI)";

export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  // Arianne Saray Ríos Flor
  'Arianne Saray Ríos Flor': {
    name: 'Arianne Saray Ríos Flor',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-018',
    specialization: 'Política Monetaria & Integración Financiera del Cono Sur',
    email: 'a.rios.flor@investigacion.edu.py',
    bio: 'Investigación en gobernanza bancaria, encajes legales y supervisión de entidades fiduciarias telemáticas en América Latina.'
  },

  // Araceli Alejandra Paredes Sugastti
  'Araceli Alejandra Paredes Sugastti': {
    name: 'Araceli Alejandra Paredes Sugastti',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: 'Cátedra de Comercio Internacional & Negociación Diplomática',
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-014',
    specialization: 'Corredores Bioceánicos & Logística del Comercio Exterior',
    email: 'a.paredes.sugastti@investigacion.edu.py',
    bio: 'Enfocada en transporte multimodal, integración vial del Chaco Central y eficiencia aduanera cuatrilateral hacia el Asia-Pacífico.'
  },
  'Araceli Paredes Sugastti': {
    name: 'Araceli Alejandra Paredes Sugastti',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: 'Cátedra de Comercio Internacional & Negociación Diplomática',
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-014',
    specialization: 'Corredores Bioceánicos & Logística del Comercio Exterior',
    email: 'a.paredes.sugastti@investigacion.edu.py',
    bio: 'Enfocada en transporte multimodal, integración vial del Chaco Central y eficiencia aduanera cuatrilateral hacia el Asia-Pacífico.'
  },

  // Nelson Raúl Coronel Segovia
  'Nelson Raúl Coronel Segovia': {
    name: 'Nelson Raúl Coronel Segovia',
    role: 'Estudiante Investigador',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: 'Cátedra de Geopolítica de los Recursos Naturales',
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-009',
    specialization: 'Gobernanza Energética & Derecho Internacional Público',
    email: 'n.coronel.segovia@investigacion.edu.py',
    bio: 'Análisis de tratados binacionales hidroeléctricos, Anexo C de Itaipú y soberanía de despacho electroenergético en el Cono Sur.'
  },
  'Nelson Coronel': {
    name: 'Nelson Raúl Coronel Segovia',
    role: 'Estudiante Investigador',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: 'Cátedra de Geopolítica de los Recursos Naturales',
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-009',
    specialization: 'Gobernanza Energética & Derecho Internacional Público',
    email: 'n.coronel.segovia@investigacion.edu.py',
    bio: 'Análisis de tratados binacionales hidroeléctricos, Anexo C de Itaipú y soberanía de despacho electroenergético en el Cono Sur.'
  },

  // Andrea Belén Peña Bloy
  'Andrea Belén Peña Bloy': {
    name: 'Andrea Belén Peña Bloy',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-003',
    specialization: 'Comercio Agrícola, Balanza de Pagos & Mercosur',
    email: 'a.pena.bloy@investigacion.edu.py',
    bio: 'Especialista en flujos de commodities agroindustriales y política comercial exterior.'
  },

  // Aracely Villalba Russi
  'Aracely Villalba Russi': {
    name: 'Aracely Villalba Russi',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-005',
    specialization: 'Geopolítica de la Cuenca del Plata & Negociaciones Regionales',
    email: 'a.villalba.russi@investigacion.edu.py',
    bio: 'Investigación en relaciones transfronterizas, diplomacia subregional e instituciones del Mercosur.'
  },

  // Avis Jhovanca Benitez
  'Avis Jhovanca Benitez': {
    name: 'Avis Jhovanca Benitez',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-007',
    specialization: 'Inversión Extranjera Directa & Régimen de Maquila',
    email: 'a.benitez.jhovanca@investigacion.edu.py',
    bio: 'Análisis de cadenas de valor de manufactura liviana y radicación de capitales productivos.'
  },

  // Aylén Janeth Benítez Closs
  'Aylén Janeth Benítez Closs': {
    name: 'Aylén Janeth Benítez Closs',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-011',
    specialization: 'Sistemas Financieros, Liquidez & Regulación Cambiaria',
    email: 'a.benitez.closs@investigacion.edu.py',
    bio: 'Evaluación del riesgo crediticio, política monetaria del BCP e inflación importada.'
  },

  // Dahiana Paiva
  'Dahiana Paiva': {
    name: 'Dahiana Paiva',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-015',
    specialization: 'Diplomacia Económica & Cooperación Sur-Sur',
    email: 'd.paiva@investigacion.edu.py',
    bio: 'Estudio de alianzas para el desarrollo sostenible y diversificación de exportaciones paraguayas.'
  },

  // Francisco Irala
  'Francisco Irala': {
    name: 'Francisco Irala',
    role: 'Estudiante Investigador',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-021',
    specialization: 'Infraestructura Regional & Hidrovía Paraguay-Paraná',
    email: 'f.irala@investigacion.edu.py',
    bio: 'Análisis de calado, dragado y gobernanza del transporte fluvial en la Cuenca del Plata.'
  },

  // Héctor Ramirez
  'Héctor Ramirez': {
    name: 'Héctor Ramirez',
    role: 'Estudiante Investigador',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-024',
    specialization: 'Integración Productiva, Aranceles & Política Industrial',
    email: 'h.ramirez@investigacion.edu.py',
    bio: 'Monitoreo de aranceles externos comunes del Mercosur y tarifas de energía plurianuales.'
  },

  // Liz Rocio Peña Bloy
  'Liz Rocio Peña Bloy': {
    name: 'Liz Rocio Peña Bloy',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-027',
    specialization: 'Cadenas Agroindustriales & Tratados Multilaterales',
    email: 'l.pena.bloy@investigacion.edu.py',
    bio: 'Estudio de competitividad en los mercados globales de oleaginosas y carnes.'
  },

  // Mayara Saribel Garay Acosta
  'Mayara Saribel Garay Acosta': {
    name: 'Mayara Saribel Garay Acosta',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-030',
    specialization: 'Presupuesto Público & Política Fiscal Internacional',
    email: 'm.garay.acosta@investigacion.edu.py',
    bio: 'Análisis de presión tributaria, presupuesto general de la nación (PGN) y finanzas públicas comparadas.'
  },
  'Mayara Garay': {
    name: 'Mayara Saribel Garay Acosta',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-030',
    specialization: 'Presupuesto Público & Política Fiscal Internacional',
    email: 'm.garay.acosta@investigacion.edu.py',
    bio: 'Análisis de presión tributaria, presupuesto general de la nación (PGN) y finanzas públicas comparadas.'
  },

  // Micaela Ayelén Quiñonez Ramirez
  'Micaela Ayelén Quiñonez Ramirez': {
    name: 'Micaela Ayelén Quiñonez Ramirez',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-033',
    specialization: 'Mercados Bursátiles & Deuda Soberana en Mercosur',
    email: 'm.quinonez.ramirez@investigacion.edu.py',
    bio: 'Monitoreo de emisión de bonos soberanos, riesgo país y sostenibilidad de la deuda pública.'
  },

  // Sofía Moscarda
  'Sofía Moscarda': {
    name: 'Sofía Moscarda',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-038',
    specialization: 'Transición Energética & Hidroeléctricas Binacionales',
    email: 's.moscarda@investigacion.edu.py',
    bio: 'Investigación en desarrollo sustentable, Yacyretá y mercado libre de energía en el Mercosur.'
  },

  // Tamara Fiorella Benítez Maciel
  'Tamara Fiorella Benítez Maciel': {
    name: 'Tamara Fiorella Benítez Maciel',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-041',
    specialization: 'Estabilidad Macroeconómica & Proyecciones Cambiarias',
    email: 't.benitez.maciel@investigacion.edu.py',
    bio: 'Análisis de encuestas de expectativas de variables económicas (EVE), tipo de cambio y metas de inflación.'
  },
  'Tamara Benítez': {
    name: 'Tamara Fiorella Benítez Maciel',
    role: 'Estudiante Investigadora',
    image: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=1200&q=85',
    institution: DEFAULT_INSTITUTION,
    faculty: DEFAULT_FACULTY,
    school: DEFAULT_SCHOOL,
    department: DEFAULT_DEPT,
    location: DEFAULT_LOCATION,
    reviewers: DEFAULT_REVIEWERS,
    fairEdition: DEFAULT_FAIR,
    academicId: 'Mat. R.R.I.I. 2023-041',
    specialization: 'Estabilidad Macroeconómica & Proyecciones Cambiarias',
    email: 't.benitez.maciel@investigacion.edu.py',
    bio: 'Análisis de encuestas de expectativas de variables económicas (EVE), tipo de cambio y metas de inflación.'
  }
};

const AUTHOR_OVERRIDES_KEY = 'observatorio_author_photo_overrides_v1';

export interface AuthorPhotoOverride {
  image?: string;
  crop?: PhotoCrop;
}

export function getAuthorPhotoOverrides(): Record<string, AuthorPhotoOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AUTHOR_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setAuthorPhotoOverride(authorName: string, image?: string, crop?: PhotoCrop): void {
  if (typeof window === 'undefined' || !authorName) return;
  try {
    const overrides = getAuthorPhotoOverrides();
    const key = normalizeName(authorName);
    overrides[key] = {
      image: image ?? overrides[key]?.image,
      crop: crop ?? overrides[key]?.crop,
    };
    localStorage.setItem(AUTHOR_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.error('Error saving author photo override:', err);
  }
}

export function getAuthorPhotoCrop(authorName: string): PhotoCrop {
  const norm = normalizeName(authorName);
  const overrides = getAuthorPhotoOverrides();
  if (overrides[norm]?.crop) {
    return overrides[norm].crop!;
  }
  const profile = getAuthorProfile(authorName);
  if (profile?.photoCrop) {
    return profile.photoCrop;
  }
  return { zoom: 1, panX: 0, panY: 0 };
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const getAuthorProfile = (authorName: string): AuthorProfile | undefined => {
  if (!authorName) return undefined;
  
  let baseProfile: AuthorProfile | undefined;
  if (AUTHOR_PROFILES[authorName]) {
    baseProfile = AUTHOR_PROFILES[authorName];
  } else {
    const normalized = normalizeName(authorName);
    for (const [key, profile] of Object.entries(AUTHOR_PROFILES)) {
      if (normalizeName(key) === normalized) {
        baseProfile = profile;
        break;
      }
    }
    if (!baseProfile) {
      for (const [key, profile] of Object.entries(AUTHOR_PROFILES)) {
        const normKey = normalizeName(key);
        if (normKey.includes(normalized) || normalized.includes(normKey)) {
          baseProfile = profile;
          break;
        }
      }
    }
  }

  if (!baseProfile) return undefined;

  const overrides = getAuthorPhotoOverrides();
  const override = overrides[normalizeName(authorName)];
  if (override) {
    return {
      ...baseProfile,
      image: override.image || baseProfile.image,
      photoCrop: override.crop || baseProfile.photoCrop,
    };
  }

  return baseProfile;
};

export const getAuthorImage = (authorName: string): string => {
  if (!authorName) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85';
  
  const overrides = getAuthorPhotoOverrides();
  const override = overrides[normalizeName(authorName)];
  if (override?.image) {
    return override.image;
  }

  const profile = getAuthorProfile(authorName);
  if (profile?.image) {
    return profile.image;
  }
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85';
};
