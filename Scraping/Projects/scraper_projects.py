import json
import re
import sys
from bs4 import BeautifulSoup

# Esta línea ayuda a que la consola de Windows maneje mejor UTF-8 si decides imprimir
sys.stdout.reconfigure(encoding='utf-8')

def extract_strategy_slug(url):
    match = re.search(r'/strategy/([^/]+)/', url)
    return match.group(1) if match else None

def clean_html_output(container):
    """Limpia el HTML preservando el formato de Emi."""
    if not container: return ""
    for tag in container.find_all(True):
        if 'class' in tag.attrs:
            tag.attrs['class'] = [c for c in tag.attrs['class'] if c.startswith('has-')]
            if not tag.attrs['class']: del tag.attrs['class']
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr not in ['src', 'href', 'alt', 'class']:
                del tag.attrs[attr]
    return str(container)

def fetch_project_details(local_file):
    with open(local_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # --- 1. METADATOS (Basados en tus selectores de Chrome) ---
    # Título: h1 dentro del widget dinámico de Jet
    title_tag = soup.select_one('.elementor-widget-jet-listing-dynamic-field h1')
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Video: Iframe dentro del widget de video
    video_tag = soup.select_one('.elementor-widget-video iframe')
    video_url = video_tag['src'] if video_tag else ""

    # Enlaces: Basado en tu hallazgo de h6 > p > a
    external_link = ""
    location_map = ""
    links = soup.select('h6 p a')
    if len(links) >= 1:
        external_link = links[0]['href']
    if len(links) >= 2:
        location_map = links[1]['href']

    # --- 2. PÁRRAFOS Y ESTRATEGIAS (Iteración Dinámica) ---
    paragraphs = []
    # Seleccionamos cada bloque que contiene un párrafo y sus iconos
    # Usamos la clase de los items de la rejilla de JetEngine
    blocks = soup.select('.jet-listing-grid__item')
    
    idx = 1
    for block in blocks:
        # Párrafo específico: Tu selector 'p.translation-block'
        text_p = block.select_one('p.translation-block')
        if not text_p:
            continue

        # Estrategias: Buscamos links a /strategy/ dentro de este mismo bloque
        linked_strategies = []
        strategy_links = block.select('a[href*="/strategy/"]')
        for a in strategy_links:
            s_slug = extract_strategy_slug(a['href'])
            if s_slug and s_slug not in linked_strategies:
                linked_strategies.append(s_slug)

        paragraphs.append({
            "order_index": idx,
            "body_html": clean_html_output(text_p),
            "linked_strategies": linked_strategies
        })
        idx += 1

    return {
        "title": title,
        "video_url": video_url,
        "external_link": external_link,
        "location_map": location_map,
        "paragraphs": paragraphs
    }

# --- EJECUCIÓN SEGURA ---
try:
    # Cambia el nombre al de tu archivo local
    filename = 'Upsala Circus · Russia - Interautonomy.html'
    result = fetch_project_details(filename)
    
    # GUARDAR EN ARCHIVO (Evita el error de consola)
    with open('proyecto_final.json', 'w', encoding='utf-8') as json_file:
        json.dump(result, json_file, indent=4, ensure_ascii=False)
    
    print(f"✨ ¡Éxito! El archivo 'proyecto_final.json' ha sido generado correctamente.")

except Exception as e:
    print(f"❌ Ocurrió un error: {e}")