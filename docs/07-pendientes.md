# 07 · Pendientes

Lista viva de decisiones y tareas. Marca `[x]` al completar y agrega lo nuevo.
**Nada de esto debe inventarse**: lo decide o lo entrega el equipo de Welcome.

## Antes del cambio de DNS

- [ ] **Hosting:** confirmar con Toolyx el límite de importación (200 archivos / 20 MB).
      El sitio tiene ~435 archivos y ~31 MB. Alternativas en `docs/06-despliegue.md`.
- [ ] **Formulario del CRM en iframe:** comprobar en el hosting definitivo que
      `access.welcomestudentsgroup.com/widget/form/…` carga dentro del sitio (si el CRM
      restringe dominios, añadir el nuevo). Es el mismo formulario que usaba WordPress.
- [ ] **Newsletter del footer:** en WordPress era un formulario de Elementor Pro; hay que
      definir dónde llegan ahora los correos (`PUBLIC_FORM_ENDPOINT`, ver `docs/06-despliegue.md`).
      Sin configurar, el formulario muestra el email de contacto en lugar de enviar.
- [ ] **Analítica:** el WordPress cargaba Google Tag Manager (`GTM-NRSLTKLJ`) y HubSpot
      (portal `23452260`). Se dejaron fuera por la CSP estricta. Decidir si se quiere
      analítica y cuál (recomendado: una herramienta respetuosa con la privacidad, o GA4
      directo con consentimiento). Al añadirla, actualizar la CSP y `docs/05-seguridad.md`.
- [ ] **Google Translate (banderas EN/ES):** eliminado. Si se quiere versión en inglés, la
      opción limpia es una traducción real (`/en/`) con `hreflang`, no un traductor automático.
- [ ] **Copia de seguridad del WordPress** antes de darlo de baja (export, base de datos y
      `wp-content/uploads`).
- [ ] Verificar en Search Console tras el cambio: URLs indexadas que no existan aquí
      (`/?p=ID`, `/feed/`, adjuntos) → redirecciones en el hosting.

## Contenido heredado que conviene revisar con el cliente

- [ ] **Testimonios de la portada y de `/eventos/` (PowerPack):** en el WordPress el carrusel está
      roto (no carga su script ni el CSS de las estrellas: 3 cajas apiladas con 10 estrellas en
      columna). La réplica los muestra como estaban diseñados (carrusel de 2 con puntos, estrellas
      en línea). Si el cliente prefiere copiar el estado roto, se desactiva en
      `scripts/wp-import/lib/sanitize.mjs` (no emitir `data-wsg-carousel` para `pp-testimonials`)
      y se quitan las reglas `.pp-testimonials .e-rating-wrapper` de `src/styles/site.css`.

- [ ] **`/terminos-y-condiciones/`:** en WordPress la página existe pero está vacía (solo
      header y footer). Aquí se muestra igual, con el título. Redactar el contenido o eliminarla.
- [ ] **`/welcome-2/`:** página publicada pero no enlazada; parece una versión antigua de la
      portada (con otro diseño y textos). Decidir si se mantiene, se redirige a `/` o se elimina.
- [ ] **`/eventos/`:** página no enlazada con un evento de Eventbrite de 2021 (el widget de
      compra se sustituyó por un enlace al evento). Probablemente conviene retirarla.
- [ ] **`/programa-vacacional-vet/`:** página publicada pero no enlazada desde el menú.
- [ ] **Política de privacidad:** menciona `info@welcomestudentsgroup.com` mientras el footer
      usa `info@welcomestudentsgroup.com.au`, y la fecha "[28 de agosto de 2024]" va entre
      corchetes. Confirmar email y fecha.
- [ ] **Copyright del footer:** "All Copyright © 2024 Welcome Students Group– Diseño Web
      Whisper MKT" está escrito a mano en el WordPress; actualizar el año si se desea.
- [ ] **Video de fondo de la portada:** en WordPress era un video de YouTube
      (`youtu.be/tJbGZFid5oQ`); sin el reproductor de YouTube se muestra un fotograma. Si se
      quiere el video, la opción limpia es un MP4 propio y corto (`<video autoplay muted loop>`).
- [ ] **Fuente Archer:** el WordPress servía Archer (fuente comercial) desde archivos TTF de
      un sitio de fuentes gratuitas. Se reemplazó por Roboto Slab. Con licencia web, se puede
      restaurar (`docs/02-marca-y-diseno.md`).
- [ ] **Carrusel "Aliados" de las páginas de ciudades:** en WordPress está oculto en todos
      los dispositivos (clases `elementor-hidden-*`); se conserva así.
- [ ] **Miga de pan "Blog" de las categorías:** en WordPress enlazaba por error al último
      artículo; aquí enlaza a `/blog/`.
- [ ] **Imagen externa eliminada:** el artículo "Top 10 de Apps…" incrustaba una imagen de
      `static.gumtree.com.au` que ya no existe (404).

## Mejoras posibles (después del lanzamiento)

- [ ] Escribir a mano las `meta description` de las páginas principales (hoy se generan
      del primer párrafo).
- [ ] Reducir el CSS por página de Elementor (hoy entre 15 y 140 KB por página, minificado)
      eliminando reglas no usadas.
- [ ] Google Business Profile de las dos oficinas; Search Console y Bing Webmaster Tools.
- [ ] Nuevos artículos del blog (ideas en `docs/04-seo-y-geo.md`).
- [ ] Revisar y fusionar mensualmente los PR de Dependabot.
