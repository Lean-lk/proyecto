// Solo importar este módulo desde rutas del servidor.
function configuracion() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) return null;
  return { url, key };
}

export async function consultarVisitas(query, metodo = 'GET', datos, prefer) {
  const config = configuracion();
  if (!config) {
    return { error: 'Falta conectar la base de datos. Revisá las variables de entorno.', status: 503 };
  }

  try {
    const respuesta = await fetch(`${config.url}/rest/v1/visitas${query}`, {
      method: metodo,
      headers: {
        apikey: config.key,
        'Content-Type': 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
      },
      ...(datos !== undefined ? { body: JSON.stringify(datos) } : {}),
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      // No revelar al navegador los detalles internos ni las credenciales.
      console.error('Error al consultar Supabase:', respuesta.status);
      return { error: 'No se pudo conectar con la base de datos.', status: 502 };
    }

    const contenido = await respuesta.text();
    return {
      data: contenido ? JSON.parse(contenido) : null,
      contentRange: respuesta.headers.get('content-range'),
    };
  } catch (error) {
    console.error('Fallo de conexión a Supabase:', error?.name || 'Error');
    return { error: 'No se pudo contactar a la base de datos.', status: 502 };
  }
}
