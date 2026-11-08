import { describe, it, expect } from 'vitest';
import {
  classSlugOf,
  topicSlugOf,
  topicsOfClass,
  orderedTopics,
  adjacentTopics,
} from './content';

describe('content helpers', () => {
  it('extracts classSlugOf and topicSlugOf correctly', () => {
    expect(classSlugOf('materia-a/01-a')).toBe('materia-a');
    expect(topicSlugOf('materia-a/01-a')).toBe('01-a');
  });

  it('filters by class and sorts by order', () => {
    const entries = [
      { id: 'materia-a/03-c', data: { order: 3, title: 'C' } },
      { id: 'other/01-x', data: { order: 1, title: 'X' } },
      { id: 'materia-a/01-a', data: { order: 1, title: 'A' } },
      { id: 'materia-a/02-b', data: { order: 2, title: 'B' } },
    ];

    const result = topicsOfClass(entries, 'materia-a');
    expect(result.map((e) => e.id)).toEqual([
      'materia-a/01-a',
      'materia-a/02-b',
      'materia-a/03-c',
    ]);
  });

  it('returns empty array when class has no topics', () => {
    const entries = [
      { id: 'materia-a/01-a', data: { order: 1, title: 'A' } },
    ];
    expect(topicsOfClass(entries, 'materia-sin-temas')).toEqual([]);
    expect(topicsOfClass([], 'materia-a')).toEqual([]);
  });

  describe('orderedTopics', () => {
    it('orders topics across classes by class order then topic order, skipping empty classes', () => {
      const classes = [
        { id: 'materia-b', data: { order: 2, title: 'Materia B' } },
        { id: 'materia-sin-temas', data: { order: 3, title: 'Materia Sin Temas' } },
        { id: 'materia-a', data: { order: 1, title: 'Materia A' } },
      ];

      const topics = [
        { id: 'materia-b/01-procesos', data: { order: 1, title: 'Procesos' } },
        { id: 'materia-a/02-historia', data: { order: 2, title: 'Historia' } },
        { id: 'materia-a/01-intro', data: { order: 1, title: 'Introducción' } },
      ];

      const ordered = orderedTopics(classes, topics);
      expect(ordered).toEqual([
        {
          id: 'materia-a/01-intro',
          classSlug: 'materia-a',
          topicSlug: '01-intro',
          title: 'Introducción',
          classTitle: 'Materia A',
        },
        {
          id: 'materia-a/02-historia',
          classSlug: 'materia-a',
          topicSlug: '02-historia',
          title: 'Historia',
          classTitle: 'Materia A',
        },
        {
          id: 'materia-b/01-procesos',
          classSlug: 'materia-b',
          topicSlug: '01-procesos',
          title: 'Procesos',
          classTitle: 'Materia B',
        },
      ]);
      // Verify empty class is skipped
      expect(ordered.some((t) => t.classSlug === 'materia-sin-temas')).toBe(false);
    });
  });

  describe('adjacentTopics', () => {
    const list = [
      { id: 'materia-a/01-intro', title: 'Intro' },
      { id: 'materia-a/02-bloques', title: 'Bloques' },
      { id: 'materia-b/01-procesos', title: 'Procesos' },
    ];

    it('handles first element (prev undefined, next defined)', () => {
      const res = adjacentTopics(list, 'materia-a/01-intro');
      expect(res.prev).toBeUndefined();
      expect(res.next).toEqual(list[1]);
    });

    it('handles middle element (both prev and next defined)', () => {
      const res = adjacentTopics(list, 'materia-a/02-bloques');
      expect(res.prev).toEqual(list[0]);
      expect(res.next).toEqual(list[2]);
    });

    it('handles last element (prev defined, next undefined)', () => {
      const res = adjacentTopics(list, 'materia-b/01-procesos');
      expect(res.prev).toEqual(list[1]);
      expect(res.next).toBeUndefined();
    });

    it('handles unknown id by returning empty object', () => {
      const res = adjacentTopics(list, 'no-existe');
      expect(res).toEqual({});
    });

    it('crosses class boundary: last topic of first class has next in second class', () => {
      const res = adjacentTopics(list, 'materia-a/02-bloques');
      expect(res.next?.id).toBe('materia-b/01-procesos');
    });
  });
});
