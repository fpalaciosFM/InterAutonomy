import json
import os
from datetime import date
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
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Migration defaults
DEFAULT_STATUS = os.getenv("MIGRATION_DEFAULT_STATUS", "published").strip().lower()  # draft | published
DEFAULT_PUBLISH_DATE = os.getenv("MIGRATION_PUBLISHED_AT")  # YYYY-MM-DD (optional)

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


def normalize_status(value: str) -> str:
    v = (value or "").strip().lower()
    return "published" if v == "published" else "draft"


def published_at_value() -> str:
    # Store as DATE (YYYY-MM-DD)
    if DEFAULT_PUBLISH_DATE:
        return DEFAULT_PUBLISH_DATE
    return date.today().isoformat()


def get_row_id_by_slug(table: str, slug: str):
    res = supabase.table(table).select("id").eq("slug", slug).limit(1).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]["id"]
    return None


def upsert_paragraph(project_id: str, paragraph_key: str, sort_order: int, translations: dict):
    existing = (
        supabase.table("project_paragraphs")
        .select("id")
        .eq("project_id", project_id)
        .eq("paragraph_key", paragraph_key)
        .limit(1)
        .execute()
    )

    payload = {
        "project_id": project_id,
        "paragraph_key": paragraph_key,
        "sort_order": sort_order,
        "translations": translations,
        # Keep explicitly null so content remains visible when related project is published.
        "deleted_at": None,
    }

    if existing.data and len(existing.data) > 0:
        paragraph_id = existing.data[0]["id"]
        upd = supabase.table("project_paragraphs").update(payload).eq("id", paragraph_id).execute()
        if not upd.data:
            return paragraph_id
        return upd.data[0].get("id", paragraph_id)

    ins = supabase.table("project_paragraphs").insert(payload).execute()
    if ins.data and len(ins.data) > 0:
        return ins.data[0]["id"]
    return None


def run_migration():
    print("🚀 Iniciando migración segura a Supabase...")

    status = normalize_status(DEFAULT_STATUS)
    print(f"ℹ️  Status por defecto para contenido: {status}")

    # 1. CARGAR DATOS DE ESTRATEGIAS
    print("\n📂 Procesando Estrategias...")
    strat_base = load_json(PATH_STRATEGIES, "strategies_base.json")
    strategy_map = {}
    for s in strat_base:
        slug = s["slug"]
        translations = s.get("translations", {})
        hero_image_url = s.get("hero_image_url") or s.get("hero_image")
        res = (
            supabase.table("strategies")
            .upsert(
                {
                    "slug": slug,
                    "logo_url": s.get("logo_url"),
                    "hero_image_url": hero_image_url,
                    "translations": translations,
                    "status": status,
                    "deleted_at": None,
                }
                ,
                on_conflict="slug",
            )
            .execute()
        )
        if res.data and len(res.data) > 0:
            strategy_map[slug] = res.data[0].get("id")
        if not strategy_map.get(slug):
            strategy_map[slug] = get_row_id_by_slug("strategies", slug)
        if strategy_map.get(slug):
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

        published_at = None
        if status == "published":
            published_at = p.get("published_at") or published_at_value()

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
                    "status": status,
                    "deleted_at": None,
                    "published_at": published_at,
                }
                ,
                on_conflict="slug",
            )
            .execute()
        )
        if res_p.data and len(res_p.data) > 0:
            project_id_map[slug] = res_p.data[0].get("id")
        if not project_id_map.get(slug):
            project_id_map[slug] = get_row_id_by_slug("projects", slug)
        if project_id_map.get(slug):
            print(f"✅ Proyecto guardado: {slug}")

    # 3. CARGAR PÁRRAFOS Y RELACIONES DESDE paragraphs_base.json
    for para in paragraphs_base:
        project_slug = para["project_slug"]
        if project_slug not in project_id_map:
            print(f"⚠️ Proyecto no encontrado para párrafo: {para['slug']}")
            continue
        project_id = project_id_map[project_slug]

        paragraph_id = upsert_paragraph(
            project_id=project_id,
            paragraph_key=para["slug"],
            sort_order=para.get("order", 0),
            translations=para.get("translations", {}),
        )

        if paragraph_id:
            for s_slug in para.get("strategies", []):
                if s_slug in strategy_map and strategy_map[s_slug]:
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
