import type { CollectionEntry } from 'astro:content';

export function classSlugOf(id: string): string {
  const parts = id.split('/');
  return parts[0] || id;
}

export function topicSlugOf(id: string): string {
  const parts = id.split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : id;
}

export function topicsOfClass<T extends { id: string; data: { order: number } }>(
  entries: T[],
  classSlug: string
): T[] {
  return entries
    .filter((entry) => classSlugOf(entry.id) === classSlug)
    .sort((a, b) => a.data.order - b.data.order);
}

export interface OrderedTopicItem {
  id: string;
  classSlug: string;
  topicSlug: string;
  title: string;
  classTitle: string;
}

export function orderedTopics<
  C extends { id: string; data: { order: number; title: string } },
  T extends { id: string; data: { order: number; title: string } },
>(classes: C[], topics: T[]): OrderedTopicItem[] {
  const sortedClasses = [...classes].sort((a, b) => a.data.order - b.data.order);
  const result: OrderedTopicItem[] = [];

  for (const c of sortedClasses) {
    const classTopics = topicsOfClass(topics, c.id);
    if (classTopics.length === 0) continue; // Skip empty classes

    for (const t of classTopics) {
      result.push({
        id: t.id,
        classSlug: c.id,
        topicSlug: topicSlugOf(t.id),
        title: t.data.title,
        classTitle: c.data.title,
      });
    }
  }

  return result;
}

export function adjacentTopics<T extends { id: string }>(
  ordered: T[],
  id: string
): { prev?: T; next?: T } {
  const index = ordered.findIndex((item) => item.id === id);
  if (index === -1) {
    return {};
  }

  return {
    prev: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export async function getClasses(): Promise<CollectionEntry<'classes'>[]> {
  const { getCollection } = await import('astro:content');
  const classes = await getCollection('classes');
  return classes.sort((a, b) => a.data.order - b.data.order);
}

export async function getClassTopics(classSlug: string): Promise<CollectionEntry<'topics'>[]> {
  const { getCollection } = await import('astro:content');
  const topics = await getCollection('topics');
  return topicsOfClass(topics, classSlug);
}
