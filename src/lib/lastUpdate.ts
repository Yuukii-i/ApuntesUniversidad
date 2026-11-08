import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function getLastUpdate(classSlug: string): Date {
  const relPath = `src/content/classes/${classSlug}`;
  const fullPath = path.resolve(process.cwd(), relPath);

  // 1. Intentar obtener la fecha del último commit en git
  try {
    const gitOutput = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (gitOutput) {
      const gitDate = new Date(gitOutput);
      if (!isNaN(gitDate.getTime())) {
        return gitDate;
      }
    }
  } catch {
    // Si falla git, continuar con el respaldo por fecha de archivos
  }

  // 2. Respaldo: fecha de modificación (mtime) más reciente de los archivos de la carpeta
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
        return new Date(newestMtime);
      } else {
        return stat.mtime;
      }
    }
  } catch {
    // Si ocurre cualquier error, continuar al retorno por defecto
  }

  // 3. Si no existe la carpeta o hubo error, nunca lanzar excepción
  return new Date();
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
