import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'lv_admin_session';
const DURACION_SEGUNDOS = 12 * 60 * 60;

export function adminConfigurado() {
  const clave = process.env.ADMIN_PASSWORD || '';
  const secreto = process.env.ADMIN_SESSION_SECRET || '';
  return clave.length >= 16 && secreto.length >= 32;
}

function comparacionConstante(a, b) {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function claveCorrecta(clave) {
  return adminConfigurado() && typeof clave === 'string' &&
    comparacionConstante(clave, process.env.ADMIN_PASSWORD);
}

function firma(contenido) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET)
    .update(contenido).digest('base64url');
}

export function crearSesion() {
  const vence = Math.floor(Date.now() / 1000) + DURACION_SEGUNDOS;
  const contenido = `v1.${vence}`;
  return `${contenido}.${firma(contenido)}`;
}

export function sesionValida(request) {
  if (!adminConfigurado()) return false;
  const token = request.cookies.get(ADMIN_COOKIE)?.value || '';
  const partes = /^v1\.(\d{10,12})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!partes) return false;
  const vence = Number(partes[1]);
  if (!Number.isSafeInteger(vence) || vence <= Math.floor(Date.now() / 1000)) return false;
  return comparacionConstante(partes[2], firma(`v1.${partes[1]}`));
}

// Bloquea acciones originadas desde sitios ajenos (protección CSRF).
export function mismoOrigen(request) {
  const origen = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origen || !host) return false;
  try {
    const url = new URL(origen);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.host === host;
  } catch {
    return false;
  }
}

export function opcionesCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: DURACION_SEGUNDOS,
  };
}
