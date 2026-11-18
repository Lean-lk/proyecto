-- Ejecutá UNA VEZ en Supabase > SQL Editor para actualizar tu tabla existente.
-- No elimina comentarios ni cambia los mensajes actuales.
ALTER TABLE public.visitas
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

-- El panel necesita leer, ocultar/mostrar y borrar comentarios.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visitas TO service_role;

-- Mantener el acceso directo cerrado a los visitantes.
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visitas FROM anon, authenticated;

-- Actualizar caché de esquema de la API de Supabase.
NOTIFY pgrst, 'reload schema';
