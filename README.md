# Apuntes

Sitio web estático para alojar y consultar apuntes universitarios de informática. Está construido con Astro, MDX, Tailwind CSS y componentes interactivos, priorizando el modo oscuro y una lectura moderna.

## Cómo ejecutar el proyecto

### Requisitos previos
- Node.js (versión LTS recomendada, 18+)
- npm

### Instalación
Instalar las dependencias exactas del proyecto:
```bash
npm install
```

### Desarrollo local
Iniciar el servidor de desarrollo local:
```bash
npm run dev
```

### Compilación para producción
Generar la versión estática del sitio para distribución:
```bash
npm run build
```

### Verificación del proyecto
Ejecutar la comprobación estática de tipos y la compilación:
```bash
npm run check
```

## Publicar

Para desplegar el sitio automáticamente en GitHub Pages mediante GitHub Actions:

1. **Crear el repositorio en GitHub**: Crear un repositorio público en GitHub y vincularlo como remoto del proyecto local.
2. **Subir a la rama principal**:
   ```bash
   git push -u origin main
   ```
3. **Activar GitHub Pages**:
   - En el repositorio de GitHub, navegar a **Settings** > **Pages**.
   - En la sección **Build and deployment** > **Source**, seleccionar **GitHub Actions**.
4. **URL del sitio**: El flujo de trabajo configurado en `.github/workflows/deploy.yml` compilará e indexará el sitio. La URL del sitio publicado aparecerá en **Settings** > **Pages** y en la pestaña **Deployments** (habitualmente `https://<usuario>.github.io/<repositorio>/`).

## Añadir apuntes

Para agregar nuevos apuntes a partir de material de estudio o diapositivas:

1. Colocar el archivo PDF del tema o clase dentro de la carpeta `inbox/`.
2. Proporcionar al agente de IA las instrucciones de estilo y formato descritas en [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md).
3. Ejecutar la verificación completa (validación de contenido, comprobación de tipos y build de prueba con Pagefind):
   ```bash
   npm run check
   ```
4. Confirmar los cambios y subirlos a la rama `main`:
   ```bash
   git add .
   git commit -m "Contenido: agregar nuevo tema"
   git push
   ```
