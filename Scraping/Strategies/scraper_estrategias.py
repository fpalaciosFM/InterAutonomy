import json
import re
import requests
from bs4 import BeautifulSoup
import time
import os
from urllib.parse import urljoin

# --- CONFIGURACIÓN ---
ARCHIVO_CATALOGO_ESTRATEGIAS = "Strategies - Interautonomy.html"
IDIOMAS = ["es", "en", "zh"]
LIMIT_TEST = 1  # Cambiar a None para procesar todo el catálogo


def extract_slug(url):
    """Extrae el slug de la URL de la estrategia."""
    match = re.search(r"/strategy/([^/]+)/", url)
    return match.group(1) if match else None


def clean_html_professional(container):
    """Limpia el HTML preservando solo formatos esenciales."""
    if not container:
        return ""

    # Eliminamos scripts, estilos y comentarios
    for element in container(["script", "style"]):
        element.decompose()

    for tag in container.find_all(True):
        # Limpieza de clases
        if "class" in tag.attrs:
            tag.attrs["class"] = [c for c in tag.attrs["class"] if c.startswith("has-")]
            if not tag.attrs["class"]:
                del tag.attrs["class"]

        # Limpieza de otros atributos
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr == "style":
                del tag.attrs["style"]
            elif attr not in ["src", "href", "alt"]:
                del tag.attrs[attr]

    # CAMBIO: Usamos decode_contents() para extraer solo el HTML interior
    return container.decode_contents().strip()


def fetch_strategy_details(slug, lang):
    """Descarga el detalle de la estrategia para un idioma específico."""
    # Nota: Ajusta la estructura de la URL si el chino usa subdominio o subdirectorio diferente
    base_url = f"https://interautonomy.org/{lang}/strategy/{slug}/"

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(base_url, headers=headers, timeout=15)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        # 1. Título
        title_node = soup.select_one("h1")
        title = title_node.get_text(strip=True) if title_node else ""

        # 2. Imagen Hero
        hero_img = None
        hero_img_node = soup.find("meta", property="og:image")
        if hero_img_node:
            hero_img = hero_img = hero_img_node["content"]
            # hero_img = urljoin(base_url, hero_img)

        # 3. Contenido Principal
        # Ajustamos el selector según el contenedor real de las estrategias
        research_section = soup.find("section", {"data-id": "9b86c65"}) or soup.find(
            "section", class_="elementor-element-9b86c65"
        )

        description_html = ""
        if research_section:
            content_container = research_section.find(
                "div", class_="elementor-widget-container"
            )
            if content_container:
                # LIMPIEZA INTELIGENTE:
                # Preservamos clases que empiecen con 'has-' (colores/tamaños de WP)
                # y etiquetas de formato como strong, b, i, span.
                for tag in content_container.find_all(True):
                    attrs = dict(tag.attrs)
                    for attr in attrs:
                        # Mantenemos 'class' solo si tiene clases de formato de WordPress
                        if attr == "class":
                            new_classes = [
                                c for c in tag.attrs["class"] if c.startswith("has-")
                            ]
                            if new_classes:
                                tag.attrs["class"] = new_classes
                            else:
                                del tag.attrs["class"]
                        # Mantenemos 'style' solo si tiene color o font-size (opcional)
                        elif attr == "style":
                            if (
                                "color" not in tag.attrs["style"]
                                and "font-size" not in tag.attrs["style"]
                            ):
                                del tag.attrs["style"]
                        # Borramos todo lo demás que no sea src, href o alt
                        elif attr not in ["src", "href", "alt"]:
                            del tag.attrs[attr]

                description_html = clean_html_professional(content_container)

        return {
            "base": {
                "hero_image": hero_img,
            },
            "translation": {
                "title": title,
                "description_html": description_html,
            },
        }
    except Exception as e:
        print(f"      ❌ Error descargando {slug} [{lang}]: {e}")
        return None


def parse_local_catalog(file_path):
    """Analiza el archivo HTML local para obtener la lista inicial de estrategias."""
    if not os.path.exists(file_path):
        return []

    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    strategies = []
    items = soup.find_all("div", class_="jet-listing-grid__item")

    for item in items:
        link_tag = item.find("a", href=True)
        if link_tag:
            url = link_tag["href"]
            slug = extract_slug(url)
            if slug:
                strategies.append({"slug": slug, "url": url})
    return strategies


def main():
    print(f"🔍 Analizando catálogo: {ARCHIVO_CATALOGO_ESTRATEGIAS}")
    base_list = parse_local_catalog(ARCHIVO_CATALOGO_ESTRATEGIAS)

    if LIMIT_TEST:
        base_list = base_list[:LIMIT_TEST]

    base_catalog = []
    translations = {lang: [] for lang in IDIOMAS}

    for entry in base_list:
        slug = entry["slug"]
        print(f"\n🚀 Procesando estrategia: {slug}")

        for lang in IDIOMAS:
            print(f"   📥 Descargando [{lang}]...")
            data = fetch_strategy_details(slug, lang)

            if data:
                # Guardar datos maestros (solo una vez por slug)
                if not any(b["slug"] == slug for b in base_catalog):
                    base_catalog.append({"slug": slug, **data["base"]})

                # Guardar traducción
                translations[lang].append({"slug": slug, **data["translation"]})

            time.sleep(1)  # Respeto al servidor

    # --- GUARDADO DE ARCHIVOS ---
    with open("strategies_base.json", "w", encoding="utf-8") as f:
        json.dump(base_catalog, f, indent=4, ensure_ascii=False)
    print("\n✅ Archivo 'strategies_base.json' generado.")

    for lang in IDIOMAS:
        nombre_archivo = f"strategies_data_{lang}.json"
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            json.dump(translations[lang], f, indent=4, ensure_ascii=False)
        print(f"✅ Archivo '{nombre_archivo}' generado.")


if __name__ == "__main__":
    main()
