import json
import re
import requests
from bs4 import BeautifulSoup
import time

def extract_slug(url):
    match = re.search(r'/strategy/([^/]+)/', url)
    return match.group(1) if match else None

def get_soup(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"   ❌ Error: {e}")
    return None

def parse_local_catalog(file_path):
    """Parses the local strategies catalog file."""
    print(f"🔍 Analyzing catalog: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    strategies = []
    # Targeted JetEngine listing items
    items = soup.find_all('div', class_='jet-listing-grid__item')
    
    for item in items:
        link_tag = item.find('a', href=True)
        title_tag = item.find(['h1', 'h2', 'h3'], class_='elementor-heading-title')
        
        if link_tag and title_tag:
            url = link_tag['href']
            slug = extract_slug(url)
            if slug:
                strategies.append({
                    "slug": slug,
                    "name_es_raw": title_tag.get_text(strip=True)
                })
    return strategies

def fetch_details(slug, lang):
    url = f"https://interautonomy.org/{lang}/strategy/{slug}/"
    soup = get_soup(url)
    if not soup: return None

    # 1. Título (Corregido: buscamos el h1 principal de la página)
    title_tag = soup.find('h1')
    title = title_tag.get_text(strip=True) if title_tag else ""

    # 2. Hero Image (Corregido: buscamos la imagen dentro del widget de imagen de la cabecera)
    # Si no la encuentra, intentamos usar la imagen de la metaetiqueta og:image como respaldo
    hero_img = ""
    og_image = soup.find("meta", property="og:image")
    if og_image:
        hero_img = og_image["content"]
    
    # 3. Contenido de Investigación (Corregido y con Formato Preservado)
    research_section = soup.find('section', {'data-id': '9b86c65'}) or \
                       soup.find('section', class_='elementor-element-9b86c65')

    description_html = ""
    if research_section:
        content_container = research_section.find('div', class_='elementor-widget-container')
        if content_container:
            # LIMPIEZA INTELIGENTE:
            # Preservamos clases que empiecen con 'has-' (colores/tamaños de WP) 
            # y etiquetas de formato como strong, b, i, span.
            for tag in content_container.find_all(True):
                attrs = dict(tag.attrs)
                for attr in attrs:
                    # Mantenemos 'class' solo si tiene clases de formato de WordPress
                    if attr == 'class':
                        new_classes = [c for c in tag.attrs['class'] if c.startswith('has-')]
                        if new_classes:
                            tag.attrs['class'] = new_classes
                        else:
                            del tag.attrs['class']
                    # Mantenemos 'style' solo si tiene color o font-size (opcional)
                    elif attr == 'style':
                        if 'color' not in tag.attrs['style'] and 'font-size' not in tag.attrs['style']:
                            del tag.attrs['style']
                    # Borramos todo lo demás que no sea src, href o alt
                    elif attr not in ['src', 'href', 'alt']:
                        del tag.attrs[attr]
            
            description_html = str(content_container)

    return {
        "title": title,
        "hero_image": hero_img,
        "description_html": description_html,
        "source_url": url
    }

def main():
    # File provided by user: Strategies - Interautonomy.html
    catalog_file = 'Strategies - Interautonomy.html'
    base_list = parse_local_catalog(catalog_file)
    
    # Trial with first 3 strategies
    final_db = {}
    languages = ['es', 'en', 'zh']

    for entry in base_list[:3]:
        slug = entry['slug']
        print(f"\n🚀 Processing strategy: {slug}")
        
        final_db[slug] = {
            "slug": slug,
            "translations": {}
        }
        
        for lang in languages:
            print(f"   📥 Downloading [{lang}] detail...")
            data = fetch_details(slug, lang)
            if data:
                final_db[slug]["translations"][lang] = data
            time.sleep(1.5)

    # Save to JSON with English naming convention
    with open('strategies_data.json', 'w', encoding='utf-8') as f:
        json.dump(final_db, f, ensure_ascii=False, indent=4)
    
    print("\n✨ Extraction finished! Result saved in 'strategies_data.json'")

if __name__ == "__main__":
    main()