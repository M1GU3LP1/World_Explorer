const CLAVE_ALMACENAMIENTO = "world-explorer:favoritos";

function leerFavoritos() {
    try {
        const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);

        // Primera visita: no hay nada guardado todavía (null)
        if (crudo === null) {
            return [];
        }

        const lista = JSON.parse(crudo);

        return Array.isArray(lista)
            ? lista.filter((codigo) => typeof codigo === "string")
            : [];
    } catch (error) {
        console.error("Error leyendo favoritos de localStorage:", error);
        return [];
    }
}

function guardarFavoritos(lista) {
    try {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(lista));
    } catch (error) {
        console.error("Error guardando favoritos en localStorage:", error);
    }
}

export function esFavorito(codigo) {
    return leerFavoritos().includes(codigo);
}

export function alternarFavorito(codigo) {
    const favoritos = leerFavoritos();
    const indice = favoritos.indexOf(codigo);

    if (indice === -1) {
        favoritos.push(codigo);
    } else {
        favoritos.splice(indice, 1);
    }

    guardarFavoritos(favoritos);
    return favoritos;
}

export function obtenerFavoritos() {
    return leerFavoritos();
}

export function reemplazarFavoritos(lista) {
    guardarFavoritos(lista);
}

export function borrarFavoritos() {
    try {
        localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    } catch (error) {
        console.error("Error borrando favoritos:", error);
    }
}
