# 05 · Seguridad

## Modelo

Es un sitio **estático**: no hay servidor de aplicación, base de datos ni panel de
administración expuesto. La superficie de ataque se reduce al navegador del visitante y al
endpoint de formularios.

## Content Security Policy (CSP)

Astro genera en cada página un `<meta http-equiv="content-security-policy">` con **hashes**
de cada script y estilo propio (configurado en `astro.config.mjs` → `security.csp`):

```
default-src 'self'; img-src 'self' data:; font-src 'self';
connect-src 'self' [origen del endpoint de formularios];
form-action 'self' [origen del endpoint]; base-uri 'self'; object-src 'none';
upgrade-insecure-requests; script-src 'self' 'sha256-…'; style-src 'self' 'sha256-…'
```

Consecuencias para quien desarrolla:
- ❌ Prohibido `style="..."`, `onclick="..."`, `<script src="https://cdn…">` y Google Fonts.
- ✅ Usar clases CSS y `<script>` dentro de componentes `.astro` (Astro calcula los hashes).
- Para agregar un servicio externo (analítica, mapa, chat, video), agrega su dominio a la
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

`_headers` funciona en Netlify y Cloudflare Pages. Para otros hostings, ver
`docs/06-despliegue.md`. Verificar en https://securityheaders.com y https://observatory.mozilla.org

> HSTS con `preload`: confirmar que **todos** los subdominios sirven HTTPS antes de
> enviar el dominio a https://hstspreload.org

## Formularios

- Validación en el cliente (UX), pero **el endpoint debe validar de nuevo** en el servidor.
- Honeypot `_gotcha` contra bots. Si llega spam, agregar en el endpoint Cloudflare
  Turnstile o hCaptcha (y actualizar la CSP).
- Consentimiento explícito y enlace a la política de privacidad (Australian Privacy Act).
- El endpoint (`PUBLIC_FORM_ENDPOINT`) es público por naturaleza; **nunca** pongas claves
  secretas en variables `PUBLIC_*`, porque se incrustan en el HTML.

## Enlaces externos

Todos los `target="_blank"` llevan `rel="noopener"` (validado por `verify`).

## Dependencias

- Pocas dependencias y solo de build: `astro`, `@astrojs/sitemap`, fuentes.
- `package-lock.json` versionado; en CI se usa `npm ci`.
- Revisar con `npm audit` y actualizar con `npm outdated`/`npm update` cada mes.
  Dependabot (`.github/dependabot.yml`) propone actualizaciones mensuales.

## Secretos

- `.env` está en `.gitignore`; solo se versiona `.env.example`.
- Los secretos de despliegue van en las variables del hosting o en GitHub Secrets.

## Divulgación responsable

`public/.well-known/security.txt` indica a quién reportar vulnerabilidades. Renovar la
fecha `Expires` antes de que venza.
