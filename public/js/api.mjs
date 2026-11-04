import { API_BASE_URL } from "./config.mjs";

export class ErrorApi extends Error {
    constructor(mensaje, estado = 0) {
        super(mensaje);
        this.name = "ErrorApi";
        this.estado = estado;
    }
}

// Función central
async function solicitar(ruta, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(`${API_BASE_URL}${ruta}`, opciones);
    } catch (error) {
        console.error("Fallo de red al llamar a la API:", error);
        throw new ErrorApi(
            "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
            0
        );
    }

    let cuerpo = null;

    try {
        cuerpo = await respuesta.json();
    } catch {
        // La respuesta no traía JSON; se maneja abajo según response.ok
    }

    if (!respuesta.ok) {
        throw new ErrorApi(
            cuerpo?.error ?? `El servidor respondió con un error (${respuesta.status}).`,
            respuesta.status
        );
    }

    if (!cuerpo || cuerpo.datos === undefined) {
        throw new ErrorApi("El servidor devolvió una respuesta inesperada.", respuesta.status);
    }

    return cuerpo.datos;
}

// GET /api/paises
export function obtenerPaisesApi() {
    return solicitar("/api/paises");
}

// GET /api/paises/:codigo
export function obtenerPaisApi(codigo) {
    return solicitar(`/api/paises/${encodeURIComponent(codigo)}`);
}

// POST /api/favoritos/validar
export function validarFavoritosApi(codigos) {
    return solicitar("/api/favoritos/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigos })
    });
}
