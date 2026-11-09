# 05 · Seguridad

## Modelo

Es un sitio **estático**: no hay servidor de aplicación, base de datos ni panel de
administración expuesto (adiós a las actualizaciones de WordPress, plugins y temas). La
superficie de ataque se reduce al navegador del visitante, al iframe del CRM y al endpoint
del newsletter.

## Lo que se eliminó del WordPress y por qué

| En WordPress | Aquí | Motivo |
|---|---|---|
| Google Tag Manager (`GTM-NRSLTKLJ`) | No se carga | Script de terceros que inyecta otros scripts; incompatible con una CSP estricta sin `nonce`. Decisión pendiente (`docs/07-pendientes.md`) |
| HubSpot (`js.hs-scripts.com`, portal 23452260) | No se carga | Tracking de terceros; los formularios no lo usaban |
| Google Translate (banderas EN/ES) | Eliminado | Carga scripts y cookies de Google; el sitio es en español |
| Reproductor de YouTube (API de iframes) | Fachada con imagen; el iframe de `youtube-nocookie.com` se crea al pulsar play; el video de fondo de la portada se sustituye por un fotograma | Sin scripts de YouTube en la carga |
| Widget de Eventbrite (`/eventos/`) | Enlace al evento en Eventbrite | Requería su script |
| Joinchat (WhatsApp) | Botón propio con el mismo número y mensaje | Sin plugin ni tracking |
| jQuery, Elementor, Swiper, Slick… (~1 MB de JS) | ~13 KB de JS propio | Menos superficie, más velocidad |
| Fuentes de Google y Font Awesome completos | Auto-hospedadas; Font Awesome recortado a 35 iconos | Privacidad y CSP |

## Content Security Policy (CSP)

Astro genera en cada página un `<meta http-equiv="content-security-policy">` con **hashes**
de cada script y estilo propio (configurado en `astro.config.mjs` → `security.csp`):

```
default-src 'self'; img-src 'self' data:; font-src 'self';
frame-src https://access.welcomestudentsgroup.com https://www.youtube-nocookie.com;
connect-src 'self' https://os.toolyx.com [origen del endpoint del newsletter];
form-action 'self' [origen del endpoint]; base-uri 'self'; object-src 'none';
upgrade-insecure-requests; script-src 'self' https://os.toolyx.com 'sha256-…'; style-src 'self' 'sha256-…'
```

- `frame-src`: el formulario de contacto es un iframe del CRM de la agencia (subdominio
  propio) y los videos de YouTube se cargan desde `youtube-nocookie.com` al pulsar play.
- `https://os.toolyx.com` está permitido en `script-src` y `connect-src` porque el sitio se
  aloja en Toolyx OS, que inyecta su píxel de estadísticas (ver `docs/06-despliegue.md`).

Consecuencias para quien desarrolla:
- ❌ Prohibido `style="..."`, `onclick="..."`, `<script src="https://cdn…">` y Google Fonts.
  El conversor transforma los `style="…"` del WordPress en clases de `generated.css`.
- ✅ Usar clases CSS y `<script>` dentro de componentes `.astro` (Astro calcula los hashes).
  Cambiar estilos desde JavaScript (`el.style.x = …`) sí está permitido por la CSP.
- Para agregar un servicio externo (analítica, mapa, chat), agrega su dominio a la
  directiva correspondiente en `astro.config.mjs` y documenta aquí el motivo.
- La CSP **no aplica en `npm run dev`**: prueba con `npm run build && npm run preview`.
- `npm run verify` falla si aparece un `style=""`, un manejador inline o una fuente `data:`.

## Cabeceras HTTP (`public/_headers`)

| Cabecera | Valor | Protege contra |
|---|---|---|
| `Strict-Transport-Security` | 2 años, subdominios, preload | Degradar a HTTP |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` + `frame-ancestors 'none'` | `DENY` | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fugas de URL |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pagos… desactivados | Abuso de APIs |
| `Cross-Origin-Opener-Policy` | `same-origin` | Ataques entre ventanas |

`_headers` funciona en Netlify y Cloudflare Pages (**Toolyx OS no lo lee**). Verificar en
https://securityheaders.com

> HSTS con `preload`: confirmar que **todos** los subdominios (incluido
> `access.welcomestudentsgroup.com`) sirven HTTPS antes de enviar el dominio a https://hstspreload.org

## Formularios

- **CRM (iframe):** la validación, el anti-spam y el almacenamiento los hace el sistema de la
  agencia. El iframe solo funciona si ese sistema permite incrustarse desde el dominio del
  sitio (hoy `welcomestudentsgroup.com`); si cambia el dominio, revisar su configuración.
- **Newsletter:** validación en el cliente (UX), pero **el endpoint debe validar de nuevo**.
  Honeypot `_gotcha` contra bots. El endpoint (`PUBLIC_FORM_ENDPOINT`) es público; **nunca**
  pongas claves secretas en variables `PUBLIC_*`.

## Contenido importado

El HTML del WordPress se limpia en la importación (`scripts/wp-import/lib/sanitize.mjs`):
se eliminan scripts, manejadores inline (`on*`), estilos inline y atributos de edición; los
SVG se incluyen sin `<script>`. Si se vuelve a importar, se vuelve a limpiar.

## Enlaces externos

Todos los `target="_blank"` llevan `rel="noopener"` (validado por `verify`).

## Dependencias

- De build: `astro`, `@astrojs/sitemap`, fuentes `@fontsource`, `node-html-parser` y
  `subset-font` (solo para la importación). Ninguna en el navegador.
- `package-lock.json` versionado; en CI se usa `npm ci`.
- Revisar con `npm audit` y actualizar con `npm outdated`/`npm update` cada mes.
  Dependabot (`.github/dependabot.yml`) propone actualizaciones mensuales.

## Secretos

- `.env` está en `.gitignore`; solo se versiona `.env.example`.
- Los secretos de despliegue van en las variables del hosting o en GitHub Secrets.

## Divulgación responsable

`public/.well-known/security.txt` indica a quién reportar vulnerabilidades. Renovar la
fecha `Expires` antes de que venza.
