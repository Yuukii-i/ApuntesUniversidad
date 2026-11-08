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
    expect(classSlugOf('web-intro/01-a')).toBe('web-intro');
    expect(topicSlugOf('web-intro/01-a')).toBe('01-a');
  });

  it('filters by class and sorts by order', () => {
    const entries = [
      { id: 'web-intro/03-c', data: { order: 3, title: 'C' } },
      { id: 'other/01-x', data: { order: 1, title: 'X' } },
      { id: 'web-intro/01-a', data: { order: 1, title: 'A' } },
      { id: 'web-intro/02-b', data: { order: 2, title: 'B' } },
    ];

    const result = topicsOfClass(entries, 'web-intro');
    expect(result.map((e) => e.id)).toEqual([
      'web-intro/01-a',
      'web-intro/02-b',
      'web-intro/03-c',
    ]);
  });

  it('returns empty array when class has no topics', () => {
    const entries = [
      { id: 'web-intro/01-a', data: { order: 1, title: 'A' } },
    ];
    expect(topicsOfClass(entries, 'vacia')).toEqual([]);
    expect(topicsOfClass([], 'web-intro')).toEqual([]);
  });

  describe('orderedTopics', () => {
    it('orders topics across classes by class order then topic order, skipping empty classes', () => {
      const classes = [
        { id: 'sistemas-operativos', data: { order: 2, title: 'Sistemas Operativos' } },
        { id: 'vacia', data: { order: 3, title: 'Clase Vacía' } },
        { id: 'web-intro', data: { order: 1, title: 'Desarrollo Web' } },
      ];

      const topics = [
        { id: 'sistemas-operativos/01-procesos', data: { order: 1, title: 'Procesos' } },
        { id: 'web-intro/02-historia', data: { order: 2, title: 'Historia' } },
        { id: 'web-intro/01-intro', data: { order: 1, title: 'Introducción' } },
      ];

      const ordered = orderedTopics(classes, topics);
      expect(ordered).toEqual([
        {
          id: 'web-intro/01-intro',
          classSlug: 'web-intro',
          topicSlug: '01-intro',
          title: 'Introducción',
          classTitle: 'Desarrollo Web',
        },
        {
          id: 'web-intro/02-historia',
          classSlug: 'web-intro',
          topicSlug: '02-historia',
          title: 'Historia',
          classTitle: 'Desarrollo Web',
        },
        {
          id: 'sistemas-operativos/01-procesos',
          classSlug: 'sistemas-operativos',
          topicSlug: '01-procesos',
          title: 'Procesos',
          classTitle: 'Sistemas Operativos',
        },
      ]);
      // Verify empty class 'vacia' is skipped
      expect(ordered.some((t) => t.classSlug === 'vacia')).toBe(false);
    });
  });

  describe('adjacentTopics', () => {
    const list = [
      { id: 'web-intro/01-intro', title: 'Intro' },
      { id: 'web-intro/04-bloques', title: 'Bloques' },
      { id: 'sistemas-operativos/01-procesos', title: 'Procesos' },
    ];

    it('handles first element (prev undefined, next defined)', () => {
      const res = adjacentTopics(list, 'web-intro/01-intro');
      expect(res.prev).toBeUndefined();
      expect(res.next).toEqual(list[1]);
    });

    it('handles middle element (both prev and next defined)', () => {
      const res = adjacentTopics(list, 'web-intro/04-bloques');
      expect(res.prev).toEqual(list[0]);
      expect(res.next).toEqual(list[2]);
    });

    it('handles last element (prev defined, next undefined)', () => {
      const res = adjacentTopics(list, 'sistemas-operativos/01-procesos');
      expect(res.prev).toEqual(list[1]);
      expect(res.next).toBeUndefined();
    });

    it('handles unknown id by returning empty object', () => {
      const res = adjacentTopics(list, 'no-existe');
      expect(res).toEqual({});
    });

    it('crosses class boundary: last topic of web-intro has next in sistemas-operativos', () => {
      const res = adjacentTopics(list, 'web-intro/04-bloques');
      expect(res.next?.id).toBe('sistemas-operativos/01-procesos');
    });
  });
});
