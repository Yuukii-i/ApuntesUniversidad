import { z } from 'zod';

export const CLASS_COLORS = [
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'amber',
  'orange',
  'red',
  'rose',
  'magenta',
] as const;

export type ClassColor = (typeof CLASS_COLORS)[number];

export const CLASS_ARTS = [
  'diagram',
  'chip',
  'network',
  'code',
  'database',
  'layers',
  'math',
  'grid',
] as const;

export type ClassArt = (typeof CLASS_ARTS)[number];

export function classColorVar(color: ClassColor): string {
  return `--class-${color}`;
}

export const classSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  color: z.enum(CLASS_COLORS).default('violet'),
  art: z.enum(CLASS_ARTS).default('grid'),
});

export const topicSchema = z.object({
  title: z.string(),
  order: z.number(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minutes: z.number().int().min(1).max(180).optional(),
});
