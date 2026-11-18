'use client';

import { useCallback, useEffect, useState } from 'react';

const MAX = 350;

function fechaLegible(fecha) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date(fecha));
  } catch {
    return '';
  }
}

function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

function avatarColor(nombre) {
  const colores = ['#f7d6cb', '#d8d9f8', '#cfe9dc', '#f8e0ab', '#cfe3f3', '#f0d7e8'];
  let valor = 0;
  for (const letra of nombre) valor = (valor * 31 + letra.charCodeAt(0)) >>> 0;
  return colores[valor % colores.length];
}

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch('/api/mensajes', { cache: 'no-store' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudieron cargar los comentarios.');
      setMensajes(datos.mensajes);
      setError('');
    } catch (err) {
      setError(err.message || 'Ocurrió un error.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarMensajes(); }, [cargarMensajes]);

  async function publicar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setAviso('');
    setError('');
    setEnviando(true);

    try {
      const respuesta = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, mensaje, sitio_web: sitioWeb }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo publicar.');
      if (datos.mensaje) setMensajes((actuales) => [datos.mensaje, ...actuales].slice(0, 50));
      setNombre('');
      setMensaje('');
      setSitioWeb('');
      setAviso('¡Listo! Tu mensaje quedó guardado.');
    } catch (err) {
      setError(err.message || 'No se pudo publicar. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="sitio">
      <div className="decoracion decoracion-uno" aria-hidden="true" />
      <div className="decoracion decoracion-dos" aria-hidden="true" />
      <header className="cabecera contenido">
        <a className="marca" href="/" aria-label="Inicio del libro de visitas">
          <span className="marca-icono" aria-hidden="true">✳</span>
          <span>libro de visitas<span className="punto">.</span></span>
        </a>
        <span className="etiqueta-superior">UN RINCÓN PARA COMPARTIR</span>
      </header>

      <main className="contenido">
        <section className="hero">
          <div className="subtitulo"><span className="subtitulo-punto" /> HOLA, QUÉ BUENO VERTE POR ACÁ</div>
          <h1>Dejá tu <em>huella</em><span className="punto">.</span></h1>
          <p>Los buenos recuerdos se construyen con pequeñas palabras. Dejá un saludo, un pensamiento o simplemente contanos que pasaste por acá.</p>
          <div className="microdetalle"><span aria-hidden="true">✦</span> Cada mensaje hace este lugar un poquito más especial.</div>
        </section>

        <div className="columnas">
          <section className="tarjeta formulario-tarjeta" aria-labelledby="titulo-formulario">
            <div className="tarjeta-encabezado">
              <span className="mini-icono" aria-hidden="true">✎</span>
              <div>
                <h2 id="titulo-formulario">Dejanos unas palabras</h2>
                <p>No necesitás crear una cuenta.</p>
              </div>
            </div>

            <form onSubmit={publicar}>
              <label htmlFor="nombre">Tu nombre</label>
              <input
                id="nombre"
                placeholder="¿Cómo te llamás?"
                type="text"
                maxLength={40}
                autoComplete="name"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <label htmlFor="mensaje">Tu mensaje</label>
              <textarea
                id="mensaje"
                placeholder="Escribí lo que quieras compartir..."
                rows={6}
                maxLength={MAX}
                required
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
              <div className="contador">{mensaje.length} / {MAX} caracteres</div>

              <div className="campo-trampa" aria-hidden="true">
                <label htmlFor="sitioWeb">Sitio web (dejar vacío)</label>
                <input id="sitioWeb" type="text" tabIndex={-1} autoComplete="off" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
              </div>

              <button className="boton-enviar" type="submit" disabled={enviando}>
                <span>{enviando ? 'Publicando...' : 'Publicar mensaje'}</span>
                <span aria-hidden="true">↗</span>
              </button>
              {aviso && <p role="status" className="mensaje-estado exito">{aviso}</p>}
              {error && <p role="alert" className="mensaje-estado error">{error}</p>}
              <p className="nota">Tu nombre y mensaje serán visibles públicamente.</p>
            </form>
          </section>

          <section className="mensajes-seccion" aria-labelledby="titulo-mensajes">
            <div className="mensajes-header">
              <div>
                <div className="pequeno-titulo">VOCES QUE PASARON POR ACÁ</div>
                <h2 id="titulo-mensajes">El mural de mensajes <span className="contador-mensajes">{mensajes.length}{mensajes.length === 50 ? '+' : ''}</span></h2>
              </div>
              <button className="boton-actualizar" type="button" onClick={cargarMensajes} disabled={cargando} aria-label="Actualizar mensajes" title="Actualizar mensajes">↻</button>
            </div>
            {cargando && mensajes.length === 0 ? (
              <div className="vacio">Cargando mensajes…</div>
            ) : mensajes.length === 0 ? (
              <div className="vacio">
                <div className="vacio-emoji" aria-hidden="true">✉</div>
                <h3>Todavía está todo por escribir.</h3>
                <p>¡Podés ser la primera persona en dejar un mensaje!</p>
              </div>
            ) : (
              <div className="lista-mensajes">
                {mensajes.map((item) => (
                  <article className="comentario" key={item.id}>
                    <div className="comentario-fila">
                      <div className="avatar" style={{ backgroundColor: avatarColor(item.nombre) }} aria-hidden="true">{iniciales(item.nombre)}</div>
                      <div className="comentario-nombre-fecha">
                        <h3>{item.nombre}</h3>
                        <time dateTime={item.creado_en}>{fechaLegible(item.creado_en)}</time>
                      </div>
                      <div className="comentario-adorno" aria-hidden="true">❝</div>
                    </div>
                    <p className="comentario-texto">{item.mensaje}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <footer className="pie contenido">
        <span>Hecho con cariño <span aria-hidden="true">♡</span></span>
        <span>Un espacio para compartir buenas palabras.</span>
      </footer>
    </div>
  );
}
