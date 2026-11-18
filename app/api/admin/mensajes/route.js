import { sesionValida, mismoOrigen } from '../../../../lib/admin-auth';
import { consultarVisitas } from '../../../../lib/supabase';
import { json, leerJson } from '../../../../lib/respuestas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sinAcceso(request) {
  return !sesionValida(request);
}

function idValido(id) {
  return Number.isSafeInteger(id) && id > 0;
}

export async function GET(request) {
  if (sinAcceso(request)) return json({ error: 'Iniciá sesión para continuar.' }, 401);
  const resultado = await consultarVisitas(
    '?select=id,nombre,mensaje,creado_en,visible&order=creado_en.desc&limit=200',
    'GET', undefined, 'count=exact'
  );
  if (resultado.error) return json({ error: resultado.error }, resultado.status);
  const total = Number(resultado.contentRange?.split('/')[1]);
  return json({ mensajes: resultado.data, total: Number.isFinite(total) ? total : resultado.data.length });
}

export async function PATCH(request) {
  if (sinAcceso(request)) return json({ error: 'Iniciá sesión para continuar.' }, 401);
  if (!mismoOrigen(request)) return json({ error: 'Solicitud no permitida.' }, 403);
  const lectura = await leerJson(request, 300);
  if (lectura.error) return json({ error: lectura.error }, lectura.status);
  const { id, visible } = lectura.datos;
  if (!idValido(id) || typeof visible !== 'boolean') {
    return json({ error: 'Datos de moderación inválidos.' }, 400);
  }
  const resultado = await consultarVisitas(`?id=eq.${id}&select=id,visible`, 'PATCH',
    { visible }, 'return=representation');
  if (resultado.error) return json({ error: resultado.error }, resultado.status);
  if (!resultado.data?.length) return json({ error: 'No se encontró el comentario.' }, 404);
  return json({ ok: true, mensaje: resultado.data[0] });
}

export async function DELETE(request) {
  if (sinAcceso(request)) return json({ error: 'Iniciá sesión para continuar.' }, 401);
  if (!mismoOrigen(request)) return json({ error: 'Solicitud no permitida.' }, 403);
  const lectura = await leerJson(request, 300);
  if (lectura.error) return json({ error: lectura.error }, lectura.status);
  const { id } = lectura.datos;
  if (!idValido(id)) return json({ error: 'Comentario inválido.' }, 400);
  const resultado = await consultarVisitas(`?id=eq.${id}&select=id`, 'DELETE',
    undefined, 'return=representation');
  if (resultado.error) return json({ error: resultado.error }, resultado.status);
  if (!resultado.data?.length) return json({ error: 'No se encontró el comentario.' }, 404);
  return json({ ok: true });
}
