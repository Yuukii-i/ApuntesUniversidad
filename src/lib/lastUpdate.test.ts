import { describe, it, expect } from 'vitest';
import {
  getLastUpdate,
  formatDateEs,
  getLastUpdateISO,
  formatDateTimeEs,
  getClassUpdatedISO,
  getRecentTopics,
} from './lastUpdate';
import { classSchema, topicSchema } from './classStyle';

describe('lastUpdate helpers', () => {
  it('getLastUpdate("ingenieria-de-software") returns a valid Date', () => {
    const d = getLastUpdate('ingenieria-de-software');
    expect(d).toBeInstanceOf(Date);
    expect(isNaN(d.getTime())).toBe(false);
  });

  it('getLastUpdate("no-existe") returns a valid Date without throwing', () => {
    let d: Date | null = null;
    expect(() => {
      d = getLastUpdate('no-existe');
    }).not.toThrow();
    expect(d).toBeInstanceOf(Date);
    expect(isNaN(d!.getTime())).toBe(false);
  });

  it('formatDateEs(new Date("2026-11-05T12:00:00Z")) contains "2026" and "nov"', () => {
    const formatted = formatDateEs(new Date('2026-11-05T12:00:00Z'));
    expect(formatted).toContain('2026');
    expect(formatted.toLowerCase()).toContain('nov');
  });

  it('getLastUpdateISO returns ISO string without throwing', () => {
    const iso = getLastUpdateISO('src/content/classes/ingenieria-de-software');
    expect(typeof iso).toBe('string');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}/);

    const nonExistent = getLastUpdateISO('non-existent-path-xyz');
    expect(typeof nonExistent).toBe('string');
    expect(nonExistent).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('getClassUpdatedISO returns ISO string', () => {
    const iso = getClassUpdatedISO('ingenieria-de-software');
    expect(typeof iso).toBe('string');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('formatDateTimeEs formats preserving ISO local time without timezone conversion', () => {
    expect(formatDateTimeEs('2026-11-10T14:32:00-03:00')).toBe('10 nov 2026, 14:32');
    expect(formatDateTimeEs('2026-11-10T23:59:00+09:00')).toBe('10 nov 2026, 23:59');
  });

  it('getRecentTopics(3) returns at most 3 sorted desc with the right fields (using injected data for ordering and ties)', () => {
    const injected = [
      {
        classSlug: 'clase-a',
        classTitle: 'Clase A',
        classColor: 'blue',
        classOrder: 1,
        topicSlug: '01-intro',
        title: 'Intro A',
        topicOrder: 1,
        iso: '2026-11-08T10:00:00Z',
      },
      {
        classSlug: 'clase-b',
        classTitle: 'Clase B',
        classColor: 'teal',
        classOrder: 2,
        topicSlug: '01-tema-b',
        title: 'Tema B1',
        topicOrder: 1,
        iso: '2026-11-10T12:00:00Z',
      },
      {
        classSlug: 'clase-b',
        classTitle: 'Clase B',
        classColor: 'teal',
        classOrder: 2,
        topicSlug: '02-tema-b2',
        title: 'Tema B2',
        topicOrder: 2,
        iso: '2026-11-10T12:00:00Z', // Same time as B1 -> tie broken by topicOrder desc (2 > 1)
      },
      {
        classSlug: 'clase-a',
        classTitle: 'Clase A',
        classColor: 'blue',
        classOrder: 1,
        topicSlug: '02-tema-a2',
        title: 'Tema A2',
        topicOrder: 2,
        iso: '2026-11-10T12:00:00Z', // Same time as B -> tie broken by classOrder desc (2 > 1)
      },
      {
        classSlug: 'clase-c',
        classTitle: 'Clase C',
        classColor: 'rose',
        classOrder: 3,
        topicSlug: '01-tema-c',
        title: 'Tema C',
        topicOrder: 1,
        iso: '2026-11-05T09:00:00Z',
      },
    ];

    const result = getRecentTopics(3, injected);
    expect(result).toHaveLength(3);

    // B2 has same time as B1 and A2, but classOrder: 2, topicOrder: 2 -> first
    // B1 has same time, classOrder: 2, topicOrder: 1 -> second
    // A2 has same time, classOrder: 1, topicOrder: 2 -> third
    expect(result[0]).toEqual({
      classSlug: 'clase-b',
      classTitle: 'Clase B',
      classColor: 'teal',
      topicSlug: '02-tema-b2',
      title: 'Tema B2',
      iso: '2026-11-10T12:00:00Z',
    });
    expect(result[1]).toEqual({
      classSlug: 'clase-b',
      classTitle: 'Clase B',
      classColor: 'teal',
      topicSlug: '01-tema-b',
      title: 'Tema B1',
      iso: '2026-11-10T12:00:00Z',
    });
    expect(result[2]).toEqual({
      classSlug: 'clase-a',
      classTitle: 'Clase A',
      classColor: 'blue',
      topicSlug: '02-tema-a2',
      title: 'Tema A2',
      iso: '2026-11-10T12:00:00Z',
    });
  });

  describe('schema validations', () => {
    it('schema defaults: a class without color/art gets violet/grid', () => {
      const parsed = classSchema.parse({
        title: 'Algoritmos',
        description: 'Curso de algoritmos y estructuras',
        order: 1,
      });
      expect(parsed.color).toBe('violet');
      expect(parsed.art).toBe('grid');
    });

    it('a topic with minutes: 0, minutes: 181 or minutes: 2.5 is rejected', () => {
      expect(() =>
        topicSchema.parse({
          title: 'Tema',
          order: 1,
          minutes: 0,
        })
      ).toThrow();

      expect(() =>
        topicSchema.parse({
          title: 'Tema',
          order: 1,
          minutes: 181,
        })
      ).toThrow();

      expect(() =>
        topicSchema.parse({
          title: 'Tema',
          order: 1,
          minutes: 2.5,
        })
      ).toThrow();

      // Valid minutes should succeed
      const valid = topicSchema.parse({
        title: 'Tema',
        order: 1,
        minutes: 45,
      });
      expect(valid.minutes).toBe(45);
    });
  });
});
