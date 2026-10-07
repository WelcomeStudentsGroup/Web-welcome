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

## Hostings recomendados

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
