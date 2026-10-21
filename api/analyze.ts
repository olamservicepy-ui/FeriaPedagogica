import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { title, rawText, source, currentGlossary } = req.body || {};

  try {
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `Actúa como editor académico del observatorio de Relaciones Internacionales. 
Analiza la noticia y responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "suggestedCategory": "Categoría (ej: Política Monetaria, Empleo & Producción, Comercio Exterior)",
  "tags": ["tag1", "tag2"],
  "readingTimeMinutes": 3,
  "executiveSummary": ["Punto clave 1", "Punto clave 2"],
  "glossarySuggestions": [{"term": "Término", "definition": "Definición sencilla"}],
  "irPerspectiveFeedback": "Consejo para reforzar el enfoque diplomático o de comercio exterior."
}`
        },
        {
          role: "user",
          content: `Título: ${title || ""}\nFuente: ${source || ""}\nTexto: ${rawText || ""}\nGlosario cargado: ${JSON.stringify(currentGlossary || [])}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Error en /api/analyze:", error);
    return res.status(500).json({ 
      error: "Error al analizar la noticia con Groq.",
      details: error?.message || String(error)
    });
  }
}
