import { obtenerPaisesApi, obtenerPaisApi } from "./api.mjs";

let paises = {};

// Carga la lista completa desde el backend (se usa para el buscador y favoritos).
export async function cargarPaises() {
    paises = await obtenerPaisesApi();
    return paises;
}

// Consulta un país al backend (se usa al seleccionar uno).
export function cargarPais(codigo) {
    return obtenerPaisApi(codigo);
}

export function obtenerPais(codigo) {
    return Object.hasOwn(paises, codigo) ? paises[codigo] : null;
}

export function obtenerTodosLosPaises() {
    return paises;
}
