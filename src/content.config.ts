/**
 * Colecciones de contenido. Para publicar un artículo, crea un archivo .md en
 * src/content/news/ con el frontmatter definido aquí (ver docs/03-arquitectura.md).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(50).max(160),
    category: z.enum(['News', 'Blog', 'Guide']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Welcome Students Group'),
    /** Los borradores no se publican ni aparecen en el sitemap. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
