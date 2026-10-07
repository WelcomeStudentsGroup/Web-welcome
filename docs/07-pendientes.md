# 07 · Pendientes

Lista viva de lo que falta para producción y de las mejoras siguientes. Marca `[x]` al
completar y agrega lo nuevo. **Nada de esto debe inventarse**: lo entrega el equipo de Welcome.

## Bloqueantes para salir a producción

- [ ] **Endpoint de formularios:** elegir servicio o CRM y definir `PUBLIC_FORM_ENDPOINT`
      (ver `docs/06-despliegue.md`). Sin él, los formularios muestran WhatsApp y email.
- [ ] **Hosting y dominio:** elegir hosting (recomendado Cloudflare Pages o Netlify),
      conectar el repo, apuntar el DNS y definir la versión canónica (con o sin `www`).
- [ ] **Política de privacidad y términos:** revisión legal de `/privacy/` y `/terms/`
      (hoy son borradores con `noindex`). Al aprobarlos, quitar `noindex` en ambas páginas
      y el filtro en `astro.config.mjs` (sitemap).
- [ ] **Redirecciones del sitio anterior** (si existe): listar las URLs actuales y mapearlas
      con 301 en `public/_redirects`.

## Contenido de marca

- [ ] **Logo oficial en SVG** → `src/components/Logo.astro`, `public/favicon.svg` y luego
      `node scripts/generate-assets.mjs`.
- [ ] **URLs de redes sociales** (Instagram, Facebook, LinkedIn, YouTube, TikTok si aplica)
      → `site.social` en `src/config/site.ts`.
- [ ] **Licencia web de Archer y Gotham** (opcional; hoy se usan Fraunces y Plus Jakarta Sans).

## Fotografías (reemplazan a `ImagePlaceholder`)

Auténticas, de estudiantes reales y con autorización de uso:

- [ ] Home, portada: dos amigos riendo frente a la Ópera de Sídney y el Harbour Bridge al atardecer.
- [ ] Home y Destinations: Australia (skyline o vida en el campus).
- [ ] Home y Destinations: Nueva Zelanda (paisaje o vida estudiantil).
- [ ] Home y Destinations: Dubái (skyline o campus).
- [ ] Destinations: foto principal de ciudad australiana con puerto.
- [ ] About: equipo de asesores con un estudiante en la oficina de Brisbane o Gold Coast.
- [ ] Services, Education: estudiante con mochila sonriendo, campus de fondo.
- [ ] Services, Migration: viajero con pasaporte y tarjeta de embarque, maleta al lado.
- [ ] Services, WelcomeHub: profesionales en un evento de networking de WelcomeHub.
- [ ] (Opcional) Fotos reales de los estudiantes de los testimonios, con permiso.

## Contenido

- [ ] **Testimonios completos** (hoy son fragmentos) y, si es posible, enlace a las
      reseñas de Google. Con reseñas verificables se puede agregar schema `Review`.
- [ ] **Becas:** el botón "Scholarships available" lleva a Educación. Definir qué becas o
      descuentos se ofrecen para crear una sección o página propia.
- [ ] **Nueva Zelanda y Dubái:** guía detallada por ciudad o programa (confirmar con los equipos).
- [ ] **Recursos descargables:** "Study in Australia — starter guide" y "Visa document
      checklist" (PDF). Hoy figuran como "Coming soon" en `/news/`.
- [ ] **Primeros artículos** del blog (ver ideas en `docs/04-seo-y-geo.md`).
- [ ] **Empleos:** si hay vacantes, publicarlas (hoy se invita a enviar el CV por email).
- [ ] **Mapa:** hoy cada dirección enlaza a Google Maps. Si se quiere un mapa incrustado,
      agregar el dominio a `frame-src` en la CSP (`docs/05-seguridad.md`).

## Crecimiento (después del lanzamiento)

- [ ] Google Search Console, Bing Webmaster Tools y Google Business Profile (2 oficinas).
- [ ] Analítica respetuosa con la privacidad y medición de conversiones (reservas,
      WhatsApp, formularios).
- [ ] Versión en español (`/es/`) con `hreflang`.
- [ ] Páginas de destino por ciudad y por visa.
- [ ] Revisar y fusionar mensualmente los PR de Dependabot.
