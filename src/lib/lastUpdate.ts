import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

export function getLastUpdateISO(pathFromRepoRoot: string): string {
  const normalizedPath = pathFromRepoRoot.replace(/\\/g, '/');
  const fullPath = path.resolve(process.cwd(), normalizedPath);

  // 1. Intentar obtener la fecha ISO del último commit en git
  try {
    const gitOutput = execSync(`git log -1 --format=%cI -- "${normalizedPath}"`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (gitOutput) {
      const gitDate = new Date(gitOutput);
      if (!isNaN(gitDate.getTime())) {
        return gitOutput;
      }
    }
  } catch {
    // Si falla git, continuar con el respaldo por mtime
  }

  // 2. Respaldo: fecha de modificación (mtime) más reciente con offset local
  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        let newestMtime = stat.mtimeMs;
        const scanDir = (dir: string) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            const entryStat = fs.statSync(entryPath);
            if (entryStat.mtimeMs > newestMtime) {
              newestMtime = entryStat.mtimeMs;
            }
            if (entryStat.isDirectory()) {
              scanDir(entryPath);
            }
          }
        };
        scanDir(fullPath);
        return toLocalISOString(new Date(newestMtime));
      } else {
        return toLocalISOString(stat.mtime);
      }
    }
  } catch {
    // Si ocurre cualquier error, continuar al retorno por defecto
  }

  // 3. Si no existe o hubo error, nunca lanzar excepción
  return toLocalISOString(new Date());
}

export function getClassUpdatedISO(classSlug: string): string {
  return getLastUpdateISO(`src/content/classes/${classSlug}`);
}

export function getLastUpdate(classSlug: string): Date {
  const iso = getClassUpdatedISO(classSlug);
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatDateEs(d: Date): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateTimeEs(iso: string): string {
  if (!iso || typeof iso !== 'string') return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (!match) return '';

  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const monthName = MONTHS_ES[monthIndex] ?? '';
  const hour = match[4];
  const minute = match[5];

  if (hour !== undefined && minute !== undefined) {
    return `${day} ${monthName} ${year}, ${hour}:${minute}`;
  }
  return `${day} ${monthName} ${year}`;
}

export interface RecentTopicItem {
  classSlug: string;
  classTitle: string;
  classColor: string;
  topicSlug: string;
  title: string;
  iso: string;
}

export interface TopicInputForRecent {
  classSlug: string;
  classTitle: string;
  classColor?: string;
  classOrder?: number;
  topicSlug: string;
  title: string;
  topicOrder?: number;
  iso: string;
}

export function getRecentTopics(
  limit = 6,
  injectedOrOptions?: TopicInputForRecent[] | { root?: string; items?: TopicInputForRecent[] }
): RecentTopicItem[] {
  let itemsWithMetadata: TopicInputForRecent[] = [];

  if (Array.isArray(injectedOrOptions)) {
    itemsWithMetadata = [...injectedOrOptions];
  } else if (injectedOrOptions && 'items' in injectedOrOptions && injectedOrOptions.items) {
    itemsWithMetadata = [...injectedOrOptions.items];
  } else {
    const root =
      injectedOrOptions && 'root' in injectedOrOptions && injectedOrOptions.root
        ? injectedOrOptions.root
        : process.cwd();
    const classesDir = path.join(root, 'src', 'content', 'classes');

    if (fs.existsSync(classesDir)) {
      const classEntries = fs.readdirSync(classesDir, { withFileTypes: true });
      for (const entry of classEntries) {
        if (!entry.isDirectory()) continue;
        const classSlug = entry.name;
        const classDir = path.join(classesDir, classSlug);
        const classYamlPath = path.join(classDir, 'class.yaml');

        let classTitle = classSlug;
        let classColor = 'violet';
        let classOrder = 0;

        if (fs.existsSync(classYamlPath)) {
          try {
            const rawYaml = fs.readFileSync(classYamlPath, 'utf8');
            const parsed = yaml.parse(rawYaml);
            if (parsed) {
              if (parsed.title) classTitle = parsed.title;
              if (parsed.color) classColor = parsed.color;
              if (typeof parsed.order === 'number') classOrder = parsed.order;
            }
          } catch {
            // ignore
          }
        }

        const files = fs.readdirSync(classDir, { withFileTypes: true });
        for (const file of files) {
          if (!file.name.endsWith('.mdx')) continue;
          const topicSlug = file.name.replace(/\.mdx$/, '');
          const topicPath = path.join(classDir, file.name);

          let title = topicSlug;
          let topicOrder = 0;

          try {
            const content = fs.readFileSync(topicPath, 'utf8');
            const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
            if (fmMatch) {
              const fm = yaml.parse(fmMatch[1]);
              if (fm) {
                if (fm.title) title = fm.title;
                if (typeof fm.order === 'number') topicOrder = fm.order;
              }
            }
          } catch {
            // ignore
          }

          const relPath = `src/content/classes/${classSlug}/${file.name}`;
          const iso = getLastUpdateISO(relPath);

          itemsWithMetadata.push({
            classSlug,
            classTitle,
            classColor,
            classOrder,
            topicSlug,
            title,
            topicOrder,
            iso,
          });
        }
      }
    }
  }

  itemsWithMetadata.sort((a, b) => {
    const timeA = new Date(a.iso).getTime();
    const timeB = new Date(b.iso).getTime();
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    const classOrderA = a.classOrder ?? 0;
    const classOrderB = b.classOrder ?? 0;
    if (classOrderB !== classOrderA) {
      return classOrderB - classOrderA;
    }
    const topicOrderA = a.topicOrder ?? 0;
    const topicOrderB = b.topicOrder ?? 0;
    return topicOrderB - topicOrderA;
  });

  return itemsWithMetadata.slice(0, limit).map((item) => ({
    classSlug: item.classSlug,
    classTitle: item.classTitle,
    classColor: item.classColor ?? 'violet',
    topicSlug: item.topicSlug,
    title: item.title,
    iso: item.iso,
  }));
}
