import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '..');
const RAW_INPUTS_DIR = path.join(BASE_DIR, 'raw_inputs');
const NEWS_JSON_PATH = path.join(BASE_DIR, 'src', 'data', 'news.json');

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-');
}

function parseMarkdownFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = content.split(/\r?\n/);

  let title = '';
  let articleId = '';
  let region = 'Global';
  let topic = 'Comercio';
  let date = '2026-09-16';
  let authors = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      break;
    }
  }

  if (!title) {
    throw new Error(`El archivo ${fileName} no contiene un título principal (# Título).`);
  }

  for (const line of lines) {
    const idMatch = line.match(/^\*{0,2}ID:\*{0,2}\s*(.+)$/i);
    if (idMatch) articleId = idMatch[1].trim();

    const regionMatch = line.match(/^\*{0,2}Regi[oó]n:\*{0,2}\s*(.+)$/i);
    if (regionMatch) region = regionMatch[1].trim();

    const topicMatch = line.match(/^\*{0,2}Tema:\*{0,2}\s*(.+)$/i);
    if (topicMatch) topic = topicMatch[1].trim();

    const dateMatch = line.match(/^\*{0,2}Fecha:\*{0,2}\s*(.+)$/i);
    if (dateMatch) date = dateMatch[1].trim();

    const authorsMatch = line.match(/^\*{0,2}Autores?:\*{0,2}\s*(.+)$/i);
    if (authorsMatch) {
      authors = authorsMatch[1]
        .split(/[,;]|\by\b/i)
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }

  if (!articleId) articleId = slugify(title);
  if (authors.length === 0) authors = ['Estudiantes del Observatorio'];

  const sections = content.split(/\n(?=##\s+)/);
  const summary_bullets = [];
  const full_text = [];
  const glossary = [];
  let geopolitical_context = '';
  const strategic_recommendations = [];
  const sources = [];

  for (const sec of sections) {
    const cleanSec = sec.trim();
    if (!cleanSec.startsWith('##')) continue;

    const [headerLine, ...restLines] = cleanSec.split(/\r?\n/);
    const headerName = headerLine.replace(/^##\s*/, '').trim().toLowerCase();
    const body = restLines.join('\n').trim();

    if (headerName.includes('resumen')) {
      for (const line of restLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
          const cleanBullet = trimmed.replace(/^[-*•]\s*/, '').trim();
          if (cleanBullet) summary_bullets.push(cleanBullet);
        }
      }
    } else if (headerName.includes('cuerpo') || headerName.includes('análisis') || headerName.includes('analisis')) {
      const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        if (!p.startsWith('#') && !p.startsWith('-')) {
          full_text.push(p);
        }
      }
    } else if (headerName.includes('perspectiva') || headerName.includes('relaciones internacionales')) {
      const subSections = body.split(/\n(?=###\s+)/);
      for (const sub of subSections) {
        const subLines = sub.trim().split(/\r?\n/);
        const subHeader = (subLines[0] || '').replace(/^###\s*/, '').trim().toLowerCase();
        const subBody = subLines.slice(1).join('\n').trim();

        if (subHeader.includes('contexto')) {
          geopolitical_context = subBody;
        } else if (subHeader.includes('recomendaci')) {
          for (const rLine of subLines.slice(1)) {
            const trimmed = rLine.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
              const rec = trimmed.replace(/^[-*•]\s*/, '').trim();
              if (rec) strategic_recommendations.push(rec);
            }
          }
        }
      }
      if (!geopolitical_context && strategic_recommendations.length === 0) {
        geopolitical_context = body;
      }
    } else if (headerName.includes('glosario')) {
      for (const gLine of restLines) {
        const trimmed = gLine.trim();
        if (!trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.startsWith('•')) continue;
        const cleanItem = trimmed.replace(/^[-*•]\s*/, '').trim();
        const termMatch = cleanItem.match(/^\*{0,2}(.+?)\*{0,2}\s*:\s*(.+)$/);
        if (termMatch) {
          glossary.push({
            term: termMatch[1].trim(),
            definition: termMatch[2].trim(),
          });
        }
      }
    } else if (headerName.includes('fuente')) {
      for (const sLine of restLines) {
        const trimmed = sLine.trim();
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
          const sClean = trimmed.replace(/^[-*•]\s*/, '').trim();
          if (sClean) sources.push(sClean);
        }
      }
    }
  }

  return {
    id: articleId,
    title,
    region,
    topic,
    date,
    authors,
    summary_bullets: summary_bullets.length > 0 ? summary_bullets : [full_text[0]?.slice(0, 160) + '...'],
    full_text,
    glossary,
    ir_perspective: {
      geopolitical_context: geopolitical_context || 'Análisis geopolítico y estratégico de la coyuntura internacional.',
      strategic_recommendations,
    },
    sources,
  };
}

function runIngestion() {
  console.log('=================================================================');
  console.log('  Observatorio de Economía Internacional - Ingesta Node.js      ');
  console.log('=================================================================');

  if (!fs.existsSync(RAW_INPUTS_DIR)) {
    fs.mkdirSync(RAW_INPUTS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(RAW_INPUTS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
  if (files.length === 0) {
    console.log('No se encontraron documentos .md o .txt en /raw_inputs/.');
    return;
  }

  let existingArticles = [];
  if (fs.existsSync(NEWS_JSON_PATH)) {
    try {
      existingArticles = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf-8'));
    } catch (e) {
      console.warn(`No se pudo leer ${NEWS_JSON_PATH}: ${e.message}`);
    }
  }

  const articlesMap = new Map();
  for (const a of existingArticles) {
    articlesMap.set(a.id, a);
  }

  let added = 0;
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(RAW_INPUTS_DIR, file);
    try {
      console.log(`-> Procesando: ${file}...`);
      const article = parseMarkdownFile(filePath, file);
      if (articlesMap.has(article.id)) {
        updated++;
        console.log(`   [Actualizado] ID: ${article.id}`);
      } else {
        added++;
        console.log(`   [Nuevo] ID: ${article.id}`);
      }
      articlesMap.set(article.id, article);
    } catch (err) {
      console.error(`   [Error en ${file}]: ${err.message}`);
    }
  }

  const finalList = Array.from(articlesMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  fs.mkdirSync(path.dirname(NEWS_JSON_PATH), { recursive: true });
  fs.writeFileSync(NEWS_JSON_PATH, JSON.stringify(finalList, null, 2), 'utf-8');

  console.log('\n=================================================================');
  console.log(`Ingesta completada.`);
  console.log(`Total artículos: ${finalList.length} (Nuevos: ${added}, Actualizados: ${updated})`);
  console.log(`Guardado en: ${NEWS_JSON_PATH}`);
  console.log('=================================================================\n');
}

runIngestion();
