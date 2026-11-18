-- Instalación inicial del libro de visitas con panel de administración.
-- Ejecutá en Supabase > SQL Editor. También es seguro si la tabla ya existe.
CREATE TABLE IF NOT EXISTS public.visitas (
  id bigint generated always as identity primary key,
  nombre varchar(40) not null check (char_length(btrim(nombre)) between 1 and 40),
  mensaje varchar(350) not null check (char_length(btrim(mensaje)) between 1 and 350),
  creado_en timestamptz not null default now(),
  visible boolean not null default true
);

-- Para bases de datos creadas con la primera versión.
ALTER TABLE public.visitas
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS visitas_recientes_idx
  ON public.visitas (creado_en DESC);

-- Los visitantes no acceden directamente a la tabla.
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visitas FROM anon, authenticated;

-- Solo la API del servidor (con clave secreta) administra los registros.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visitas TO service_role;

-- Actualizar caché de esquema de la API de Supabase.
NOTIFY pgrst, 'reload schema';
