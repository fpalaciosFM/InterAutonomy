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
    strategy_map = {}
    for s in strat_base:
        slug = s["slug"]
        translations = s.get("translations", {})
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
    paragraphs_base = load_json(PATH_PROJECTS, "paragraphs_base.json")

    # Crear un mapa de slug de proyecto a su UUID en la base de datos
    project_id_map = {}
    for p in proj_base:
        slug = p["slug"]
        translations = p.get("translations", {})
        res_p = (
            supabase.table("projects")
            .upsert(
                {
                    "slug": slug,
                    "thumbnail_url": p.get("thumbnail"),
                    "external_link_url": p.get("external_link"),
                    "location_map_url": p.get("location_map"),
                    "gallery_urls": p.get("gallery_images", []),
                    "translations": translations,
                }
            )
            .execute()
        )
        if res_p.data:
            project_id_map[slug] = res_p.data[0]["id"]
            print(f"✅ Proyecto guardado: {slug}")

    # 3. CARGAR PÁRRAFOS Y RELACIONES DESDE paragraphs_base.json
    for para in paragraphs_base:
        project_slug = para["project_slug"]
        if project_slug not in project_id_map:
            print(f"⚠️ Proyecto no encontrado para párrafo: {para['slug']}")
            continue
        project_id = project_id_map[project_slug]
        res_para = (
            supabase.table("project_paragraphs")
            .upsert(
                {
                    "project_id": project_id,
                    "paragraph_key": para["slug"],
                    "sort_order": para.get("order", 0),
                    "translations": para.get("translations", {}),
                }
            )
            .execute()
        )
        if res_para.data:
            paragraph_id = res_para.data[0]["id"]
            for s_slug in para.get("strategies", []):
                if s_slug in strategy_map:
                    supabase.table("paragraph_strategies").upsert(
                        {
                            "paragraph_id": paragraph_id,
                            "strategy_id": strategy_map[s_slug],
                        }
                    ).execute()
        print(f"   ∟ Párrafo y relaciones vinculadas para {para['slug']}")

    print("\n✨ Migración completada con éxito.")


if __name__ == "__main__":
    run_migration()
