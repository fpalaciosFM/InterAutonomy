ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paragraph_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Helper to check admin membership (admins are stored in public.admins)
-- SECURITY DEFINER is intentional: policies call this function, and the function
-- must be able to read public.admins even when RLS is enabled.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM public.admins a
		WHERE a.user_id = auth.uid()
	);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read admins" ON public.admins;
DROP POLICY IF EXISTS "User read own admin row" ON public.admins;

-- Let authenticated users read only their own row (exists => they're admin)
CREATE POLICY "User read own admin row"
ON public.admins
FOR SELECT
USING (user_id = auth.uid());

-- Let admins read the full admin allow-list
CREATE POLICY "Admin read admins"
ON public.admins
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública para todos" ON public.projects;
DROP POLICY IF EXISTS "Public read published projects" ON public.projects;
DROP POLICY IF EXISTS "Admin read projects" ON public.projects;
DROP POLICY IF EXISTS "Admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;

CREATE POLICY "Public read published projects"
ON public.projects
FOR SELECT
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY "Admin read projects"
ON public.projects
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin insert projects"
ON public.projects
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update projects"
ON public.projects
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete projects"
ON public.projects
FOR DELETE
USING (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública para todos" ON public.strategies;
DROP POLICY IF EXISTS "Public read published strategies" ON public.strategies;
DROP POLICY IF EXISTS "Admin read strategies" ON public.strategies;
DROP POLICY IF EXISTS "Admin insert strategies" ON public.strategies;
DROP POLICY IF EXISTS "Admin update strategies" ON public.strategies;
DROP POLICY IF EXISTS "Admin delete strategies" ON public.strategies;

CREATE POLICY "Public read published strategies"
ON public.strategies
FOR SELECT
USING (deleted_at IS NULL AND status = 'published');

CREATE POLICY "Admin read strategies"
ON public.strategies
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin insert strategies"
ON public.strategies
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update strategies"
ON public.strategies
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete strategies"
ON public.strategies
FOR DELETE
USING (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública para todos" ON public.paragraph_strategies;
DROP POLICY IF EXISTS "Public read paragraph strategies for published projects" ON public.paragraph_strategies;
DROP POLICY IF EXISTS "Admin read paragraph_strategies" ON public.paragraph_strategies;
DROP POLICY IF EXISTS "Admin insert paragraph_strategies" ON public.paragraph_strategies;
DROP POLICY IF EXISTS "Admin delete paragraph_strategies" ON public.paragraph_strategies;

CREATE POLICY "Public read paragraph strategies for published projects"
ON public.paragraph_strategies
FOR SELECT
USING (
	EXISTS (
		SELECT 1
		FROM public.project_paragraphs pp
		JOIN public.projects p ON p.id = pp.project_id
		WHERE pp.id = paragraph_id
			AND pp.deleted_at IS NULL
			AND p.deleted_at IS NULL
			AND p.status = 'published'
	)
);

CREATE POLICY "Admin read paragraph_strategies"
ON public.paragraph_strategies
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin insert paragraph_strategies"
ON public.paragraph_strategies
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete paragraph_strategies"
ON public.paragraph_strategies
FOR DELETE
USING (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública para todos" ON public.project_paragraphs;
DROP POLICY IF EXISTS "Public read paragraphs for published projects" ON public.project_paragraphs;
DROP POLICY IF EXISTS "Admin read project_paragraphs" ON public.project_paragraphs;
DROP POLICY IF EXISTS "Admin insert project_paragraphs" ON public.project_paragraphs;
DROP POLICY IF EXISTS "Admin update project_paragraphs" ON public.project_paragraphs;
DROP POLICY IF EXISTS "Admin delete project_paragraphs" ON public.project_paragraphs;

CREATE POLICY "Public read paragraphs for published projects"
ON public.project_paragraphs
FOR SELECT
USING (
	deleted_at IS NULL
	AND EXISTS (
		SELECT 1
		FROM public.projects p
		WHERE p.id = project_id
			AND p.deleted_at IS NULL
			AND p.status = 'published'
	)
);

CREATE POLICY "Admin read project_paragraphs"
ON public.project_paragraphs
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin insert project_paragraphs"
ON public.project_paragraphs
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update project_paragraphs"
ON public.project_paragraphs
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete project_paragraphs"
ON public.project_paragraphs
FOR DELETE
USING (public.is_admin());