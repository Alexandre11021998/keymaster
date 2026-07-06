
-- Tighten registros_chaves RLS to require authentication
DROP POLICY "Allow all delete" ON public.registros_chaves;
DROP POLICY "Allow all insert" ON public.registros_chaves;
DROP POLICY "Allow all read" ON public.registros_chaves;
DROP POLICY "Allow all update" ON public.registros_chaves;

CREATE POLICY "Authenticated read" ON public.registros_chaves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON public.registros_chaves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.registros_chaves FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.registros_chaves FOR DELETE TO authenticated USING (true);
