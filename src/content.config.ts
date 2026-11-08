import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const classes = defineCollection({
  loader: glob({
    base: './src/content/classes',
    pattern: '*/class.yaml',
    generateId: ({ entry }) => entry.replace(/\/class\.ya?ml$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    accent: z.string().optional(),
  }),
});

const topics = defineCollection({
  loader: glob({
    base: './src/content/classes',
    pattern: '*/*.mdx',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { classes, topics };
