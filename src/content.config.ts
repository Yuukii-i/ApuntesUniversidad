import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { classSchema, topicSchema, CLASS_COLORS, CLASS_ARTS } from './lib/classStyle';

export { classSchema, topicSchema, CLASS_COLORS, CLASS_ARTS };

const classes = defineCollection({
  loader: glob({
    base: './src/content/classes',
    pattern: '*/class.yaml',
    generateId: ({ entry }) => entry.replace(/\/class\.ya?ml$/, ''),
  }),
  schema: classSchema,
});

const topics = defineCollection({
  loader: glob({
    base: './src/content/classes',
    pattern: '*/*.mdx',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: topicSchema,
});

export const collections = { classes, topics };
