# FeriaPedagogica
# Observatorio de Economía Internacional & Relaciones Internacionales

Plataforma web editorial para la **Feria Pedagógica de la Licenciatura en Relaciones Internacionales**. El portal compila análisis de noticias de economía internacional elaborados por estudiantes con perspectiva geopolítica, glosario interactivo y recomendaciones estratégicas para tomadores de decisiones.

---

## 🚀 Características Principales
- **Estética Editorial & Think Tank:** Modo claro estricto con paleta sobria (`#F8F9FA`, blanco, azul pizarra y acentos esmeralda/ámbar).
- **Tipografía Institucional:** Basada en Google Sans / Product Sans y Plus Jakarta Sans para máxima legibilidad académica.
- **Perspectiva de Relaciones Internacionales:** Tarjeta destacada en cada artículo que analiza la dinámica de poder geopolítico y formula recomendaciones estratégicas.
- **Glosario Conceptual Interactivo:** Subrayado punteado con *popovers* flotantes en desktop y *Bottom Sheets* animados en dispositivos móviles.
- **Glosario Global A-Z:** Índice unificado y desduplicado con filtro alfabético y búsqueda reactiva en vivo.
- **Pipeline de Ingesta Automatizada (`/raw_inputs/`):** Scripts en Python y Node.js para que estudiantes o docentes incorporen nuevos análisis en Markdown sin tocar código.
- **100% Responsivo:** Optimizado para smartphones, tablets y pantallas de escritorio.

---

## 🛠️ Stack Tecnológico
- **Core:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS v4 (Light Mode)
- **Iconografía:** Lucide React
- **Datos:** JSON local estructurado en `src/data/news.json`
- **Ingesta:** Python 3 (`scripts/ingest_news.py`) y Node.js (`scripts/ingest_news.mjs`)

---

## 💻 Instalación y Uso Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Accede en tu navegador a: `http://localhost:5173/`

3. **Construir para producción:**
   ```bash
   npm run build
   ```

---

## 📥 Ingesta Automatizada de Documentos Crudos

Para publicar nuevos análisis elaborados por estudiantes:

1. Coloca los archivos `.md` o `.txt` estructurados en la carpeta `raw_inputs/`.
2. Ejecuta cualquiera de los dos comandos:
   ```bash
   npm run ingest
   ```
   o con Python:
   ```bash
   python scripts/ingest_news.py
   ```
3. El script valida la estructura, extrae los términos de glosario y actualiza automáticamente `src/data/news.json`.

---

## 🏛️ Créditos Institucionales
- **Proyecto:** Feria Pedagógica de Relaciones Internacionales
- **Cátedras:** Economía Política Internacional, Comercio Internacional, Integración Regional
- **Licenciatura en Relaciones Internacionales** • Edición 2026
