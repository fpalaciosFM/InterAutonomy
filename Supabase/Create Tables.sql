-- 1. Tabla de Proyectos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    external_link_url TEXT,
    location_map_url TEXT,
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    published_at DATE DEFAULT CURRENT_DATE,
    translations JSONB DEFAULT '{}'::jsonb -- { "es": {...}, "en": {...}, "zh": {...} }
);

-- 2. Tabla de Estrategias
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    hero_image_url TEXT,
    translations JSONB DEFAULT '{}'::jsonb -- { "es": {...}, "en": {...} }
);

-- 3. Tabla de Párrafos de Proyectos
CREATE TABLE project_paragraphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    paragraph_key TEXT NOT NULL, -- p1, p2, etc.
    sort_order INT NOT NULL,
    translations JSONB DEFAULT '{}'::jsonb -- { "es": "html...", "en": "html..." }
);

-- 4. Tabla de Relación Párrafo-Estrategia
CREATE TABLE paragraph_strategies (
    paragraph_id UUID REFERENCES project_paragraphs(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    PRIMARY KEY (paragraph_id, strategy_id)
);