CREATE POLICY "Allow all delete"
ON public.registros_chaves
FOR DELETE
USING (true);