-- Status for draft/publish workflow
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE public.content_status AS ENUM ('draft', 'published');
    END IF;
END$$;

-- Admin allow-list (add more admins by inserting rows here)
CREATE TABLE IF NOT EXISTS public.admins (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS public.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        thumbnail_url TEXT,
        external_link_url TEXT,
        location_map_url TEXT,
        gallery_urls JSONB DEFAULT '[]'::jsonb,
        published_at DATE,
        status public.content_status NOT NULL DEFAULT 'draft',
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        translations JSONB DEFAULT '{}'::jsonb -- { "es": {...}, "en": {...}, "zh": {...} }
);

ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS status public.content_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Tabla de Estrategias
CREATE TABLE IF NOT EXISTS public.strategies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        logo_url TEXT,
        hero_image_url TEXT,
        status public.content_status NOT NULL DEFAULT 'draft',
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        translations JSONB DEFAULT '{}'::jsonb -- { "es": {...}, "en": {...} }
);

ALTER TABLE public.strategies
    ADD COLUMN IF NOT EXISTS status public.content_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Tabla de Párrafos de Proyectos
CREATE TABLE IF NOT EXISTS public.project_paragraphs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
        paragraph_key TEXT NOT NULL, -- p1, p2, etc.
        sort_order INT NOT NULL,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        translations JSONB DEFAULT '{}'::jsonb -- { "es": "html...", "en": "html..." }
);

ALTER TABLE public.project_paragraphs
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 4. Tabla de Relación Párrafo-Estrategia
CREATE TABLE IF NOT EXISTS public.paragraph_strategies (
        paragraph_id UUID REFERENCES public.project_paragraphs(id) ON DELETE CASCADE,
        strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
        PRIMARY KEY (paragraph_id, strategy_id)
);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
        CREATE TRIGGER trg_projects_updated_at
        BEFORE UPDATE ON public.projects
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_strategies_updated_at') THEN
        CREATE TRIGGER trg_strategies_updated_at
        BEFORE UPDATE ON public.strategies
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_paragraphs_updated_at') THEN
        CREATE TRIGGER trg_project_paragraphs_updated_at
        BEFORE UPDATE ON public.project_paragraphs
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END$$;