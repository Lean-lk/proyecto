import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cabeceras = { 'Cache-Control': 'no-store' };

function responder(datos, status = 200) {
  return NextResponse.json(datos, { status, headers: cabeceras });
}

function configuracion() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
    return null;
  }
  return { url, key };
}

async function consultarSupabase(opcion, metodo = 'GET', datos) {
  const config = configuracion();
  if (!config) {
    return { error: 'Falta conectar la base de datos. Revisá las variables de entorno.', status: 503 };
  }

  try {
    const respuesta = await fetch(`${config.url}/rest/v1/visitas${opcion}`, {
      method: metodo,
      headers: {
        apikey: config.key,
        'Content-Type': 'application/json',
        ...(metodo === 'POST' ? { Prefer: 'return=representation' } : {}),
      },
      ...(datos ? { body: JSON.stringify(datos) } : {}),
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      // Nunca enviamos al navegador los errores internos de Supabase ni la clave.
      console.error('Error al consultar Supabase:', respuesta.status);
      return { error: 'No se pudo conectar con la base de datos.', status: 502 };
    }

    return { data: await respuesta.json() };
  } catch {
    return { error: 'No se pudo contactar a la base de datos.', status: 502 };
  }
}

export async function GET() {
  const resultado = await consultarSupabase('?select=id,nombre,mensaje,creado_en&order=creado_en.desc&limit=50');
  if (resultado.error) return responder({ error: resultado.error }, resultado.status);
  return responder({ mensajes: resultado.data });
}

export async function POST(request) {
  const tipo = request.headers.get('content-type') || '';
  if (!tipo.includes('application/json')) {
    return responder({ error: 'El formato enviado no es válido.' }, 415);
  }

  const tamano = Number(request.headers.get('content-length') || 0);
  if (tamano > 2500) {
    return responder({ error: 'El mensaje es demasiado largo.' }, 413);
  }

  let datos;
  try {
    datos = await request.json();
  } catch {
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  // Campo oculto antispam: los visitantes normales lo dejan vacío.
  if (datos.sitio_web) {
    return responder({ ok: true });
  }

  if (typeof datos.nombre !== 'string' || typeof datos.mensaje !== 'string') {
    return responder({ error: 'Completá el nombre y el mensaje.' }, 400);
  }

  const nombre = datos.nombre.trim();
  const mensaje = datos.mensaje.trim();

  if (nombre.length < 1 || nombre.length > 40) {
    return responder({ error: 'El nombre debe tener entre 1 y 40 caracteres.' }, 400);
  }
  if (mensaje.length < 1 || mensaje.length > 350) {
    return responder({ error: 'El mensaje debe tener entre 1 y 350 caracteres.' }, 400);
  }

  const resultado = await consultarSupabase('?select=id,nombre,mensaje,creado_en', 'POST', {
    nombre,
    mensaje,
  });

  if (resultado.error) return responder({ error: resultado.error }, resultado.status);
  return responder({ ok: true, mensaje: resultado.data?.[0] ?? null }, 201);
}
