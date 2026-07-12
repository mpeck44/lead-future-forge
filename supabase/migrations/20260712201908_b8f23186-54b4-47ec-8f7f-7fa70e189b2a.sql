ALTER TABLE public.orders ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS bundle_key text;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_course_or_bundle;
ALTER TABLE public.orders ADD CONSTRAINT orders_course_or_bundle
  CHECK (course_id IS NOT NULL OR bundle_key IS NOT NULL);