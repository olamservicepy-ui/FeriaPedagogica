#!/usr/bin/env python3
"""
Script de ingesta automatizada para el Observatorio de Economía Internacional & Relaciones Internacionales.
Lee documentos Markdown/Texto plano en `raw_inputs/`, valida su estructura y los incorpora a `src/data/news.json`.
"""

import os
import re
import json
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_INPUTS_DIR = BASE_DIR / "raw_inputs"
NEWS_JSON_PATH = BASE_DIR / "src" / "data" / "news.json"

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)

def parse_markdown_file(file_path: Path):
    content = file_path.read_text(encoding="utf-8").strip()
    lines = content.splitlines()

    title = ""
    article_id = ""
    region = "Global"
    topic = "Comercio"
    date = "2026-09-16"
    authors = []
    
    # Extract H1 title
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            break
            
    if not title:
        raise ValueError(f"El archivo {file_path.name} no contiene un título principal (# Título).")

    # Extract metadata attributes
    for line in lines:
        match_id = re.match(r"^\*{0,2}ID:\*{0,2}\s*(.+)$", line, re.I)
        if match_id:
            article_id = match_id.group(1).strip()
            
        match_region = re.match(r"^\*{0,2}Regi[oó]n:\*{0,2}\s*(.+)$", line, re.I)
        if match_region:
            region = match_region.group(1).strip()
            
        match_topic = re.match(r"^\*{0,2}Tema:\*{0,2}\s*(.+)$", line, re.I)
        if match_topic:
            topic = match_topic.group(1).strip()
            
        match_date = re.match(r"^\*{0,2}Fecha:\*{0,2}\s*(.+)$", line, re.I)
        if match_date:
            date = match_date.group(1).strip()
            
        match_authors = re.match(r"^\*{0,2}Autores?:\*{0,2}\s*(.+)$", line, re.I)
        if match_authors:
            raw_authors = match_authors.group(1).strip()
            authors = [a.strip() for a in re.split(r"[,;]|\by\b", raw_authors) if a.strip()]

    if not article_id:
        article_id = slugify(title)

    if not authors:
        authors = ["Estudiantes del Observatorio"]

    # Split into H2 sections
    sections = re.split(r"\n(?=##\s+)", content)
    
    summary_bullets = []
    full_text = []
    glossary = []
    geopolitical_context = ""
    strategic_recommendations = []
    sources = []

    for sec in sections:
        sec = sec.strip()
        if not sec.startswith("##"):
            continue

        header_line, *rest = sec.splitlines()
        header_name = header_line.replace("##", "").strip().lower()
        body = "\n".join(rest).strip()

        if "resumen" in header_name:
            for b_line in rest:
                b_line = b_line.strip()
                if b_line.startswith(("-", "*", "•")):
                    clean_b = re.sub(r"^[-*•]\s*", "", b_line).strip()
                    if clean_b:
                        summary_bullets.append(clean_b)

        elif "cuerpo" in header_name or "análisis" in header_name or "analisis" in header_name:
            # Paragraphs separated by blank lines
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
            for p in paragraphs:
                if not p.startswith("#") and not p.startswith("-"):
                    full_text.append(p)

        elif "perspectiva" in header_name or "relaciones internacionales" in header_name:
            # Look for sub-headers ### Contexto and ### Recomendaciones
            subsections = re.split(r"\n(?=###\s+)", body)
            for sub in subsections:
                sub = sub.strip()
                sub_lines = sub.splitlines()
                sub_title = sub_lines[0].replace("###", "").strip().lower() if sub_lines else ""
                sub_body = "\n".join(sub_lines[1:]).strip() if len(sub_lines) > 1 else ""

                if "contexto" in sub_title:
                    geopolitical_context = sub_body
                elif "recomendaci" in sub_title:
                    for r_line in sub_lines[1:]:
                        r_line = r_line.strip()
                        if r_line.startswith(("-", "*", "•")):
                            rec = re.sub(r"^[-*•]\s*", "", r_line).strip()
                            if rec:
                                strategic_recommendations.append(rec)
            # If no subsections found, take full body as context
            if not geopolitical_context and not strategic_recommendations:
                geopolitical_context = body

        elif "glosario" in header_name:
            for g_line in rest:
                g_line = g_line.strip()
                if not g_line.startswith(("-", "*", "•")):
                    continue
                clean_item = re.sub(r"^[-*•]\s*", "", g_line).strip()
                # Pattern: **Term**: Definition or Term: Definition
                term_match = re.match(r"^\*{0,2}(.+?)\*{0,2}\s*:\s*(.+)$", clean_item)
                if term_match:
                    glossary.append({
                        "term": term_match.group(1).strip(),
                        "definition": term_match.group(2).strip()
                    })

        elif "fuente" in header_name:
            for s_line in rest:
                s_line = s_line.strip()
                if s_line.startswith(("-", "*", "•")):
                    s_clean = re.sub(r"^[-*•]\s*", "", s_line).strip()
                    if s_clean:
                        sources.append(s_clean)

    # Defaults if missing
    if not summary_bullets:
        summary_bullets = [p[:160] + "..." for p in full_text[:2]]

    if not geopolitical_context:
        geopolitical_context = "Análisis del equilibrio de poder y dinámicas de interdependencia económica internacional."

    return {
        "id": article_id,
        "title": title,
        "region": region,
        "topic": topic,
        "date": date,
        "authors": authors,
        "summary_bullets": summary_bullets,
        "full_text": full_text,
        "glossary": glossary,
        "ir_perspective": {
            "geopolitical_context": geopolitical_context,
            "strategic_recommendations": strategic_recommendations
        },
        "sources": sources
    }

def main():
    print("=================================================================")
    print("  Observatorio de Economía Internacional & RRII - Ingesta Raw   ")
    print("=================================================================")
    
    if not RAW_INPUTS_DIR.exists():
        RAW_INPUTS_DIR.mkdir(parents=True, exist_ok=True)
        print(f"Directorio creado: {RAW_INPUTS_DIR}")

    raw_files = list(RAW_INPUTS_DIR.glob("*.md")) + list(RAW_INPUTS_DIR.glob("*.txt"))
    if not raw_files:
        print("No se encontraron documentos .md o .txt en /raw_inputs/.")
        return

    # Load existing news.json
    existing_articles = []
    if NEWS_JSON_PATH.exists():
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                existing_articles = json.load(f)
        except Exception as e:
            print(f"Aviso: No se pudo leer {NEWS_JSON_PATH} ({e}). Se creará una nueva lista.")

    articles_dict = {a["id"]: a for a in existing_articles}
    nuevos_count = 0
    actualizados_count = 0

    for file_path in raw_files:
        try:
            print(f"-> Procesando: {file_path.name}...")
            article = parse_markdown_file(file_path)
            aid = article["id"]
            if aid in articles_dict:
                actualizados_count += 1
                print(f"   [Actualizado] ID: {aid}")
            else:
                nuevos_count += 1
                print(f"   [Nuevo] ID: {aid}")
            articles_dict[aid] = article
        except Exception as e:
            print(f"   [Error en {file_path.name}]: {e}")

    # Sort descending by date
    final_list = list(articles_dict.values())
    final_list.sort(key=lambda x: x.get("date", ""), reverse=True)

    NEWS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(NEWS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)

    print("\n=================================================================")
    print(f"Ingesta completada con éxito.")
    print(f"Total artículos en sistema: {len(final_list)}")
    print(f"Nuevos añadidos: {nuevos_count} | Actualizados: {actualizados_count}")
    print(f"Archivo actualizado: {NEWS_JSON_PATH}")
    print("=================================================================\n")

if __name__ == "__main__":
    main()
