// Único lugar donde se define la URL del backend.
// En local usa el servidor de tu computador; en producción, el publicado en Render.

const ES_ENTORNO_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

// TODO: reemplaza por la URL real de tu servicio en Render.
const URL_BACKEND_PRODUCCION = "https://world-explorer-gmqw.onrender.com";


export const API_BASE_URL = ES_ENTORNO_LOCAL
    ? "http://localhost:3000"
    : URL_BACKEND_PRODUCCION;
