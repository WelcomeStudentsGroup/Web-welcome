import { getCollection } from 'astro:content';

/** Artículos publicados (sin borradores), del más reciente al más antiguo. */
export async function getPublishedNews() {
  const posts = await getCollection('news', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
