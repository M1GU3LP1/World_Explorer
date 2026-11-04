import { readFile } from "node:fs/promises";

const RUTA_DATOS = new URL("../data/countries.json", import.meta.url);

let paises = {};

export async function cargarDatos() {
    const crudo = await readFile(RUTA_DATOS, "utf-8");
    paises = JSON.parse(crudo);
    return paises;
}

export function obtenerTodos() {
    return paises;
}

export function obtenerPorCodigo(codigo) {
    return Object.hasOwn(paises, codigo) ? paises[codigo] : null;
}
