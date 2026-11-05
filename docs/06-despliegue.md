# 06 · Despliegue y portabilidad

El build (`npm run build`) produce la carpeta `dist/`: HTML, CSS, JS, imágenes y archivos
estáticos. **Cualquier hosting de archivos estáticos sirve.** No hay lock-in.

Tamaño del sitio compilado (noviembre de 2026): **~435 archivos y ~31 MB** (de ellos ~280
imágenes WebP, 3 PDF de 5 MB y las hojas de estilo de Elementor por página).

## Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `SITE_URL` | No (default `https://welcomestudentsgroup.com`) | Canonical, sitemap, OG, JSON-LD, feed |
| `PUBLIC_FORM_ENDPOINT` | Recomendada | URL que recibe el formulario de newsletter (POST JSON) |

Se definen en el panel del hosting (o en `.env` en local, ver `.env.example`).
**Cambiar una variable requiere un nuevo build.**

### Opciones para `PUBLIC_FORM_ENDPOINT`
- Webhook de entrada del CRM de Toolyx, **Formspree**, **Web3Forms**, **Getform**, o una
  función serverless que envíe un email o cree el contacto en el CRM de la agencia.
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

### ⚠️ Límites de importación de Toolyx

La documentación de Toolyx indicaba un límite de **200 archivos y 20 MB** por importación.
El sitio migrado tiene **~435 archivos y ~31 MB** (las imágenes y los PDF del WordPress).
**Hay que confirmar con Toolyx** si el límite aplica a este plan antes del cambio de DNS. Si
aplica, las opciones son:

1. Publicar en **Cloudflare Pages** o **Netlify** (recomendado: gratuitos, sin ese límite y
   leen `public/_headers`); Toolyx puede seguir usándose para el CRM.
2. Servir `public/uploads/` desde un almacenamiento externo (S3/R2 + CDN) y reducir así el
   sitio a ~150 archivos y ~5 MB. Requiere cambiar la base de las URLs de imágenes en el
   conversor (`scripts/wp-import/lib/media.mjs`) y permitir ese origen en `img-src` de la CSP.

### Configuración inicial (una sola vez, desde el panel de Toolyx)
1. **Web → Constructor → Nueva web** → **Importar web → Desde GitHub**.
2. Dirección del repositorio, apuntando a la rama `deploy`:
   `https://github.com/WelcomeStudentsGroup/Web-welcome/tree/deploy`
3. **Conectar y traer**. Toolyx muestra una **URL de webhook** y un **Secret** (solo una vez).
4. En GitHub: *Settings → Webhooks → Add webhook* → pegar la URL en *Payload URL*,
   *Content type* `application/json`, pegar el *Secret*, evento *Just the push event*.
5. En Toolyx: **Vista previa** y, si todo está bien, un admin pulsa **Publicar**.
6. **Dominio propio:** *Diseño y ajustes → Dominio propio* → `welcomestudentsgroup.com` (y `www`).

### Variables de build (GitHub)
*Settings → Secrets and variables → Actions → Variables*: `SITE_URL` y `PUBLIC_FORM_ENDPOINT`.

### Particularidades de Toolyx
- **Inyección automática:** Toolyx añade su píxel de atribución y puede añadir livechat y botón
  de WhatsApp. La CSP ya permite `https://os.toolyx.com`. **Revisar tras el primer publish**
  que no haya errores de CSP en la consola y que no aparezcan dos botones de WhatsApp (el
  sitio ya trae el suyo).
- **Cabeceras HTTP:** Toolyx no lee `public/_headers`. La CSP principal sigue activa porque
  va en un `<meta>` dentro del HTML.
- **Carpetas ocultas:** Toolyx no publica carpetas que empiezan con punto
  (`/.well-known/security.txt` no estará disponible allí).

## Cambio de DNS (del WordPress a este sitio)

1. Publicar el sitio en el hosting elegido y probarlo en su URL temporal: menú, formulario
   del CRM (el iframe debe cargar: si el CRM restringe los dominios que pueden incrustarlo,
   añadir el dominio temporal o probar ya con el definitivo), WhatsApp, descargas de PDF.
2. Bajar el TTL del DNS unas horas antes.
3. Apuntar `welcomestudentsgroup.com` y `www` al nuevo hosting (elegir canónico sin `www` y
   redirigir el otro con 301). HTTPS automático del hosting.
4. **No apagar el WordPress hasta** comprobar en producción las URLs principales, el
   formulario del CRM y Search Console (sin errores nuevos). Mientras tanto, cualquier cambio
   en WordPress se puede traer con `scripts/wp-import/`.
5. Hacer una copia de seguridad del WordPress (export + base de datos + `wp-content/uploads`)
   antes de darlo de baja.
6. Definir `SITE_URL` con el dominio final si no es `https://welcomestudentsgroup.com`.

## Hostings alternativos

### Cloudflare Pages o Netlify (recomendado: leen `public/_headers` tal cual)
- Comando de build: `npm run build` · Carpeta de salida: `dist` · Node: 22
- Conectar el repositorio de GitHub; cada push a `main` despliega.

### Vercel
- Framework: Astro (detección automática). Las cabeceras de `_headers` **no** se leen:
  crear `vercel.json` con la misma lista.

### Nginx / Apache / cPanel / S3 + CloudFront
- Subir el contenido de `dist/` a la raíz web; `404.html` como página de error.
- Replicar las cabeceras de `public/_headers`; cache largo e inmutable para `/_astro/*`.

### GitHub Pages
- Posible, pero **no permite cabeceras personalizadas**: preferir Cloudflare Pages o Netlify.

## Después del primer despliegue

- [ ] Verificar el dominio en Google Search Console y Bing Webmaster Tools; enviar `/sitemap-index.xml`.
- [ ] Probar el formulario del CRM y el newsletter de punta a punta.
- [ ] Revisar https://securityheaders.com, https://pagespeed.web.dev y el Rich Results Test.

## Portabilidad e independencia de herramientas de IA

Este repositorio **no depende de Claude Code ni de ninguna herramienta de IA** para
funcionar, compilarse o desplegarse: Astro + TypeScript + CSS + JSON estándar; `AGENTS.md`
es el estándar abierto que leen Cursor, Copilot, Codex, Gemini, Windsurf y otros. La calidad
la garantizan `npm run verify` y la CI de GitHub, no una herramienta propietaria.
