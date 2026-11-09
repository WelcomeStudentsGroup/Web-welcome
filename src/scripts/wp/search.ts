/** Búsqueda en el navegador para /buscar/?s=texto (WordPress la hacía en el servidor). */
interface Entry {
  type: 'post' | 'page';
  title: string;
  path: string;
  date: string;
  image: { src: string; width: number | null; height: number | null; alt: string } | null;
  text: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function initSearch() {
  const page = document.querySelector<HTMLElement>('[data-search-page]');
  if (!page) return;
  const results = document.getElementById('wsgSearchResults');
  const title = document.getElementById('wsgSearchTitle');
  const q = new URLSearchParams(location.search).get('s')?.trim() ?? '';
  if (title) title.textContent = `Search Results for: ${q}`;
  document.title = `Resultados para: ${q} – Welcome Students Group`;
  const input = document.querySelector<HTMLInputElement>('.elementor-search-form__input');
  if (input) input.value = q;
  if (!results) return;
  if (!q) {
    results.innerHTML = '<p class="elementor-posts-nothing-found">Escribe algo en el buscador.</p>';
    return;
  }
  let entries: Entry[] = [];
  try {
    entries = await (await fetch('/search-index.json')).json();
  } catch {
    results.innerHTML = '<p class="elementor-posts-nothing-found">No se pudo cargar la búsqueda.</p>';
    return;
  }
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const scored = entries
    .map((e) => {
      const t = norm(e.title);
      const body = norm(e.text);
      let score = 0;
      for (const term of terms) {
        if (t.includes(term)) score += 10;
        if (body.includes(term)) score += 1;
      }
      return { e, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) {
    results.innerHTML = '<p class="elementor-posts-nothing-found">No se encontró nada. Prueba con otras palabras.</p>';
    return;
  }
  const date = (iso: string) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  // Paginación de 10 en 10, como WordPress (?s=texto&pag=N).
  const PER_PAGE = 10;
  const params = new URLSearchParams(location.search);
  const current = Math.max(1, Number(params.get('pag')) || 1);
  const total = Math.ceil(scored.length / PER_PAGE);
  const pageItems = scored.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const pageUrl = (n: number) => {
    const u = new URLSearchParams(params);
    if (n === 1) u.delete('pag');
    else u.set('pag', String(n));
    return `/buscar/?${u.toString()}`;
  };
  const pagination =
    total > 1
      ? `<nav class="elementor-pagination" aria-label="Paginación">${Array.from({ length: total }, (_, i) => i + 1)
          .map((n) => (n === current ? `<span aria-current="page" class="page-numbers current"><span class="elementor-screen-only">Page</span>${n}</span>` : `<a class="page-numbers" href="${esc(pageUrl(n))}"><span class="elementor-screen-only">Page</span>${n}</a>`))
          .join(' ')}</nav>`
      : '';
  results.innerHTML = pageItems
    .map(({ e }) => {
      const excerpt = e.text.split(/\s+/).slice(0, 25).join(' ');
      return `<article class="elementor-post elementor-grid-item post ${e.image ? 'has-post-thumbnail' : ''}">
  ${e.image ? `<a class="elementor-post__thumbnail__link" href="${esc(e.path)}" tabindex="-1" aria-hidden="true"><div class="elementor-post__thumbnail"><img src="${esc(e.image.src)}" alt="${esc(e.image.alt)}"${e.image.width ? ` width="${e.image.width}" height="${e.image.height}"` : ''} loading="lazy" decoding="async"></div></a>` : ''}
  <div class="elementor-post__text">
    <h3 class="elementor-post__title"><a href="${esc(e.path)}">${esc(e.title)}</a></h3>
    <div class="elementor-post__meta-data"><span class="elementor-post-date">${date(e.date)}</span></div>
    <div class="elementor-post__excerpt"><p>${esc(excerpt)}</p></div>
    <div class="elementor-post__read-more-wrapper"><a class="elementor-post__read-more" href="${esc(e.path)}">LEER MÁS »</a></div>
  </div>
</article>`;
    })
    .join('');
  results.insertAdjacentHTML('afterend', pagination);
}
