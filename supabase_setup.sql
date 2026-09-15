-- ==========================================================================
-- SQL para criar a tabela e função do Contador Global no Supabase
-- Copie e cole este código no SQL Editor do seu Supabase Dashboard
-- ==========================================================================

-- 1. Criar tabela de visualizações de páginas se não existir
CREATE TABLE IF NOT EXISTS public.page_views (
    id TEXT PRIMARY KEY,
    count BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar acesso público de leitura para a tabela (Row Level Security)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública do contador
CREATE POLICY "Permitir leitura pública" ON public.page_views
    FOR SELECT USING (true);

-- Política para permitir atualização anônima via RPC
CREATE POLICY "Permitir inserção e atualização pública" ON public.page_views
    FOR ALL USING (true);

-- 2. Inserir registro inicial para a landing page do Santinho Virtual
INSERT INTO public.page_views (id, count)
VALUES ('santinho_landingpage', 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar função RPC para incrementar a contagem de forma segura e atômica
CREATE OR REPLACE FUNCTION public.increment_page_view(page_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count BIGINT;
BEGIN
    INSERT INTO public.page_views (id, count)
    VALUES (page_id, 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        count = page_views.count + 1,
        updated_at = timezone('utc'::text, now())
    RETURNING count INTO new_count;
    
    RETURN new_count;
END;
$$;
