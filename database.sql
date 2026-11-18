-- Pegá este código en Supabase > SQL Editor > New query y presioná Run.
-- Los mensajes se guardan en la base de datos, NO en los archivos de Vercel.
create table if not exists public.visitas (
  id bigint generated always as identity primary key,
  nombre varchar(40) not null check (char_length(btrim(nombre)) between 1 and 40),
  mensaje varchar(350) not null check (char_length(btrim(mensaje)) between 1 and 350),
  creado_en timestamptz not null default now()
);

create index if not exists visitas_recientes_idx
  on public.visitas (creado_en desc);

-- Protege la tabla: solo el servidor, con la clave secreta, accede a sus filas.
alter table public.visitas enable row level security;
revoke all on public.visitas from anon, authenticated;
-- Sin políticas públicas: los visitantes deben usar /api/mensajes del sitio.
