-- Storage setup for portal assets
-- Creates a public-read bucket and locks writes to admins only.

-- 1) Create bucket (id/name must match)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-assets', 'portal-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2) RLS on storage.objects
-- Note: In Supabase, `storage.objects` is managed by the platform and you may not
-- be the table owner in the SQL editor role. If you get:
--   ERROR: must be owner of table objects
-- that's OK — RLS is typically already enabled for Storage.
-- You can verify with:
--   SELECT relrowsecurity FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'storage' AND c.relname = 'objects';
DO $$
DECLARE
	rls_enabled boolean;
BEGIN
	SELECT c.relrowsecurity
		INTO rls_enabled
	FROM pg_class c
	JOIN pg_namespace n ON n.oid = c.relnamespace
	WHERE n.nspname = 'storage' AND c.relname = 'objects';

	IF rls_enabled IS DISTINCT FROM true THEN
		RAISE NOTICE 'RLS for storage.objects is not enabled. Policies below will not be enforced until RLS is enabled by the table owner (Supabase-managed).';
	END IF;
END $$;

-- 3) Policies
DROP POLICY IF EXISTS "Public read portal-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert portal-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update portal-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete portal-assets" ON storage.objects;

-- Public read for website
CREATE POLICY "Public read portal-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portal-assets');

-- Admin-only writes
CREATE POLICY "Admin insert portal-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'portal-assets' AND public.is_admin());

CREATE POLICY "Admin update portal-assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'portal-assets' AND public.is_admin())
WITH CHECK (bucket_id = 'portal-assets' AND public.is_admin());

CREATE POLICY "Admin delete portal-assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'portal-assets' AND public.is_admin());
