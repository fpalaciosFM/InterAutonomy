ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paragraph_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Política para la tabla 'projects'
CREATE POLICY "Lectura pública para todos" 
ON public.projects 
FOR SELECT 
USING (true);

-- Política para la tabla 'strategies'
CREATE POLICY "Lectura pública para todos" 
ON public.strategies 
FOR SELECT 
USING (true);

-- Política para la tabla 'paragraph_strategies'
CREATE POLICY "Lectura pública para todos" 
ON public.paragraph_strategies 
FOR SELECT 
USING (true);

-- Política para la tabla 'project_paragraphs'
CREATE POLICY "Lectura pública para todos" 
ON public.project_paragraphs 
FOR SELECT 
USING (true);