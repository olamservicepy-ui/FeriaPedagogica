export interface AuthorProfile {
  name: string;
  role: string;
  image: string;
  institution: string;
  bio?: string;
}

export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  'Sofía M. Valenzuela': {
    name: 'Sofía M. Valenzuela',
    role: 'Estudiante Investigadora • Geoeconomía Minera',
    image: '/authors/sofia-valenzuela.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Especializada en gobernanza de recursos críticos, transición energética y cadenas de valor de litio en Sudamérica.',
  },
  'Lucas D. Arismendi': {
    name: 'Lucas D. Arismendi',
    role: 'Estudiante Investigador • Políticas Públicas',
    image: '/authors/sofia-valenzuela.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Análisis de marcos regulatorios mineros y cooperación subregional en el Cono Sur.',
  },
  'Camila V. Morales': {
    name: 'Camila V. Morales',
    role: 'Estudiante Investigadora • Finanzas Internacionales',
    image: '/authors/camila-morales.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Enfoque en arquitectura monetaria multipolar, sistemas transfronterizos mBridge y expansión de BRICS+.',
  },
  'Mateo E. Benítez': {
    name: 'Mateo E. Benítez',
    role: 'Estudiante Investigador • Economía Política Global',
    image: '/authors/camila-morales.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Investigación en regímenes cambiarios y sanciones económicas unilaterales.',
  },
  'Lucía S. Albarracín': {
    name: 'Lucía S. Albarracín',
    role: 'Estudiante Investigadora • Diplomacia Comercial & Ambiental',
    image: '/authors/lucia-albarracin.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Especialista en estándares fitosanitarios, reglamento EUDR europeo y negociaciones UE-Mercosur.',
  },
  'Joaquín R. Peralta': {
    name: 'Joaquín R. Peralta',
    role: 'Estudiante Investigador • Derecho de la OMC',
    image: '/authors/lucia-albarracin.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Estudio de barreras paraarancelarias y principio de trato especial y diferenciado.',
  },
  'Ignacio T. Chen': {
    name: 'Ignacio T. Chen',
    role: 'Estudiante Investigador • Geopolítica de la Tecnología',
    image: '/authors/ignacio-chen.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Análisis de cuellos de botella industriales, chokepoints en el Estrecho de Taiwán y CHIPS Act.',
  },
  'Valentina D. Rossi': {
    name: 'Valentina D. Rossi',
    role: 'Estudiante Investigadora • Seguridad Tecnológica',
    image: '/authors/ignacio-chen.jpg',
    institution: 'Feria Pedagógica de Relaciones Internacionales',
    bio: 'Investigación en estrategias de friendshoring y cadenas de valor de semiconductores de vanguardia.',
  },
};

export const getAuthorImage = (authorName: string): string => {
  if (AUTHOR_PROFILES[authorName]) {
    return AUTHOR_PROFILES[authorName].image;
  }
  return '/authors/sofia-valenzuela.jpg';
};

export const getAuthorProfile = (authorName: string): AuthorProfile | undefined => {
  return AUTHOR_PROFILES[authorName];
};
