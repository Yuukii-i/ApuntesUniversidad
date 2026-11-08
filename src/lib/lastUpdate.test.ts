import { describe, it, expect } from 'vitest';
import { getLastUpdate, formatDateEs } from './lastUpdate';

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
});
