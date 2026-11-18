# Libro de visitas — ahora con panel de administración

Esta versión **actualiza el proyecto anterior** de Next.js + Vercel + Supabase.
Conserva la página de visitas y agrega un panel privado en `/admin`.

## Funciones nuevas

- Acceso al panel con contraseña.
- Sesión firmada con cookie `HttpOnly`, `Secure` en producción y `SameSite=Strict`.
- Ver hasta los 200 comentarios más recientes, buscar y filtrar.
- Ocultar comentarios sin borrarlos (dejan de aparecer en la página pública).
- Volver a mostrar comentarios ocultos.
- Eliminar comentarios de forma definitiva con confirmación.
- Contador total de comentarios y resumen de los últimos 200.
- Cerrar sesión.
- No requiere instalar paquetes nuevos ni crear cuentas de usuario en Supabase.

## ACTUALIZAR TU PÁGINA ACTUAL (sin perder comentarios)

### 1. Actualizar la tabla de Supabase

1. Abrí tu proyecto en https://supabase.com/dashboard.
2. Entrá a **SQL Editor > New query**.
3. Abrí el archivo `actualizar-supabase-admin.sql` de este ZIP.
4. Copiá todo el SQL y ejecutalo con **Run**.
5. Debe decir `Success`. **No borres la tabla `visitas`**.

Esto agrega la columna `visible` y los permisos de moderación al rol `service_role`.
Todos los mensajes existentes seguirán guardados y visibles.

### 2. Reemplazar el código en GitHub

Descomprimí el ZIP. Tenés que subir **todo el contenido de la carpeta**
`libro-de-visitas-vercel` al **mismo repositorio** de GitHub que ya usa Vercel.
El ZIP no se sube directamente: son los archivos descomprimidos.

Forma recomendada para actualizar muchos archivos: **GitHub Desktop**
(https://desktop.github.com/):

1. Instalá GitHub Desktop e iniciá sesión con tu cuenta de GitHub.
2. **File > Clone repository**, seleccioná tu repositorio `libro-de-visitas`.
3. Abrí la carpeta local del repositorio desde GitHub Desktop.
4. Copiá dentro los archivos y carpetas de esta nueva versión; aceptá reemplazar los existentes.
5. Volvé a GitHub Desktop, escribí `Agregar panel de administración` como resumen.
6. Elegí **Commit to main** y luego **Push origin**.

GitHub Desktop enviará los cambios a GitHub y Vercel iniciará un nuevo despliegue.

### 3. Agregar dos variables nuevas en Vercel

Entrá a https://vercel.com/dashboard > tu proyecto > **Settings > Environment Variables**.
**Conservá** `SUPABASE_URL` y `SUPABASE_SECRET_KEY`, que ya te funcionan.

Agregá estas dos variables **privadas**, en el entorno **Production**:

- `ADMIN_PASSWORD`: elegí una contraseña **única, aleatoria y larga** (16 caracteres como mínimo; recomendado 24+).
- `ADMIN_SESSION_SECRET`: un secreto **diferente de la contraseña**, aleatorio, de al menos 32 caracteres.

Para generar el secreto en una terminal con Node.js instalado:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

También podés generar un secreto aleatorio de 64 caracteres con un gestor de contraseñas.
**No pegues estos valores en GitHub ni los compartas por chat.**

### 4. Hacer Redeploy

En Vercel > **Deployments** > desplegable del despliegue de producción > **Redeploy**.
Es necesario hacerlo si agregaste las variables después del despliegue.

### 5. Entrar al panel

Abrí `https://TU-SITIO.vercel.app/admin`.
Ingresá la contraseña que guardaste en `ADMIN_PASSWORD`.
Podés acceder también desde el enlace **Administrar** al pie de la página.

## Instalación desde cero

1. Ejecutá `database.sql` en Supabase > SQL Editor.
2. Creá un repositorio GitHub con todos los archivos de esta carpeta.
3. Importalo en Vercel como proyecto Next.js.
4. Configurá las cuatro variables de `.env.example`.
5. Hacé Deploy y visitá `/admin`.

## Desarrollo local

Necesitás Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local
# Editá .env.local con tus valores reales
npm run dev
```

Abrí http://localhost:3000 y http://localhost:3000/admin.

## Seguridad y límites

- Las claves de Supabase y la contraseña de administrador se usan **solo en el servidor**.
- Las acciones de administración requieren una sesión firmada y comprueban el origen.
- La cookie de sesión dura hasta 12 horas. Para invalidar todas las sesiones,
  cambiá `ADMIN_SESSION_SECRET` y hacé Redeploy.
- Elegí una contraseña aleatoria larga: **esta versión no incluye protección distribuida
  contra intentos repetidos de inicio de sesión**. Para una página con mucho tráfico,
  añadí limitación de intentos o protección en el borde (por ejemplo, WAF/Turnstile).
- Los visitantes pueden publicar sin cuenta; el campo trampa antispam es básico.
- El panel lista **los 200 comentarios más recientes**. La búsqueda y los filtros
  funcionan sobre esos 200; el contador total refleja todos los registros.
- La eliminación es irreversible. Ocultar es reversible.
- La página pública muestra los 50 mensajes visibles más recientes.
- Supabase debe permanecer activo y accesible para que funcione el sitio.
- El uso de Vercel Hobby está sujeto a sus condiciones, incluida la restricción de uso comercial.

## Archivos principales

```text
app/
  page.jsx                       Página pública
  admin/page.jsx                 Panel de administración
  admin/layout.js                Metadatos noindex
  api/mensajes/route.js          Lectura y publicación pública
  api/admin/session/route.js     Estado de sesión
  api/admin/login/route.js       Ingreso con contraseña
  api/admin/logout/route.js      Cerrar sesión
  api/admin/mensajes/route.js    Moderación: listar, ocultar, mostrar, eliminar
  globals.css                    Estilos
lib/
  admin-auth.js                  Autenticación y cookies firmadas
  supabase.js                    Acceso privado a Supabase
  respuestas.js                  Respuestas y validación
actualizar-supabase-admin.sql    Migración de la base actual
database.sql                    Instalación inicial
.env.example                    Ejemplo de variables
```
