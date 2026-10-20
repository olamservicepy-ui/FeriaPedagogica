import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    let updatedNewsList = req.body;
    if (typeof updatedNewsList === 'string') {
      try {
        updatedNewsList = JSON.parse(updatedNewsList);
      } catch {
        // Fallback
      }
    }

    if (!Array.isArray(updatedNewsList)) {
      return res.status(400).json({ error: 'El contenido debe ser un arreglo de noticias.' });
    }

    const filePath = path.join(process.cwd(), 'src/data/news.json');
    fs.writeFileSync(filePath, JSON.stringify(updatedNewsList, null, 2), 'utf-8');
    return res.status(200).json({ success: true, count: updatedNewsList.length });
  } catch (error: any) {
    console.error('Error al escribir news.json:', error);
    return res.status(500).json({ error: 'Error al escribir el archivo', details: error?.message || String(error) });
  }
}
