import { consultarVisitas } from '../../../lib/supabase';
import { json, leerJson } from '../../../lib/respuestas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const resultado = await consultarVisitas('?select=id,nombre,mensaje,creado_en&visible=eq.true&order=creado_en.desc&limit=50');
  if (resultado.error) return json({ error: resultado.error }, resultado.status);
  return json({ mensajes: resultado.data });
}

export async function POST(request) {
  const lectura = await leerJson(request);
  if (lectura.error) return json({ error: lectura.error }, lectura.status);
  const datos = lectura.datos;

  // Campo trampa antispam: un visitante real no lo completa.
  if (datos.sitio_web) return json({ ok: true });

  if (typeof datos.nombre !== 'string' || typeof datos.mensaje !== 'string') {
    return json({ error: 'Completá el nombre y el mensaje.' }, 400);
  }
  const nombre = datos.nombre.trim();
  const mensaje = datos.mensaje.trim();
  if (nombre.length < 1 || nombre.length > 40) {
    return json({ error: 'El nombre debe tener entre 1 y 40 caracteres.' }, 400);
  }
  if (mensaje.length < 1 || mensaje.length > 350) {
    return json({ error: 'El mensaje debe tener entre 1 y 350 caracteres.' }, 400);
  }

  const resultado = await consultarVisitas('?select=id,nombre,mensaje,creado_en', 'POST',
    { nombre, mensaje }, 'return=representation');
  if (resultado.error) return json({ error: resultado.error }, resultado.status);
  return json({ ok: true, mensaje: resultado.data?.[0] ?? null }, 201);
}
