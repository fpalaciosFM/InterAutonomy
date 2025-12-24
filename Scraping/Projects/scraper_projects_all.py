import json
import re
import requests
from bs4 import BeautifulSoup
import os
import base64
from urllib.parse import unquote

# --- CONFIGURACIÓN ---
ARCHIVO_CATALOGO = "Projects - Interautonomy.html"
IDIOMAS = ["en", "es", "zh"]
LIMIT_TEST = 2


def normalize_slug(url):
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


def extract_elementor_action_url(href):
    if not href or "elementor-action" not in href:
        return ""
    try:
        decoded_href = unquote(href)
        match = re.search(r"settings=([A-Za-z0-9+/=]+)", decoded_href)
        if match:
            b64_str = match.group(1)
            missing_padding = len(b64_str) % 4
            if missing_padding:
                b64_str += "=" * (4 - missing_padding)
            json_str = base64.b64decode(b64_str).decode("utf-8")
            data = json.loads(json_str)
            return data.get("video_url", "").replace("\\/", "/")
    except Exception:
        pass
    return ""


def fetch_project_full_info(url, lang_code):
    try:
        current_url = re.sub(r"/(es|en|zh|fr|it)/", f"/{lang_code}/", url)
        headers = {"User-Agent": "Mozilla/5.0..."}
        response = requests.get(current_url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        slug = normalize_slug(url)

        # --- Metadatos H6 ---
        external_link_url = ""
        external_link_text = ""
        location_map_url = ""
        location_map_text = ""
        short_description = ""

        h6_container = soup.select_one("h6")
        if h6_container:
            p_tags = h6_container.find_all("p", recursive=False)
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
            if len(p_tags) >= 4:
                short_description = clean_html_professional(p_tags[3])

        # --- Lógica de Videos Separada ---
        # Extraemos los 3 disponibles en la página
        iframe_en = soup.select_one(".elementor-element-4ba088e iframe")
        v_en = ""
        if iframe_en:
            v_en = iframe_en.get("data-lazy-load") or iframe_en.get("src") or ""
            if "youtube.com/embed/" in v_en:
                v_en = v_en.split("?")[0].replace("/embed/", "/watch?v=")

        btn_es = soup.select_one(".elementor-element-716dcbf a")
        v_es = extract_elementor_action_url(btn_es.get("href")) if btn_es else ""

        btn_zh = soup.select_one(".elementor-element-d169596 a")
        v_zh = extract_elementor_action_url(btn_zh.get("href")) if btn_zh else ""

        # Mapeamos para seleccionar el correcto según el idioma que estamos scrapeando
        video_map = {"en": v_en, "es": v_es, "zh": v_zh}
        current_video_url = video_map.get(lang_code, "")

        # --- Contenido ---
        title_tag = soup.select_one(".elementor-widget-jet-listing-dynamic-field h1")
        title = title_tag.get_text(strip=True) if title_tag else ""

        intro_tag = soup.select_one(
            ".elementor-element-5d39f2b .elementor-widget-container"
        )
        introduction = clean_html_professional(intro_tag) if intro_tag else ""

        paragraphs = []
        blocks = soup.select(".elementor-element-2327781")
        for idx, block in enumerate(blocks, 1):
            text_p = block.select_one("div.jet-listing-dynamic-field__content")
            if not text_p or not text_p.get_text(strip=True):
                continue
            strategies = [
                re.search(r"/strategy/([^/]+)/?", a["href"]).group(1).rstrip("/")
                for a in block.select('a[href*="/strategy/"]')
                if re.search(r"/strategy/([^/]+)/?", a["href"])
            ]
            paragraphs.append(
                {
                    "id": f"{slug}-p{idx}",
                    "body_html": clean_html_professional(text_p),
                    "linked_strategies": list(set(strategies)),
                }
            )

        gallery_images = [
            a["href"]
            for a in soup.select(".elementor-widget-gallery a")
            if a.get("href")
            and any(
                a["href"].lower().endswith(ext)
                for ext in [".jpg", ".jpeg", ".png", ".webp"]
            )
        ]

        return {
            "slug": slug,
            "base": {
                "external_link": external_link_url,
                "location_map": location_map_url,
                "paragraphs_map": [
                    {"id": p["id"], "strategies": p["linked_strategies"]}
                    for p in paragraphs
                    if p["linked_strategies"]
                ],
                "gallery_images": list(dict.fromkeys(gallery_images)),
            },
            "translation": {
                "title": title,
                "introduction": introduction,
                "short_description": short_description,
                "external_link_text": external_link_text,
                "location_map_text": location_map_text,
                "video_url": current_video_url,  # <--- Video específico del idioma
                "paragraphs": [
                    {"id": p["id"], "body_html": p["body_html"]}
                    for p in paragraphs
                    if p["linked_strategies"]
                ],
            },
        }
    except Exception as e:
        print(f"Error en {lang_code} - {url}: {e}")
        return None


def main():
    if not os.path.exists(ARCHIVO_CATALOGO):
        return
    with open(ARCHIVO_CATALOGO, "r", encoding="utf-8") as f:
        soup_catalog = BeautifulSoup(f.read(), "html.parser")

    items = soup_catalog.select(".jet-listing-grid__item")[:LIMIT_TEST]
    base_catalog, translations = [], {lang: [] for lang in IDIOMAS}

    for item in items:
        url_node = item.select_one("a")
        if not url_node:
            continue
        url_base = url_node["href"]
        project_slug = normalize_slug(url_base)
        print(f"📦 Proyecto: {project_slug}")

        img_node = item.select_one(".elementor-widget-image img")
        img_url = img_node.get("src") or img_node.get("data-src") if img_node else None

        for lang in IDIOMAS:
            print(f"   -> Extrayendo idioma: {lang}")
            data = fetch_project_full_info(url_base, lang)
            if data:
                if not any(b["slug"] == project_slug for b in base_catalog):
                    base_catalog.append(
                        {"slug": project_slug, "thumbnail": img_url, **data["base"]}
                    )
                translations[lang].append({"slug": project_slug, **data["translation"]})

    with open("projects_base.json", "w", encoding="utf-8") as f:
        json.dump(base_catalog, f, indent=4, ensure_ascii=False)
    for lang in IDIOMAS:
        with open(f"projects_data_{lang}.json", "w", encoding="utf-8") as f:
            json.dump(translations[lang], f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()
