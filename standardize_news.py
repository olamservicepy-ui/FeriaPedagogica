import os
import re
import json
import glob
from groq import Groq
from pypdf import PdfReader
from docx import Document

# 1. Configuración de Groq API
# Toma la clave del entorno o .env
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

RAW_FOLDER = "entradas_crudos"
OUTPUT_FILE = os.path.join("src", "data", "news.json")

def parse_filename_metadata(filename: str):
    """
    Extrae autor y fecha desde el nombre de archivo con formato:
    'Nombre del autor DD-MM-AAAA.extension' o 'Nombre_del_autor DD-MM-AAAA.extension'
    Retorna (autor_sugerido, fecha_iso_aaaa_mm_dd)
    """
    name_without_ext = os.path.splitext(filename)[0].strip()
    
    # Busca el patrón DD-MM-AAAA al final del nombre
    date_match = re.search(r"(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$", name_without_ext)
    
    suggested_author = None
    suggested_date_iso = None
    
    if date_match:
        day, month, year = date_match.groups()
        suggested_date_iso = f"{year}-{int(month):02d}-{int(day):02d}"
        
        # El resto del nombre previo a la fecha es el autor
        author_part = name_without_ext[:date_match.start()].strip(" _-")
        if author_part:
            # Reemplaza guiones bajos por espacios y normaliza mayúsculas
            suggested_author = author_part.replace("_", " ").strip()
    else:
        # Fallback por si algún archivo no tiene fecha explícita
        suggested_author = name_without_ext.replace("_", " ").strip()
        
    return suggested_author, suggested_date_iso

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extrae texto completo de un archivo PDF."""
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
    except Exception as e:
        print(f"[-] Error al leer PDF {pdf_path}: {e}")
    return text

def extract_text_from_docx(docx_path: str) -> str:
    """Extrae texto completo de un archivo Word (.docx)."""
    text = ""
    try:
        doc = Document(docx_path)
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text += paragraph.text + "\n"
    except Exception as e:
        print(f"[-] Error al leer DOCX {docx_path}: {e}")
    return text

def standardize_with_groq(raw_text: str, filename: str, fallback_author: str, fallback_date: str) -> dict:
    """Envía el texto a Groq indicándole los metadatos de respaldo del archivo."""
    system_prompt = f"""
    Eres un asistente editorial universitario de Relaciones Internacionales y Economía.
    Tu tarea es procesar el texto crudo de un análisis de noticia económica y devolver un objeto JSON estandarizado.

    METADATOS DE RESPALDO OBTENIDOS DEL NOMBRE DE ARCHIVO:
    - Autor por defecto: "{fallback_author or 'No especificado'}"
    - Fecha por defecto (ISO YYYY-MM-DD): "{fallback_date or 'No especificada'}"

    REGLAS IMPORTANTES:
    1. Si el autor NO está explícito en el cuerpo del texto, UTILIZA OBLIGATORIAMENTE el "Autor por defecto".
    2. Si la fecha del análisis o de la noticia NO se indica claramente en el texto, UTILIZA OBLIGATORIAMENTE la "Fecha por defecto".
    3. Siempre entrega la fecha en formato ISO 'YYYY-MM-DD'.
    4. Responde EXCLUSIVAMENTE con un JSON válido con la siguiente estructura, sin texto explicativo adicional:

    {{
      "id": "slug-identificador-unico-kebab-case",
      "title": "Título analítico de la noticia",
      "category": "Categoría (ej: Política Monetaria & Divisas, Comercio Exterior, Integración Regional, Empleo & Producción)",
      "region": "Región (ej: Nacional / Paraguay, Mercosur, Global)",
      "date": "YYYY-MM-DD",
      "originalSource": "Medio original citado (ej: ABC Color, Última Hora, BCP, etc.)",
      "authors": [
        {{
          "name": "Nombre completo del alumno",
          "avatar": "/authors/default.jpg",
          "role": "Estudiante de Relaciones Internacionales"
        }}
      ],
      "course": "Economía IV - Licenciatura en Relaciones Internacionales",
      "summary": "Resumen ejecutivo claro de 1 o 2 párrafos.",
      "glossary": [
        {{
          "term": "Concepto económico",
          "definition": "Definición clara y pedagógica"
        }}
      ],
      "ir_perspective": {{
        "analysis": "Análisis geopolítico y de impacto exterior.",
        "recommendations": [
          "Recomendación estratégica 1",
          "Recomendación estratégica 2"
        ]
      }}
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Archivo: {filename}\n\nContenido del trabajo:\n{raw_text[:6000]}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        print(f"[-] Error en Groq al procesar '{filename}': {e}")
        return None

def main():
    if not os.path.exists(RAW_FOLDER):
        os.makedirs(RAW_FOLDER)
        print(f"[!] Carpeta '{RAW_FOLDER}' creada. Coloca allí los archivos.")
        return

    files = glob.glob(os.path.join(RAW_FOLDER, "*.pdf")) + glob.glob(os.path.join(RAW_FOLDER, "*.docx"))
    if not files:
        print(f"[!] No se encontraron archivos .pdf ni .docx en '{RAW_FOLDER}'.")
        return

    # Cargar base de datos existente de noticias
    existing_news = []
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing_news = json.load(f)
        except Exception:
            existing_news = []

    existing_ids = {item.get("id") for item in existing_news if isinstance(item, dict)}
    processed_count = 0

    print(f"[*] Iniciando procesamiento de {len(files)} archivos...")

    for file_path in files:
        filename = os.path.basename(file_path)
        fallback_author, fallback_date = parse_filename_metadata(filename)
        
        print(f"\n[+] Procesando: {filename}")
        print(f"    ↳ Metadatos detectados en nombre -> Autor: '{fallback_author}' | Fecha: '{fallback_date}'")

        if file_path.lower().endswith(".pdf"):
            raw_text = extract_text_from_pdf(file_path)
        elif file_path.lower().endswith(".docx"):
            raw_text = extract_text_from_docx(file_path)
        else:
            continue

        if not raw_text.strip():
            print(f"[-] Archivo vacío o ilegible: {filename}")
            continue

        item_data = standardize_with_groq(raw_text, filename, fallback_author, fallback_date)

        if item_data and "title" in item_data:
            # Salvaguarda final: si la IA dejó fecha o autor vacío, aplicamos el fallback
            if not item_data.get("date") or item_data.get("date") in ["YYYY-MM-DD", ""]:
                if fallback_date:
                    item_data["date"] = fallback_date

            if not item_data.get("authors") or len(item_data["authors"]) == 0:
                item_data["authors"] = [{
                    "name": fallback_author or "Estudiante",
                    "avatar": "/authors/default.jpg",
                    "role": "Estudiante de Relaciones Internacionales"
                }]
            elif fallback_author and item_data["authors"][0].get("name") in ["Nombre completo del alumno", "No especificado", ""]:
                item_data["authors"][0]["name"] = fallback_author

            # Generación de ID único combinando autor, fecha y título para evitar cualquier colisión
            base_slug = item_data.get("id") or "noticia"
            date_clean = (item_data.get("date") or "fecha").replace("-", "")
            unique_id = f"{base_slug}-{date_clean}"
            
            counter = 1
            temp_id = unique_id
            while temp_id in existing_ids:
                temp_id = f"{unique_id}-{counter}"
                counter += 1

            item_data["id"] = temp_id
            existing_ids.add(temp_id)

            existing_news.append(item_data)
            processed_count += 1
            print(f"[✓] Guardado: '{item_data.get('title')}' - {item_data.get('date')} por {item_data['authors'][0]['name']}")

    # Guardar en news.json
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(existing_news, f, ensure_ascii=False, indent=2)

    print(f"\n[🚀] Listo. Se incorporaron {processed_count} noticias. Total acumulado en catálogo: {len(existing_news)}.")

if __name__ == "__main__":
    main()