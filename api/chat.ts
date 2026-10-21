import Groq from "groq-sdk";
import newsData from "../src/data/news.json";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { question, articles } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: "La pregunta es obligatoria." });
  }

  const activeDataset = (Array.isArray(articles) && articles.length > 0) ? articles : newsData;

  const context = (activeDataset || []).slice(0, 25).map((a: any, i: number) => (
    `[${i + 1}] Título: ${a.title}
   Autor: ${Array.isArray(a.authors) ? a.authors.join(', ') : (a.authors || '')}
   Tema: ${a.topic || a.category || ''}
   Resumen: ${a.summary_bullets?.[0] || a.summary || ''}`
  )).join('\n\n');

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Eres el Asistente Académico del Observatorio Económico de Relaciones Internacionales.
Tu única fuente de información son las investigaciones y noticias redactadas por los estudiantes del curso:

${context}

Instrucciones:
1. Responde de forma clara, pedagógica y ejecutiva en español.
2. Cita siempre el nombre del alumno/a autor/a y el medio o título del artículo correspondiente.
3. Si consultan por un término económico, recurre a las definiciones del glosario de los artículos.
4. Si la consulta está fuera del alcance de estos artículos, explica con cortesía que solo dispones de los análisis del observatorio.`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3, // Temperatura baja para evitar alucinaciones y ser fiel a los textos
      max_tokens: 600,
    });

    const answer = completion.choices[0]?.message?.content || "No se pudo generar una respuesta.";
    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Error en Groq API:", error);
    return res.status(500).json({ 
      error: "Error al procesar la consulta con IA.",
      details: error?.message || String(error)
    });
  }
}
