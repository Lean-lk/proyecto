'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function fechaLegible(fecha) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date(fecha));
  } catch { return ''; }
}

async function leerRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || 'Ocurrió un error.');
  return datos;
}

export default function Administracion() {
  const [estado, setEstado] = useState('cargando'); // cargando, configurar, acceso, panel
  const [clave, setClave] = useState('');
  const [ingresando, setIngresando] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await leerRespuesta(await fetch('/api/admin/mensajes', { cache: 'no-store' }));
      setMensajes(datos.mensajes || []);
      setTotal(datos.total || 0);
    } catch (err) {
      if (err.message.includes('Iniciá sesión')) setEstado('acceso');
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    async function iniciar() {
      try {
        const datos = await leerRespuesta(await fetch('/api/admin/session', { cache: 'no-store' }));
        if (!activo) return;
        if (!datos.configurado) setEstado('configurar');
        else if (datos.autenticado) setEstado('panel');
        else setEstado('acceso');
      } catch {
        if (activo) { setEstado('acceso'); setError('No se pudo verificar la sesión.'); }
      }
    }
    iniciar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (estado === 'panel') cargarMensajes();
  }, [estado, cargarMensajes]);

  async function entrar(evento) {
    evento.preventDefault();
    if (ingresando) return;
    setIngresando(true);
    setError('');
    try {
      await leerRespuesta(await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave }),
      }));
      setClave('');
      setEstado('panel');
    } catch (err) {
      setError(err.message);
    } finally { setIngresando(false); }
  }

  async function salir() {
    try {
      await leerRespuesta(await fetch('/api/admin/logout', { method: 'POST' }));
      setEstado('acceso');
      setMensajes([]);
      setClave('');
      setAviso('');
      setError('');
    } catch (err) { setError(err.message); }
  }

  async function cambiarVisibilidad(item) {
    if (procesando !== null) return;
    setProcesando(item.id);
    setError(''); setAviso('');
    try {
      await leerRespuesta(await fetch('/api/admin/mensajes', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, visible: !item.visible }),
      }));
      setMensajes((actuales) => actuales.map((m) =>
        m.id === item.id ? { ...m, visible: !item.visible } : m));
      setAviso(item.visible ? 'Comentario ocultado de la página pública.' : 'Comentario publicado nuevamente.');
    } catch (err) {
      if (err.message.includes('Iniciá sesión')) setEstado('acceso');
      setError(err.message);
    } finally { setProcesando(null); }
  }

  async function eliminar(item) {
    if (procesando !== null) return;
    if (!window.confirm(`¿Eliminar definitivamente el comentario de ${item.nombre}? Esta acción no se puede deshacer.`)) return;
    setProcesando(item.id);
    setError(''); setAviso('');
    try {
      await leerRespuesta(await fetch('/api/admin/mensajes', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      }));
      setMensajes((actuales) => actuales.filter((m) => m.id !== item.id));
      setTotal((actual) => Math.max(0, actual - 1));
      setAviso('Comentario eliminado definitivamente.');
    } catch (err) {
      if (err.message.includes('Iniciá sesión')) setEstado('acceso');
      setError(err.message);
    } finally { setProcesando(null); }
  }

  const visibles = mensajes.filter((m) => m.visible).length;
  const ocultos = mensajes.length - visibles;
  const filtrados = useMemo(() => mensajes.filter((m) => {
    const coincideEstado = filtro === 'todos' || (filtro === 'visibles' ? m.visible : !m.visible);
    const texto = `${m.nombre} ${m.mensaje}`.toLocaleLowerCase('es');
    return coincideEstado && texto.includes(busqueda.trim().toLocaleLowerCase('es'));
  }), [mensajes, filtro, busqueda]);

  return (
    <div className="admin-sitio">
      <header className="admin-cabecera contenido">
        <a className="marca" href="/"><span className="marca-icono">✳</span><span>libro de visitas<span className="punto">.</span></span></a>
        <a className="admin-volver" href="/">← Volver a la página</a>
      </header>

      {estado === 'cargando' && <main className="admin-acceso contenido"><div className="admin-login-card"><p>Verificando acceso…</p></div></main>}

      {estado === 'configurar' && (
        <main className="admin-acceso contenido">
          <div className="admin-login-card">
            <div className="admin-sello">ACCESO PRIVADO</div>
            <h1>Activá tu <em>panel.</em></h1>
            <p>Faltan las variables <code>ADMIN_PASSWORD</code> y <code>ADMIN_SESSION_SECRET</code> en Vercel. Agregalas y hacé Redeploy.</p>
            <p className="admin-ayuda">La contraseña debe tener al menos 16 caracteres y el secreto de sesión al menos 32.</p>
          </div>
        </main>
      )}

      {estado === 'acceso' && (
        <main className="admin-acceso contenido">
          <div className="admin-login-card">
            <div className="admin-sello">ACCESO PRIVADO</div>
            <h1>Panel de <em>administración.</em></h1>
            <p>Ingresá tu contraseña para administrar los comentarios del libro de visitas.</p>
            <form onSubmit={entrar}>
              <label htmlFor="admin-clave">Contraseña de administrador</label>
              <input id="admin-clave" type="password" autoComplete="current-password" minLength={1}
                placeholder="Ingresá tu contraseña" value={clave} onChange={(e) => setClave(e.target.value)} required />
              <button className="boton-enviar" disabled={ingresando} type="submit">
                <span>{ingresando ? 'Verificando…' : 'Ingresar al panel'}</span><span>→</span>
              </button>
            </form>
            {error && <p className="mensaje-estado error" role="alert">{error}</p>}
            <p className="admin-ayuda">Solo quien tenga la contraseña podrá moderar y eliminar comentarios.</p>
          </div>
        </main>
      )}

      {estado === 'panel' && (
        <main className="admin-panel contenido">
          <div className="admin-titulo-fila">
            <div>
              <div className="admin-sello">PANEL DE CONTROL</div>
              <h1>Administrar <em>mensajes.</em></h1>
              <p>Revisá, ocultá o eliminá los comentarios de tu página.</p>
            </div>
            <button className="admin-boton-salir" onClick={salir}>Cerrar sesión</button>
          </div>

          <div className="admin-metricas">
            <div className="admin-metrica"><span>Total guardados</span><strong>{total}</strong></div>
            <div className="admin-metrica"><span>Visibles (últimos 200)</span><strong>{visibles}</strong></div>
            <div className="admin-metrica"><span>Ocultos (últimos 200)</span><strong>{ocultos}</strong></div>
          </div>

          <section className="admin-tabla-tarjeta" aria-label="Moderación de comentarios">
            <div className="admin-tabla-encabezado">
              <div><h2>Comentarios</h2><p>Mostrando los últimos {mensajes.length} de {total} mensajes guardados.</p></div>
              <button className="admin-boton-secundario" disabled={cargando} onClick={cargarMensajes}>
                {cargando ? 'Actualizando…' : '↻ Actualizar'}
              </button>
            </div>
            <div className="admin-filtros">
              <input aria-label="Buscar comentarios" placeholder="Buscar por nombre o mensaje…"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <select aria-label="Filtrar comentarios" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="visibles">Visibles</option>
                <option value="ocultos">Ocultos</option>
              </select>
            </div>
            {error && <p className="admin-alerta error" role="alert">{error}</p>}
            {aviso && <p className="admin-alerta exito" role="status">{aviso}</p>}
            {cargando && mensajes.length === 0 ? (
              <div className="admin-sin-resultados">Cargando comentarios…</div>
            ) : filtrados.length === 0 ? (
              <div className="admin-sin-resultados">No se encontraron comentarios con esos filtros.</div>
            ) : (
              <div className="admin-lista">
                {filtrados.map((item) => (
                  <article className="admin-comentario" key={item.id}>
                    <div className="admin-comentario-contenido">
                      <div className="admin-comentario-meta">
                        <strong>{item.nombre}</strong>
                        <span>{fechaLegible(item.creado_en)}</span>
                        <span className={item.visible ? 'admin-estado visible' : 'admin-estado oculto'}>
                          {item.visible ? 'Visible' : 'Oculto'}
                        </span>
                      </div>
                      <p>{item.mensaje}</p>
                    </div>
                    <div className="admin-acciones">
                      <button className="admin-boton-secundario" disabled={procesando !== null}
                        onClick={() => cambiarVisibilidad(item)}>
                        {procesando === item.id ? 'Procesando…' : item.visible ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button className="admin-boton-peligro" disabled={procesando !== null}
                        onClick={() => eliminar(item)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <p className="admin-pie-nota">Los mensajes ocultos siguen guardados, pero no aparecen en la página pública. Eliminar es irreversible.</p>
        </main>
      )}
    </div>
  );
}
