# Libro de visitas — Vercel + Supabase

Página simple para que tus visitantes dejen comentarios visibles para todos.

## ¿Qué incluye?

- Formulario de nombre y mensaje (máximo 350 caracteres).
- Comentarios compartidos, guardados permanentemente en Supabase.
- Los 50 mensajes más recientes, con fecha en horario argentino.
- Diseño adaptable a celular, tablet y computadora.
- Clave privada de la base de datos solo en el servidor.
- Un campo trampa básico contra robots (no reemplaza un CAPTCHA).

## Paso 1: crear la base de datos

1. Entrá a https://supabase.com, registrate y elegí **New project**.
2. Creá el proyecto (podés ponerle `libro-de-visitas`).
3. En tu proyecto, entrá a **SQL Editor** > **New query**.
4. Abrí el archivo `database.sql`, copiá todo, pegalo en el editor y elegí **Run**.
5. En **Settings > API Keys**, copiá tu **secret key** (empieza por `sb_secret_`). En **Integrations > Data API** (o en Connect) encontrá la **Project URL**, que se parece a `https://xxxx.supabase.co`.

**IMPORTANTE:** la clave `sb_secret_` es privada. Nunca la pegues en GitHub, en un archivo público o en el navegador.

## Paso 2: probar en tu computadora (opcional)

Necesitás Node.js 20.9 o superior.

1. Abrí esta carpeta con Visual Studio Code.
2. Duplicá `.env.example` y renombralo `.env.local`.
3. En `.env.local`, reemplazá los datos con tu URL y tu `sb_secret_`.
4. En la terminal, ejecutá:

```bash
npm install
npm run dev
```

5. Abrí http://localhost:3000

## Paso 3: publicarla en Vercel

1. Creá un repositorio en GitHub y subí el contenido de esta carpeta (no subas `.env.local`).
2. Entrá a https://vercel.com/new y elegí **Import Git Repository**.
3. Seleccioná tu repositorio. Vercel debería detectar Next.js automáticamente.
4. En **Environment Variables**, agregá:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_SECRET_KEY` = `sb_secret_...`
5. Elegí **Deploy**. Vercel te va a dar una dirección `https://tu-proyecto.vercel.app`.

Si agregás o cambiás variables después de publicar, hacé un **Redeploy**: solo se aplican a nuevos despliegues.

## ¿Cómo borrar un comentario?

Supabase > Table Editor > tabla `visitas`, elegí la fila y eliminála. No hay panel de administración dentro de esta versión de la página.

## Límites de la versión inicial

- Cualquier persona puede dejar un mensaje sin cuenta.
- El formulario tiene validación y un filtro antirrobot básico, pero **no incluye limitación de frecuencia real ni moderación automática**. Antes de difundir masivamente la página, sumá Cloudflare Turnstile, límites por IP o revisión de comentarios.
- La lista muestra los 50 comentarios más recientes; los anteriores siguen guardados en Supabase.
- El sitio necesita conexión a Supabase para publicar y mostrar mensajes.

## Estructura

```
app/
  api/mensajes/route.js  # API segura que consulta Supabase
  globals.css            # Diseño
  layout.js              # Metadatos de la página
  page.jsx               # Formulario y comentarios
.env.example             # Ejemplo de las variables
.gitignore               # Evita subir claves por error
database.sql             # Crea la tabla
package.json             # Dependencias
```
