import { ADMIN_COOKIE, mismoOrigen, opcionesCookie } from '../../../../lib/admin-auth';
import { json } from '../../../../lib/respuestas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!mismoOrigen(request)) return json({ error: 'Solicitud no permitida.' }, 403);
  const respuesta = json({ ok: true });
  respuesta.cookies.set(ADMIN_COOKIE, '', { ...opcionesCookie(), maxAge: 0 });
  return respuesta;
}
