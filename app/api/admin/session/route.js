import { adminConfigurado, sesionValida } from '../../../../lib/admin-auth';
import { json } from '../../../../lib/respuestas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  return json({ configurado: adminConfigurado(), autenticado: sesionValida(request) });
}
