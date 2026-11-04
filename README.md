# 🌍 World Explorer

Explorador de países con un globo 3D interactivo. Permite buscar países por nombre o región, ver sus datos (capital, población, idiomas, moneda), guardar favoritos y elegir tema claro u oscuro.

- **Frontend:** HTML + Bootstrap 5.3.3 + JavaScript moderno (módulos `.mjs`) + [globe.gl](https://globe.gl)
- **Backend:** Node.js + Express (API que responde JSON)
- **Publicación:** frontend en Netlify (o Vercel) y backend en Render

| Pieza | URL |
|---|---|
| Aplicación publicada (frontend) | https://6aeb3d63cb9daa8032333fea--flourishing-flan-f83690.netlify.app/|
| API publicada (backend) | https://world-explorer-gmqw.onrender.com/ |

## Cómo ejecutarlo en local

```bash
git clone <URL-del-repositorio>
cd world-explorer
npm install
cp .env.example .env     
npm start
```

Abre <http://localhost:3000>. El servidor Express sirve la API (`/api/...`) y también el frontend de la carpeta `public/`.
Para desarrollo con reinicio automático: `npm run dev`.

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor (Render lo asigna solo). |
| `ORIGENES_PERMITIDOS` | Lista (separada por comas) de orígenes del frontend autorizados por CORS. En producción debe incluir la URL de Netlify/Vercel, sin `/` final. |

Este proyecto no usa claves de APIs de pago; si se agregaran, deben ir en `.env` (ignorado por Git) y en el panel de variables de Render, nunca en el código.

## Endpoints de la API

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api/salud` | Comprueba que el servidor está activo | 200 |
| GET | `/api/paises` | Todos los países, indexados por código ISO alfa-3 | 200 |
| GET | `/api/paises/:codigo` | Datos de un país (ej. `/api/paises/COL`) | 200, 400 (código inválido), 404 (no existe) |
| POST | `/api/favoritos/validar` | Recibe `{ "codigos": ["COL","JPN"] }` y devuelve los códigos que existen | 200, 400 (cuerpo inválido), 413 (muy grande) |

Formato de respuesta: éxito → `{ "datos": ... }`; error → `{ "error": "mensaje" }`.

## Seguridad

- **XSS:** los datos dinámicos se insertan con `textContent` y `createElement`; no se usa `innerHTML`.
- **Validación en el servidor:** el código del país se valida con la expresión `^[A-Z]{3}$`; el cuerpo del POST debe ser una lista de textos de máximo 250 elementos y 10 KB.
- **localStorage no es de fiar:** al cargar, los favoritos guardados se envían al servidor, que descarta los códigos inexistentes.
- **CORS:** solo los orígenes de `ORIGENES_PERMITIDOS` y solo métodos GET/POST.
- **Variables de entorno:** `.env` está en `.gitignore`; el repositorio incluye solo `.env.example`.

## Persistencia en el navegador

| Almacenamiento | Qué guarda | Por qué |
|---|---|---|
| `localStorage` | Países favoritos y tema (claro/oscuro) | Deben recordarse entre visitas |
| `sessionStorage` | Último país visto | Solo importa durante la visita actual |

Los datos se guardan con `JSON.stringify`, se leen con `JSON.parse` manejando el caso `null` (primera visita) y no hay información sensible. El botón **Borrar mis datos guardados** elimina todo.

## Accesibilidad y experiencia de usuario

- Mensajes de éxito, error y estado de carga con texto (`role="status"` / `role="alert"`), no solo color.
- Etiquetas `<label>` ligadas a los campos, enlace «Saltar al buscador», foco visible con teclado.
- `aria-pressed` en el botón de favoritos y `aria-expanded` (gestionado por Bootstrap) en el desplegable de favoritos; `aria-live` en el panel de información.
- Contraste medido (WCAG, mínimo 4.5:1):

| Combinación | Razón |
|---|---|
| Texto `#dee2e6` sobre `#212529` (tema oscuro) | 11.85 : 1 |
| Favoritos `#fde68a` sobre `#212529` (oscuro) | 12.39 : 1 |
| Favoritos `#713f12` sobre `#fef9c3` (claro) | 8.07 : 1 |
| Enlace «Saltar» `#ffffff` sobre `#1d4ed8` | 6.70 : 1 |
| Botón rojo `#ffffff` sobre `#dc3545` | 4.53 : 1 |
| Botón gris `#ffffff` sobre `#6c757d` | 4.69 : 1 |

## Optimización y despliegue

Optimizaciones aplicadas: **minificación** de JS y CSS (`npm run build` con esbuild, une los módulos en un archivo), **compresión gzip** de las respuestas (`compression`) y **carga diferida** de imágenes (`loading="lazy"` en las banderas), además de caché de archivos estáticos.

### Backend en Render
1. Nuevo *Web Service* conectado al repositorio de GitHub.
2. Build command: `npm install` — Start command: `npm start`.
3. Variable de entorno `ORIGENES_PERMITIDOS` = URL del frontend (ej. `https://mi-world-explorer.netlify.app`).

### Frontend en Netlify
1. Nuevo sitio desde el repositorio. Build command: `npm run build` — Publish directory: `dist` (ya definido en `netlify.toml`).
2. Edita `URL_BACKEND_PRODUCCION` en `public/js/config.mjs` con la URL de Render y haz commit.

### Informe de Lighthouse
Ejecútalo sobre la URL publicada (DevTools → pestaña Lighthouse → modo móvil) y pega aquí los resultados y tu análisis.

| Categoría | Puntaje | Análisis / mejora aplicada |
|---|---|---|
| Rendimiento | _pendiente_ | |
| Accesibilidad | _pendiente_ | |
| Prácticas recomendadas | _pendiente_ | |
| SEO | _pendiente_ | |

> Puedes pegar el código del diagrama en <https://mermaid.live> para exportarlo como imagen y usarlo en la sustentación.

## Estructura

```
world-explorer/
├── data/countries.json        
├── public/                   
│   ├── index.html
│   ├── css/styles.css
│   └── js/  main, api, config, countries, search, ui, globe, favorites, preferencias, utils (.mjs)
├── server/                   
│   └── server.mjs, datos.mjs, rutas-paises.mjs, rutas-favoritos.mjs
├── scripts/build.mjs          
├── package.json, netlify.toml, .env.example, .gitignore, README.md
```
