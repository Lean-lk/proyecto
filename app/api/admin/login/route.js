import { ADMIN_COOKIE, adminConfigurado, claveCorrecta, crearSesion, mismoOrigen, opcionesCookie } from '../../../../lib/admin-auth';
import { json, leerJson } from '../../../../lib/respuestas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!mismoOrigen(request)) return json({ error: 'Solicitud no permitida.' }, 403);
  if (!adminConfigurado()) {
    return json({ error: 'Configurá ADMIN_PASSWORD y ADMIN_SESSION_SECRET en Vercel.' }, 503);
  }
  const lectura = await leerJson(request, 1000);
  if (lectura.error) return json({ error: lectura.error }, lectura.status);
  if (!claveCorrecta(lectura.datos.clave)) {
    return json({ error: 'Contraseña incorrecta.' }, 401);
  }
  const respuesta = json({ ok: true });
  respuesta.cookies.set(ADMIN_COOKIE, crearSesion(), opcionesCookie());
  return respuesta;
}
