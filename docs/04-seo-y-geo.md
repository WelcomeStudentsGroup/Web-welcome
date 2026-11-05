# 04 · SEO y GEO

**SEO** = posicionar en buscadores (Google, Bing). **GEO** (*Generative Engine
Optimization*) = que los motores de IA (ChatGPT, Gemini, Perplexity, Claude, Google AI
Overviews) entiendan, recomienden y **citen** a Welcome correctamente.

## Lo que se conserva del WordPress (lo que ya posiciona)

- **Las mismas URLs** para las 30 páginas, los 16 artículos (en la raíz, `/<slug>/`), las
  categorías (`/category/<slug>/`, con paginación `/page/2/`), los listados paginados
  (`/blog/2/`, `/career/2/`) y los archivos mensuales (`/2023/05/`). No hacen falta
  redirecciones 301.
- **Los mismos `<title>`** (`Página – Welcome Students Group`; la portada conserva el
  título largo de WordPress) y los mismos textos, encabezados e imágenes (con su `alt`).
- El feed RSS (`/feed.xml`; WordPress lo servía en `/feed/`).

## Lo que mejora respecto al WordPress

- `meta description` en todas las páginas (WordPress no tenía ninguna): se genera a partir
  del primer texto de cada página o artículo. Puede afinarse a mano en el campo
  `description` de cada JSON.
- `canonical` absoluto, Open Graph y Twitter Cards (con la imagen destacada en los artículos).
- `sitemap-index.xml` (el de WordPress estaba roto: redirigía a la portada) y `robots.txt`.
- Un solo `<h1>` por página (las páginas de Elementor que tenían varios o ninguno se
  normalizan: el primero se conserva y el resto pasan a `<h2>` con el mismo estilo; si no
  había, se añade uno oculto con el título).
- Datos estructurados schema.org en JSON-LD (`src/lib/schema.ts`): `Organization` +
  `EducationalOrganization`, `ProfessionalService` × 2 oficinas, `WebSite` con `SearchAction`,
  `WebPage`, `BreadcrumbList` y `BlogPosting` en los artículos.
- `lang="es"`, HTML estático, fuentes auto-hospedadas con preload, imágenes WebP con
  dimensiones (Core Web Vitals).
- Las páginas de paginación, archivos mensuales y la búsqueda llevan `noindex` y no van al sitemap.

### GEO
- **`/llms.txt`**: resumen factual en Markdown (empresa, datos clave, páginas y artículos con
  su descripción), generado desde el contenido.
- **Rastreadores de IA permitidos** en `robots.txt`.
- **Consistencia de datos (NAP):** nombre, dirección y teléfono idénticos en el footer, en
  el schema y en `llms.txt`.

Validar con: https://search.google.com/test/rich-results y https://validator.schema.org

## Pendiente de verificar tras el cambio de DNS

1. Google Search Console y Bing Webmaster Tools: enviar `/sitemap-index.xml` y comprobar que
   no aparezcan errores de cobertura en las URLs que ya estaban indexadas.
2. Si en Search Console figuran URLs que no existen aquí (p. ej. `/?p=123`, `/feed/`,
   `/author/…`, adjuntos de imágenes), añadir redirecciones en el hosting.
3. Google Business Profile de las dos oficinas con los datos de `src/config/site.ts`.

## Próximos pasos recomendados (por impacto)

1. Revisar las `description` generadas de las páginas principales y escribir una a mano
   (120–160 caracteres, con beneficio y llamado a la acción).
2. Decidir si se añade analítica (el WordPress tenía Google Tag Manager y HubSpot; ver
   `docs/07-pendientes.md`) y medir conversiones: formulario del CRM, WhatsApp, newsletter.
3. Contenido nuevo para búsquedas reales ("visa de estudiante Australia requisitos",
   "estudiar inglés en Brisbane precio"…) como artículos del blog.
4. Menciones y enlaces externos (directorios QEAC, ICEF, English Australia; instituciones
   socias).

## Checklist por página nueva

- [ ] Título con la palabra clave principal (el sufijo "– Welcome Students Group" se añade solo).
- [ ] Description de 120–160 caracteres, única.
- [ ] Un `<h1>`, `h2` descriptivos.
- [ ] Enlaces internos hacia y desde páginas relacionadas.
- [ ] Imágenes con `alt` descriptivo, en WebP y con dimensiones.
- [ ] `npm run verify` en verde.
