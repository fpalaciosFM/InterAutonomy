import json
import re
import requests
from bs4 import BeautifulSoup
import os

# --- CONFIGURACIÓN ---
ARCHIVO_CATALOGO = "Projects - Interautonomy.html"
SALIDA_JSON = "proyectos_detallados_3.json"
LIMIT_TEST = 3

# --- FUNCIONES DE APOYO (Tu lógica original adaptada) ---


def extract_strategy_slug(url):
    match = re.search(r"/strategy/([^/]+)/", url)
    return match.group(1) if match else None


def extract_project_slug(url):
    # Extrae el slug del proyecto de la URL: /project/nombre-proyecto/
    match = re.search(r"/project/([^/]+)/?", url)
    return match.group(1).rstrip("/") if match else "sin-slug"


def clean_html_professional(container):
    """Limpia el contenido interno preservando negritas y colores (Tu lógica)."""
    if not container:
        return ""
    for tag in container.find_all(True):
        if "class" in tag.attrs:
            tag.attrs["class"] = [c for c in tag.attrs["class"] if c.startswith("has-")]
            if not tag.attrs["class"]:
                del tag.attrs["class"]
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr not in ["src", "href", "alt", "class"]:
                del tag.attrs[attr]
    return container.decode_contents().strip()


# --- NÚCLEO DE EXTRACCIÓN ---


def fetch_project_details_from_url(url):
    """Obtiene y procesa el detalle de un proyecto desde su URL viva."""
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        project_slug = extract_project_slug(url)

        # 1. METADATOS
        title_tag = soup.select_one(".elementor-widget-jet-listing-dynamic-field h1")
        title = title_tag.get_text(strip=True) if title_tag else ""

        intro_tag = soup.select_one(
            ".elementor-element-5d39f2b .elementor-widget-container"
        )
        introduction = intro_tag.get_text(" ", strip=True) if intro_tag else ""
        introduction = re.sub(r"^info\s+\d{4}", "", introduction).strip()

        # Descripción corta (4to párrafo en h6)
        short_description = ""
        desc_container = soup.select_one("h6")
        if desc_container:
            paragraphs_in_h6 = desc_container.find_all("p")
            if len(paragraphs_in_h6) >= 4:
                short_description = paragraphs_in_h6[3].get_text(strip=True)

        # 2. ENLACES Y UBICACIÓN
        external_link = ""
        location_map = ""
        links = soup.select("h6 p a")
        for a in links:
            href = a["href"]
            if "maps.google" in href or "goo.gl/maps" in href:
                location_map = href
            elif "interautonomy.org" not in href:
                if not external_link:
                    external_link = href

        # 3. PÁRRAFOS Y ESTRATEGIAS
        paragraphs = []
        blocks = soup.select(".jet-listing-grid__item")

        idx = 1
        for block in blocks:
            text_p = block.select_one("p.translation-block")
            if not text_p:
                continue

            linked_strategies = []
            strategy_links = block.select('a[href*="/strategy/"]')
            for a in strategy_links:
                slug_strat = extract_strategy_slug(a["href"])
                if slug_strat and slug_strat not in linked_strategies:
                    linked_strategies.append(slug_strat)

            paragraphs.append(
                {
                    "id": f"{project_slug}-p{idx}",  # ID Único para traducción
                    "order_index": idx,
                    "body_html": clean_html_professional(text_p),
                    "linked_strategies": linked_strategies,
                }
            )
            idx += 1

        return {
            "title": title,
            "slug": project_slug,
            "introduction": introduction,
            "short_description": short_description,
            "external_link": external_link,
            "location_map": location_map,
            "paragraphs": paragraphs,
        }
    except Exception as e:
        print(f"      ! Error en {url}: {e}")
        return None


# --- ITERADOR PRINCIPAL ---


def procesar_catalogo():
    if not os.path.exists(ARCHIVO_CATALOGO):
        print(f"Error: No existe {ARCHIVO_CATALOGO}")
        return

    with open(ARCHIVO_CATALOGO, "r", encoding="utf-8") as f:
        soup_catalog = BeautifulSoup(f.read(), "html.parser")

    # Selector de tarjetas en el catálogo local
    items = soup_catalog.select(".jet-listing-grid__item")
    print(f"Iniciando extracción de los primeros {LIMIT_TEST} proyectos...\n")

    biblioteca_proyectos = []

    for item in items[:LIMIT_TEST]:
        # Buscamos la liga de la tarjeta
        link_tag = item.select_one("a")
        if not link_tag or not link_tag.get("href"):
            continue

        url_proyecto = link_tag["href"]
        print(f"-> Procesando: {url_proyecto}")

        datos = fetch_project_details_from_url(url_proyecto)
        if datos:
            biblioteca_proyectos.append(datos)

    # Guardar resultado final
    with open(SALIDA_JSON, "w", encoding="utf-8") as f:
        json.dump(biblioteca_proyectos, f, indent=4, ensure_ascii=False)

    print(f"\n✨ ¡Éxito! Archivo generado: {SALIDA_JSON}")


if __name__ == "__main__":
    procesar_catalogo()
