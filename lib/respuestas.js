import { NextResponse } from 'next/server';

export function json(datos, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function leerJson(request, maximo = 2500) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return { error: 'El formato enviado no es válido.', status: 415 };
  }
  try {
    const texto = await request.text();
    if (texto.length > maximo) return { error: 'La solicitud es demasiado larga.', status: 413 };
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      return { error: 'Los datos enviados no son válidos.', status: 400 };
    }
    return { datos };
  } catch {
    return { error: 'Los datos enviados no son válidos.', status: 400 };
  }
}
