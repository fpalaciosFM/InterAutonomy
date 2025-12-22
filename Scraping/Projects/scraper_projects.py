import json
import re
from bs4 import BeautifulSoup


def extract_strategy_slug(url):
    match = re.search(r"/strategy/([^/]+)/", url)
    return match.group(1) if match else None


def clean_html_professional(container):
    """Limpia el contenido interno preservando negritas y colores."""
    if not container:
        return ""

    # 1. Primero limpiamos los atributos de las etiquetas internas
    for tag in container.find_all(True):
        if "class" in tag.attrs:
            tag.attrs["class"] = [c for c in tag.attrs["class"] if c.startswith("has-")]
            if not tag.attrs["class"]:
                del tag.attrs["class"]

        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr not in ["src", "href", "alt", "class"]:
                del tag.attrs[attr]

    # 2. .decode_contents() extrae lo que hay DENTRO de la etiqueta <p>,
    # eliminando la etiqueta <p class="translation-block"> en sí misma.
    return container.decode_contents().strip()


def fetch_project_details(local_file):
    with open(local_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # --- 1. METADATOS ---
    title_tag = soup.select_one(".elementor-widget-jet-listing-dynamic-field h1")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Introducción
    intro_tag = soup.select_one(
        ".elementor-element-5d39f2b .elementor-widget-container"
    )
    introduction = intro_tag.get_text(strip=" ", separator=" ") if intro_tag else ""
    introduction = re.sub(r"^info\s+\d{4}", "", introduction).strip()

    # Descripción corta
    short_description = ""
    desc_container = soup.select_one("h6")
    if desc_container:
        paragraphs_in_h6 = desc_container.find_all("p")
        if len(paragraphs_in_h6) >= 4:
            short_description = paragraphs_in_h6[3].get_text(strip=True)

    # --- 2. ENLACES Y UBICACIÓN ---
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

    # --- 3. PÁRRAFOS ---
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
            slug = extract_strategy_slug(a["href"])
            if slug and slug not in linked_strategies:
                linked_strategies.append(slug)

        paragraphs.append(
            {
                "order_index": idx,
                "body_html": clean_html_professional(text_p),
                "linked_strategies": linked_strategies,
            }
        )
        idx += 1

    return {
        "title": title,
        "introduction": introduction,
        "short_description": short_description,
        "external_link": external_link,
        "location_map": location_map,
        "paragraphs": paragraphs,
    }


# --- EJECUCIÓN SEGURA ---
try:
    # Cambia el nombre al de tu archivo local
    filename = "Upsala Circus · Russia - Interautonomy.html"
    result = fetch_project_details(filename)

    # GUARDAR EN ARCHIVO (Evita el error de consola)
    with open("proyecto_final.json", "w", encoding="utf-8") as json_file:
        json.dump(result, json_file, indent=4, ensure_ascii=False)

    print(
        f"✨ ¡Éxito! El archivo 'proyecto_final.json' ha sido generado correctamente."
    )

except Exception as e:
    print(f"❌ Ocurrió un error: {e}")
