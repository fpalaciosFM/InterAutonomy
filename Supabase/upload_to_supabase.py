import json
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# --- CONFIGURACIÓN DE RUTAS RELATIVAS ---
# Estamos en /Supabase, queremos ir a /Scraping/...
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Carpeta actual (Supabase)
PATH_PROJECTS = os.path.join(BASE_DIR, "..", "Scraping", "Projects")
PATH_STRATEGIES = os.path.join(BASE_DIR, "..", "Scraping", "Strategies")

# --- CARGAR CONFIGURACIÓN SEGURA ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: No se encontraron las credenciales en el archivo .env")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

IDIOMAS = ["es", "en", "zh"]


def load_json(path, filename):
    full_path = os.path.join(path, filename)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            return json.load(f)
    print(f"⚠️ Advertencia: No se encontró el archivo {full_path}")
    return []


def run_migration():
    print("🚀 Iniciando migración segura a Supabase...")

    # 1. CARGAR DATOS DE ESTRATEGIAS
    print("\n📂 Procesando Estrategias...")
    strat_base = load_json(PATH_STRATEGIES, "strategies_base.json")
    strat_langs = {
        lang: load_json(PATH_STRATEGIES, f"strategies_data_{lang}.json")
        for lang in IDIOMAS
    }

    strategy_map = {}

    for s in strat_base:
        slug = s["slug"]
        translations = {}
        for lang in IDIOMAS:
            lang_item = next(
                (item for item in strat_langs[lang] if item["slug"] == slug), None
            )
            if lang_item:
                translations[lang] = {
                    "title": lang_item.get("title", ""),
                    "description_html": lang_item.get("description_html", ""),
                }

        res = (
            supabase.table("strategies")
            .upsert(
                {
                    "slug": slug,
                    "logo_url": s.get("logo_url"),
                    "hero_image_url": s.get("hero_image"),
                    "translations": translations,
                }
            )
            .execute()
        )

        if res.data:
            strategy_map[slug] = res.data[0]["id"]
            print(f"✅ Estrategia guardada: {slug}")

    # 2. CARGAR DATOS DE PROYECTOS
    print("\n📂 Procesando Proyectos...")
    proj_base = load_json(PATH_PROJECTS, "projects_base.json")
    proj_langs = {
        lang: load_json(PATH_PROJECTS, f"projects_data_{lang}.json") for lang in IDIOMAS
    }

    for p in proj_base:
        slug = p["slug"]
        proj_translations = {}
        for lang in IDIOMAS:
            l_item = next(
                (item for item in proj_langs[lang] if item["slug"] == slug), None
            )
            if l_item:
                proj_translations[lang] = {
                    "title": l_item.get("title", ""),
                    "introduction": l_item.get("introduction", ""),
                    "short_description": l_item.get("short_description", ""),
                    "video_url": l_item.get("video_url", ""),
                    "external_link_text": l_item.get("external_link_text", ""),
                    "location_map_text": l_item.get("location_map_text", ""),
                }

        res_p = (
            supabase.table("projects")
            .upsert(
                {
                    "slug": slug,
                    "thumbnail_url": p.get("thumbnail"),
                    "external_link_url": p.get("external_link"),
                    "location_map_url": p.get("location_map"),
                    "gallery_urls": p.get("gallery_images", []),
                    "translations": proj_translations,
                }
            )
            .execute()
        )

        if not res_p.data:
            continue
        project_id = res_p.data[0]["id"]
        print(f"✅ Proyecto guardado: {slug}")

        # 3. CARGAR PÁRRAFOS Y RELACIONES
        base_paragraphs = p.get("paragraphs_map", [])

        for idx, p_map in enumerate(base_paragraphs):
            p_key = p_map["id"]
            p_translations = {}
            for lang in IDIOMAS:
                l_item = next(
                    (item for item in proj_langs[lang] if item["slug"] == slug), None
                )
                if l_item:
                    # Buscamos el párrafo por su ID dentro de la lista de párrafos del idioma
                    paragraphs_list = l_item.get("paragraphs", [])
                    p_text = next(
                        (
                            item["body_html"]
                            for item in paragraphs_list
                            if item["id"] == p_key
                        ),
                        "",
                    )
                    p_translations[lang] = p_text

            res_para = (
                supabase.table("project_paragraphs")
                .upsert(
                    {
                        "project_id": project_id,
                        "paragraph_key": p_key,
                        "sort_order": idx,
                        "translations": p_translations,
                    }
                )
                .execute()
            )

            if res_para.data:
                paragraph_id = res_para.data[0]["id"]
                for s_slug in p_map.get("strategies", []):
                    if s_slug in strategy_map:
                        supabase.table("paragraph_strategies").upsert(
                            {
                                "paragraph_id": paragraph_id,
                                "strategy_id": strategy_map[s_slug],
                            }
                        ).execute()

        print(f"   ∟ Párrafos y relaciones vinculadas para {slug}")

    print("\n✨ Migración completada con éxito.")


if __name__ == "__main__":
    run_migration()
