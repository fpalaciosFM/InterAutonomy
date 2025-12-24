import json
import re
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import unquote

# --- CONFIGURACIÓN ---
ARCHIVO_CATALOGO = "Projects - Interautonomy.html"
IDIOMAS = ["en", "es", "zh"]
LIMIT_TEST = 2  # Cambiar a None para procesar todo el catálogo


def normalize_slug(url):
    """Limpia el slug del proyecto para que sea una ID única y limpia."""
    match = re.search(r"/project/([^/]+)/?", url)
    if match:
        raw_slug = unquote(match.group(1).rstrip("/"))
        clean_slug = (
            raw_slug.replace("·", "")
            .replace("  ", " ")
            .strip()
            .lower()
            .replace(" ", "-")
        )
        return re.sub(r"-+", "-", clean_slug)
    return "sin-slug"


def clean_html_professional(container):
    """Limpia el HTML preservando solo formatos esenciales."""
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


def fetch_project_full_info(url, lang_code):
    try:
        # 1. Ajuste de idioma en la URL
        current_url = re.sub(r"/(es|en|zh|fr|it)/", f"/{lang_code}/", url)

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        response = requests.get(current_url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        slug = normalize_slug(url)

        # --- Extracción de Metadatos (h6) ---
        external_link_url = ""
        external_link_text = ""
        location_map_url = ""
        location_map_text = ""
        short_description = ""

        h6_container = soup.select_one("h6")
        if h6_container:
            # Buscamos los párrafos directos dentro del h6
            p_tags = h6_container.find_all("p", recursive=False)

            # 1. Link Externo (P1:nth-child(1))
            if len(p_tags) >= 1:
                a_ext = p_tags[0].find("a")
                if a_ext:
                    external_link_url = a_ext.get("href", "")
                    span = a_ext.find("span")
                    external_link_text = (
                        span.get_text(strip=True)
                        if span
                        else a_ext.get_text(strip=True)
                    )

            # 2. Ubicación / Maps (P2:nth-child(2))
            if len(p_tags) >= 2:
                a_loc = p_tags[1].find("a")
                if a_loc:
                    location_map_url = a_loc.get("href", "")
                    span = a_loc.find("span")
                    location_map_text = (
                        span.get_text(strip=True)
                        if span
                        else a_loc.get_text(strip=True)
                    )

            # 4. Descripción Corta (P4:nth-child(4)) - Lógica previa mantenida
            if len(p_tags) >= 4:
                short_description = clean_html_professional(p_tags[3])

        # --- Textos Principales ---
        title_tag = soup.select_one(".elementor-widget-jet-listing-dynamic-field h1")
        title = title_tag.get_text(strip=True) if title_tag else ""

        intro_tag = soup.select_one(
            ".elementor-element-5d39f2b .elementor-widget-container"
        )
        introduction = clean_html_professional(intro_tag) if intro_tag else ""

        # --- Bloques de Párrafos y Estrategias ---
        paragraphs = []
        blocks = soup.select(".elementor-element-2327781")

        for idx, block in enumerate(blocks, 1):
            text_p = block.select_one("div.jet-listing-dynamic-field__content")
            if not text_p or not text_p.get_text(strip=True):
                continue

            strategies = []
            for a in block.select('a[href*="/strategy/"]'):
                href = a.get("href", "")
                s_match = re.search(r"/strategy/([^/]+)/?", href)
                if s_match:
                    strat_slug = s_match.group(1).rstrip("/")
                    if strat_slug not in strategies:
                        strategies.append(strat_slug)

            paragraphs.append(
                {
                    "id": f"{slug}-p{idx}",
                    "body_html": clean_html_professional(text_p),
                    "linked_strategies": list(set(strategies)),
                }
            )

        # --- Galería de Imágenes ---
        gallery_images = []
        gallery_items = soup.select(".elementor-widget-gallery a")
        for a in gallery_items:
            img_href = a.get("href")
            if img_href and any(
                img_href.lower().endswith(ext)
                for ext in [".jpg", ".jpeg", ".png", ".webp"]
            ):
                if img_href not in gallery_images:
                    gallery_images.append(img_href)

        return {
            "slug": slug,
            "base": {
                "external_link": external_link_url,
                "location_map": location_map_url,
                "paragraphs_map": [
                    {"id": p["id"], "strategies": p["linked_strategies"]}
                    for p in paragraphs
                    if len(p["linked_strategies"]) > 0
                ],
                "gallery_images": gallery_images,
            },
            "translation": {
                "title": title,
                "introduction": introduction,
                "short_description": short_description,
                "external_link_text": external_link_text,
                "location_map_text": location_map_text,
                "paragraphs": [
                    {"id": p["id"], "body_html": p["body_html"]}
                    for p in paragraphs
                    if len(p["linked_strategies"]) > 0
                ],
            },
        }
    except Exception as e:
        print(f"Error en {lang_code} - {url}: {e}")
        return None


def main():
    if not os.path.exists(ARCHIVO_CATALOGO):
        print(f"❌ No se encontró el archivo: {ARCHIVO_CATALOGO}")
        return

    with open(ARCHIVO_CATALOGO, "r", encoding="utf-8") as f:
        soup_catalog = BeautifulSoup(f.read(), "html.parser")

    items = soup_catalog.select(".jet-listing-grid__item")[:LIMIT_TEST]
    print(f"Se encontraron {len(items)} items en el catálogo.")

    base_catalog = []
    translations = {lang: [] for lang in IDIOMAS}

    for item in items:
        url_node = item.select_one("a")
        if not url_node:
            continue

        url_base = url_node["href"]
        project_slug = normalize_slug(url_base)
        print(f"📦 Proyecto: {project_slug}")

        img_node = item.select_one(".elementor-widget-image img")
        img_url = img_node.get("src") if img_node else None
        if img_node and not img_url:
            img_url = img_node.get("data-src")

        for lang in IDIOMAS:
            print(f"   -> Extrayendo idioma: {lang}")
            data = fetch_project_full_info(url_base, lang)
            if data:
                if not any(b["slug"] == project_slug for b in base_catalog):
                    base_catalog.append(
                        {
                            "slug": project_slug,
                            "thumbnail": img_url,
                            **data["base"],
                        }
                    )
                translations[lang].append({"slug": project_slug, **data["translation"]})

    # Guardado de archivos
    with open("projects_base.json", "w", encoding="utf-8") as f:
        json.dump(base_catalog, f, indent=4, ensure_ascii=False)

    for lang in IDIOMAS:
        with open(f"projects_data_{lang}.json", "w", encoding="utf-8") as f:
            json.dump(translations[lang], f, indent=4, ensure_ascii=False)

    print("\n✨ ¡Listo! Revisa los archivos generados.")


if __name__ == "__main__":
    main()
