import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      watch: {
        ignored: ['**/entradas_crudos/**', '**/*.pdf', '**/*.docx'],
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api-handler',
        configureServer(server) {
          // Endpoint para guardar news.json directamente en el disco
          server.middlewares.use('/api/save-news', (req, res) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              req.on('end', () => {
                try {
                  const filePath = path.resolve(__dirname, 'src/data/news.json')
                  let formatted = body
                  try {
                    const parsed = JSON.parse(body)
                    formatted = JSON.stringify(parsed, null, 2)
                  } catch {
                    // keep raw body if not valid JSON string
                  }
                  fs.writeFileSync(filePath, formatted, 'utf-8')
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'ok', message: 'Noticias guardadas en disco' }))
                } catch (err: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err?.message || String(err) }))
                }
              })
            } else {
              res.statusCode = 405
              res.end()
            }
          })

          // Endpoint para guardar avatares en public/authors/
          server.middlewares.use('/api/save-avatar', (req, res) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              req.on('end', () => {
                try {
                  const { filename, base64Data } = JSON.parse(body)
                  const dirPath = path.resolve(__dirname, 'public/authors')
                  if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true })
                  }
                  const safeFilename = (filename || `avatar_${Date.now()}.png`).replace(/[^a-zA-Z0-9_.-]/g, '_')
                  const filePath = path.join(dirPath, safeFilename)
                  const data = (base64Data || '').replace(/^data:image\/\w+;base64,/, '')
                  fs.writeFileSync(filePath, Buffer.from(data, 'base64'))

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'ok', url: `/authors/${safeFilename}` }))
                } catch (err: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err?.message || String(err) }))
                }
              })
            } else {
              res.statusCode = 405
              res.end()
            }
          })

          // Endpoint compatible con /api/update-news
          server.middlewares.use('/api/update-news', (req, res) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              req.on('end', () => {
                try {
                  const filePath = path.resolve(__dirname, 'src/data/news.json')
                  const parsed = body ? JSON.parse(body) : []
                  if (!Array.isArray(parsed)) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'El contenido debe ser un arreglo de noticias.' }))
                    return
                  }
                  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8')
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true, count: parsed.length }))
                } catch (error: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({
                    error: 'Error al escribir el archivo',
                    details: error?.message || String(error)
                  }))
                }
              })
            } else {
              res.statusCode = 405
              res.end()
            }
          })

          // Endpoint para consultas con IA Groq
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Método no permitido' }))
              return
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : {}
                const { question, articles } = parsed

                if (!question) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'La pregunta es obligatoria.' }))
                  return
                }

                const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''
                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({
                    error: 'Clave GROQ_API_KEY no detectada. Configura GROQ_API_KEY en tu archivo .env o en el panel de IA.'
                  }))
                  return
                }

                const { default: Groq } = await import('groq-sdk')
                const filePath = path.resolve(__dirname, 'src/data/news.json')
                const newsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

                const groq = new Groq({ apiKey })
                const activeDataset = (Array.isArray(articles) && articles.length > 0) ? articles : newsData

                const completion = await groq.chat.completions.create({
                  model: 'openai/gpt-oss-120b',
                  messages: [
                    {
                      role: 'system',
                      content: `Eres el Asistente Académico del Observatorio Económico de Relaciones Internacionales.
Tu única fuente de información son las investigaciones y noticias redactadas por los estudiantes del curso:
${JSON.stringify(activeDataset)}

Instrucciones:
1. Responde de forma clara, pedagógica y ejecutiva en español.
2. Cita siempre el nombre del alumno/a autor/a y el medio o título del artículo correspondiente.
3. Si consultan por un término económico, recurre a las definiciones del glosario de los artículos.
4. Si la consulta está fuera del alcance de estos artículos, explica con cortesía que solo dispones de los análisis del observatorio.`
                    },
                    {
                      role: 'user',
                      content: question
                    }
                  ],
                  temperature: 0.3,
                  max_tokens: 600,
                })

                const answer = completion.choices[0]?.message?.content || 'No se pudo generar una respuesta.'
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ answer }))
              } catch (error: any) {
                console.error('Error en Groq API dev server:', error)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  error: 'Error al procesar la consulta con IA.',
                  details: error?.message || String(error)
                }))
              }
            })
          })

          // Endpoint para análisis editorial con Groq
          server.middlewares.use('/api/analyze', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Método no permitido' }))
              return
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : {}
                const { title, rawText, source, currentGlossary } = parsed

                const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''
                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({
                    error: 'Clave GROQ_API_KEY no detectada. Configúrala en tu archivo .env o en el panel de IA.'
                  }))
                  return
                }

                const { default: Groq } = await import('groq-sdk')
                const groq = new Groq({ apiKey })

                const completion = await groq.chat.completions.create({
                  model: 'openai/gpt-oss-120b',
                  messages: [
                    {
                      role: 'system',
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
                      role: 'user',
                      content: `Título: ${title || ''}\nFuente: ${source || ''}\nTexto: ${rawText || ''}\nGlosario cargado: ${JSON.stringify(currentGlossary || [])}`
                    }
                  ],
                  response_format: { type: 'json_object' },
                  temperature: 0.2,
                })

                const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(result))
              } catch (error: any) {
                console.error('Error en /api/analyze dev server:', error)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  error: 'Error al analizar la noticia con Groq.',
                  details: error?.message || String(error)
                }))
              }
            })
          })
        }
      }
    ],
  }
})
