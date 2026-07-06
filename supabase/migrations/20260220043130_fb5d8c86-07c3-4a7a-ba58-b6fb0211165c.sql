
-- Tabela principal de registros de chaves
CREATE TABLE public.registros_chaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_chave TEXT NOT NULL,
  funcionario_retirou TEXT NOT NULL,
  setor TEXT NOT NULL,
  responsavel_entrega TEXT NOT NULL,
  data_retirada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_devolucao TIMESTAMP WITH TIME ZONE,
  responsavel_recebimento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS habilitado mas permissivo (sistema interno hospitalar sem auth)
ALTER TABLE public.registros_chaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON public.registros_chaves FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.registros_chaves FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.registros_chaves FOR UPDATE USING (true);

-- Index para queries de pendentes
CREATE INDEX idx_registros_pendentes ON public.registros_chaves (numero_chave) WHERE data_devolucao IS NULL;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.registros_chaves;
