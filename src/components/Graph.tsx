import { useEffect, useRef, useState } from 'preact/hooks';

export interface GraphProps {
  type: 'line' | 'bar' | 'scatter';
  data: { x: number; y: number }[];
  x: string;
  y: string;
  title?: string;
}

export default function Graph({ type, data, x, y, title }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((v) => v + 1);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;

    async function drawPlot() {
      if (!containerRef.current) return;
      const Plot = await import('@observablehq/plot');
      if (!active) return;

      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue('--accent').trim() || '#38bdf8';
      const text = styles.getPropertyValue('--text').trim() || '#f0f6fc';

      let mark;
      if (type === 'line') {
        mark = [
          Plot.line(data, { x: 'x', y: 'y', stroke: accent, strokeWidth: 2.5 }),
          Plot.dot(data, { x: 'x', y: 'y', fill: accent, r: 4 }),
        ];
      } else if (type === 'bar') {
        mark = [Plot.barY(data, { x: 'x', y: 'y', fill: accent, inset: 2 })];
      } else {
        mark = [Plot.dot(data, { x: 'x', y: 'y', fill: accent, r: 5 })];
      }

      const plot = Plot.plot({
        title,
        style: {
          background: 'transparent',
          color: text,
          fontSize: '12px',
        },
        x: {
          label: x,
        },
        y: {
          label: y,
          grid: true,
        },
        marks: mark,
        width: Math.min(600, containerRef.current.clientWidth || 500),
        height: 280,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(plot);
      }
    }

    drawPlot();

    return () => {
      active = false;
    };
  }, [type, data, x, y, title, themeVersion]);

  return (
    <div class="my-6 p-4 rounded-xl bg-surface-2 not-prose overflow-x-auto">
      <div ref={containerRef} class="flex justify-center" />
    </div>
  );
}
