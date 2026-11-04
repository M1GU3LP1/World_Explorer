import { borrarFavoritos } from "./favorites.mjs";


const CLAVE_PREFERENCIAS = "world-explorer:preferencias";
const CLAVE_SESION = "world-explorer:sesion";
const TEMAS_VALIDOS = ["dark", "light"];
const TEMA_POR_DEFECTO = "dark";

function obtenerAlmacen(tipo) {
    return tipo === "sesion" ? window.sessionStorage : window.localStorage;
}

function leerObjeto(tipo, clave) {
    try {
        const crudo = obtenerAlmacen(tipo).getItem(clave);
        if (crudo === null) {
            return {};
        }

        const valor = JSON.parse(crudo);

        return valor !== null && typeof valor === "object" && !Array.isArray(valor)
            ? valor
            : {};
    } catch (error) {
        console.error(`Error leyendo "${clave}" del almacenamiento:`, error);
        return {};
    }
}

function escribirObjeto(tipo, clave, objeto) {
    try {
        obtenerAlmacen(tipo).setItem(clave, JSON.stringify(objeto));
    } catch (error) {
        console.error(`Error guardando "${clave}" en el almacenamiento:`, error);
    }
}


export function obtenerTema() {
    const { tema } = leerObjeto("local", CLAVE_PREFERENCIAS);
    return TEMAS_VALIDOS.includes(tema) ? tema : TEMA_POR_DEFECTO;
}

export function guardarTema(tema) {
    if (!TEMAS_VALIDOS.includes(tema)) {
        return;
    }

    const preferencias = leerObjeto("local", CLAVE_PREFERENCIAS);
    escribirObjeto("local", CLAVE_PREFERENCIAS, { ...preferencias, tema });
}

export function aplicarTema(tema) {
    document.documentElement.setAttribute("data-bs-theme", tema);
}

export function obtenerUltimoPais() {
    const { ultimoPais } = leerObjeto("sesion", CLAVE_SESION);
    return typeof ultimoPais === "string" ? ultimoPais : null;
}

export function guardarUltimoPais(codigo) {
    if (codigo === null) {
        try {
            window.sessionStorage.removeItem(CLAVE_SESION);
        } catch (error) {
            console.error("Error borrando la sesión:", error);
        }
        return;
    }

    escribirObjeto("sesion", CLAVE_SESION, { ultimoPais: codigo });
}

export function borrarDatosGuardados() {
    borrarFavoritos();

    try {
        window.localStorage.removeItem(CLAVE_PREFERENCIAS);
        window.sessionStorage.removeItem(CLAVE_SESION);
    } catch (error) {
        console.error("Error borrando los datos guardados:", error);
    }
}
