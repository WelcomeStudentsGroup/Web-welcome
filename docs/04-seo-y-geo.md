# 04 · SEO y GEO

**SEO** = posicionar en buscadores (Google, Bing). **GEO** (*Generative Engine
Optimization*) = que los motores de IA (ChatGPT, Gemini, Perplexity, Claude, Google AI
Overviews) entiendan, recomienden y **citen** a Welcome correctamente.

## Implementado

### SEO técnico
- HTML estático y rápido, URLs limpias con barra final, `lang="en-AU"`.
- `<title>` y `meta description` únicos por página (validados por `npm run verify`).
- `canonical` absoluto en cada página; `noindex` en páginas legales en borrador y en la 404.
- `sitemap-index.xml` automático (`@astrojs/sitemap`), excluye noindex.
- `robots.txt` generado, con referencia al sitemap.
- Open Graph y Twitter Cards con imagen de 1200×630 (`public/og-default.png`).
- Migas de pan visibles + schema `BreadcrumbList`.
- Jerarquía de encabezados: un `<h1>` por página, `h2` por sección.
- Enlazado interno entre páginas y anclas (`/services/#migration`, etc.).
- Fuentes con preload, CSS cacheable y sin JS bloqueante (Core Web Vitals).

### Datos estructurados (schema.org, JSON-LD, en `src/lib/schema.ts`)
- `Organization` + `EducationalOrganization`: nombre, fundación, contacto, áreas,
  `knowsAbout`, acreditaciones (`memberOf`), `sameAs` (redes, cuando se carguen).
- `ProfessionalService` × 2 (Brisbane y Gold Coast) con dirección postal → SEO local.
- `WebSite`, `WebPage` (`AboutPage`, `ContactPage`, `CollectionPage`).
- `FAQPage` (Services), `Service` + `OfferCatalog` (educación y visas).
- `BlogPosting` / `NewsArticle` en cada artículo.

Validar con: https://search.google.com/test/rich-results y https://validator.schema.org

### GEO
- **`/llms.txt`**: resumen factual en Markdown (empresa, datos clave, páginas,
  servicios, FAQ, artículos), generado desde los mismos datos del sitio.
- **Rastreadores de IA permitidos** en `robots.txt` (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended…).
- **Consistencia de datos (NAP):** nombre, dirección y teléfono idénticos en todo el sitio y
  en el schema, gracias a la fuente única `src/config/site.ts`.
- **Contenido "citable":** FAQ con respuestas directas, hechos concretos (desde 2015, 2
  oficinas, 5 acreditaciones, 10 instituciones socias) y lenguaje claro.

## Próximos pasos recomendados (por impacto)

1. **Google Search Console y Bing Webmaster Tools:** verificar el dominio y enviar el
   sitemap. Bing alimenta a ChatGPT/Copilot.
2. **Google Business Profile** para cada oficina, con los datos **exactamente iguales** a
   `src/config/site.ts`, y pedir reseñas a los estudiantes.
3. **Redes sociales:** cargar las URLs en `site.social` para activar `sameAs` (refuerza la
   entidad en el Knowledge Graph y en los LLM).
4. **Fotos reales** optimizadas (ver `docs/03-arquitectura.md`): mejoran la conversión y el
   SEO de imágenes.
5. **Contenido para búsquedas reales** (un artículo por intención), por ejemplo: "student
   visa Australia requirements", "study English in Brisbane cost", "VET courses Gold Coast",
   "work and holiday visa Australia from Colombia/Chile/Argentina". Estructura: respuesta
   directa en el primer párrafo, subtítulos en forma de pregunta, datos con fecha, enlaces a
   fuentes oficiales (immi.homeaffairs.gov.au), y CTA a la consulta.
6. **Versión en español** (`/es/`) con `hreflang`: gran parte del público busca en español.
7. **Páginas de destino por ciudad y por visa** (`/study-in-brisbane/`, `/student-visa/`…)
   para capturar búsquedas long-tail.
8. **Analítica respetuosa con la privacidad** (Plausible, Umami o GA4 con consentimiento),
   actualizando la CSP. Medir conversiones: reservas, clics en WhatsApp y formularios.
9. **Menciones y enlaces externos:** directorios de agencias acreditadas (QEAC, ICEF,
   English Australia), instituciones socias y medios latinos en Australia. Los LLM se apoyan
   mucho en menciones de terceros.

## Checklist por página nueva

- [ ] Título ≤ 50 caracteres (más la marca) con la palabra clave principal.
- [ ] Description de 120–160 caracteres, única, con beneficio y llamado a la acción.
- [ ] Un `<h1>`, `h2` descriptivos y preguntas reales como subtítulos.
- [ ] Primer párrafo que responde directamente la intención de búsqueda.
- [ ] Enlaces internos hacia y desde páginas relacionadas.
- [ ] Imágenes con `alt` descriptivo.
- [ ] Schema adicional si corresponde (FAQPage, Service, Article…).
- [ ] `npm run verify` en verde.
