# 06 · Despliegue y portabilidad

El build (`npm run build`) produce la carpeta `dist/`: HTML, CSS, JS y archivos
estáticos. **Cualquier hosting de archivos estáticos sirve.** No hay lock-in.

## Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `SITE_URL` | No (default `https://welcomestudentsgroup.com.au`) | Canonical, sitemap, OG, JSON-LD |
| `PUBLIC_FORM_ENDPOINT` | Recomendada | URL que recibe los formularios (POST JSON) |

Se definen en el panel del hosting (o en `.env` en local, ver `.env.example`).
**Cambiar una variable requiere un nuevo build.**

### Opciones para `PUBLIC_FORM_ENDPOINT`
- **Formspree** / **Web3Forms** / **Getform**: crear el formulario y pegar su URL.
- **Función serverless propia** (Netlify Functions, Cloudflare Workers, Vercel Functions)
  que envíe un email o cree el lead en el CRM (HubSpot, Zoho, Pipedrive…).
- El endpoint debe aceptar `POST` con `Content-Type: application/json`, responder 2xx si
  todo salió bien y permitir CORS desde el dominio del sitio.

## Hosting actual: Toolyx OS

El sitio se aloja en **Toolyx OS** (módulo *Web*), conectado a GitHub. Toolyx publica
archivos ya compilados (no ejecuta `npm run build`), así que el flujo es:

```
push a main ──► GitHub Actions (.github/workflows/deploy.yml)
                 npm ci → npm run verify → copia dist/ a la rama `deploy`
                        ──► webhook de GitHub ──► Toolyx publica una versión nueva
```

### Configuración inicial (una sola vez, desde el panel de Toolyx)
1. **Web → Constructor → Nueva web** (nombre: *Welcome Students Group*) → **Importar web → Desde GitHub**.
2. Dirección del repositorio, apuntando a la rama `deploy`:
   `https://github.com/WelcomeStudentsGroup/Web-welcome/tree/deploy`
   (el repo es público: no hace falta token).
3. **Conectar y traer**. Toolyx muestra una **URL de webhook** y un **Secret** (solo una vez).
4. En GitHub: *Settings → Webhooks → Add webhook* → pegar la URL en *Payload URL*,
   *Content type* `application/json`, pegar el *Secret*, evento *Just the push event* → *Add webhook*.
5. En Toolyx: **Vista previa** y, si todo está bien, un admin pulsa **Publicar**. Desde ese
   primer Publicar, cada push a `deploy` publica solo.
6. **Dominio propio:** *Diseño y ajustes → Dominio propio* → `www.welcomestudentsgroup.com.au` →
   crear el CNAME que indica la pantalla en el DNS → **Verificar DNS**. La raíz sin `www`:
   ALIAS/ANAME o redirección a `www`. Luego definir la variable `SITE_URL` (abajo) con el
   dominio final y volver a desplegar.

### Variables de build (GitHub)
*Settings → Secrets and variables → Actions → Variables*:

| Variable | Valor |
|---|---|
| `SITE_URL` | Dominio canónico final, ej. `https://www.welcomestudentsgroup.com.au` |
| `PUBLIC_FORM_ENDPOINT` | Endpoint de formularios (ver más abajo) |

Si no se definen, se usan los valores por defecto (`https://welcomestudentsgroup.com.au` y
formularios en modo "contacto directo").

### Particularidades de Toolyx
- **Versiones:** cada publicación queda en *Versiones* y se puede republicar en un clic (rollback).
- **Inyección automática:** al importar, Toolyx añade su píxel de atribución, livechat y botón de
  WhatsApp. La CSP ya permite `https://os.toolyx.com` en `script-src` y `connect-src`, como
  pide su documentación. **Revisar tras el primer publish** que no haya errores de CSP en la
  consola y que no aparezcan dos botones de WhatsApp (si es así, desactivar uno de los dos).
- **Cabeceras HTTP:** Toolyx no lee `public/_headers`; las cabeceras de seguridad dependen de
  su plataforma. La CSP principal sigue activa porque va en un `<meta>` dentro del HTML.
- **Carpetas ocultas:** Toolyx no publica carpetas que empiezan con punto, así que
  `/.well-known/security.txt` no estará disponible en ese hosting.
- **Límites de importación:** 200 archivos y 20 MB (el sitio usa ~45 archivos y < 1 MB).
- **Medición:** *Web → Inicio* (PageSpeed, SEO, checklist), *Estadísticas*, *Embudos* y
  *Campañas* funcionan con el píxel. Google Search Console y GA4 se conectan en *Web → Configuración*.

### Formularios → CRM de Toolyx
Opción recomendada: **webhook de entrada** (*Marketing → Captación → Formularios → Nuevo
webhook*, eligiendo pipeline y etapa). Su URL se pone en la variable `PUBLIC_FORM_ENDPOINT`.
Ojo: esa URL lleva una clave y queda visible en el HTML del sitio (cualquiera podría enviar
leads falsos). Si aparece spam, eliminar el webhook, crear otro y sumar protección
(por ejemplo, un pequeño proxy serverless con verificación anti-bots). Antes de dar por
conectado, enviar un formulario de prueba y confirmar que el lead entra al CRM con nombre,
email, teléfono, interés y mensaje.

## Hostings alternativos

### Cloudflare Pages o Netlify (recomendado: lee `public/_headers` tal cual)
- Comando de build: `npm run build` · Carpeta de salida: `dist` · Node: 22
- Conectar el repositorio de GitHub; cada push a `main` despliega.

### Vercel
- Framework: Astro (detección automática). Las cabeceras de `_headers` **no** se leen:
  crear `vercel.json` con la misma lista:
  ```json
  { "headers": [{ "source": "/(.*)", "headers": [
    { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Content-Security-Policy", "value": "frame-ancestors 'none'" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
  ]}]}
  ```

### Nginx / Apache / cPanel / S3 + CloudFront
- Subir el contenido de `dist/` a la raíz web.
- Configurar `404.html` como página de error.
- Replicar las cabeceras de `public/_headers` (Nginx: `add_header … always;`;
  Apache: `Header always set …` en `.htaccess`; CloudFront: *Response headers policy*).
- Cache largo e inmutable para `/_astro/*` (los nombres llevan hash).

### GitHub Pages
- Posible con una GitHub Action de despliegue, pero **no permite cabeceras
  personalizadas**: preferir Cloudflare Pages o Netlify.

## Dominio

1. Apuntar el DNS de `welcomestudentsgroup.com.au` (y `www`) al hosting.
2. Elegir una versión canónica (recomendado: sin `www`) y redirigir la otra con 301.
3. HTTPS automático (Let's Encrypt) del hosting.
4. Si el dominio canónico cambia, actualizar `SITE_URL` y la línea `Canonical` de
   `public/.well-known/security.txt`.
5. Si existe un sitio anterior, mapear sus URLs viejas a las nuevas con redirecciones 301
   (en Netlify/Cloudflare: archivo `public/_redirects`) para no perder posicionamiento.

## Después del primer despliegue

- [ ] Verificar el dominio en Google Search Console y Bing Webmaster Tools; enviar `/sitemap-index.xml`.
- [ ] Probar el formulario de punta a punta (llega el email o el lead al CRM).
- [ ] Revisar https://securityheaders.com, https://pagespeed.web.dev y el Rich Results Test.
- [ ] Crear o actualizar Google Business Profile para ambas oficinas.

## Portabilidad e independencia de herramientas de IA

Este repositorio **no depende de Claude Code ni de ninguna herramienta de IA** para
funcionar, compilarse o desplegarse:

- El código es Astro + TypeScript + CSS estándar; se desarrolla con cualquier editor.
- `AGENTS.md` es el estándar abierto que leen Cursor, Copilot, Codex, Gemini, Windsurf y
  otros; `CLAUDE.md` solo lo importa.
- Las skills (`.claude/skills/`) son Markdown legible por personas y por cualquier agente.
- La calidad la garantizan `npm run verify` y la CI de GitHub (`.github/workflows/ci.yml`),
  no una herramienta propietaria.
- Para migrar a otra herramienta: clonar el repo, `npm install`, `npm run dev`, y apuntar
  el asistente nuevo a `AGENTS.md`.
