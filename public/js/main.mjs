import { cargarPaises, cargarPais } from "./countries.mjs";
import { ErrorApi, validarFavoritosApi } from "./api.mjs";
import { inicializarGlobo, resaltarPaisEnGlobo, quitarResaltadoEnGlobo } from "./globe.mjs";
import {
    mostrarInformacion,
    mostrarMensaje,
    mostrarError,
    ocultarError,
    mostrarEstado,
    mostrarCarga,
    ocultarCarga,
    limpiarInformacion,
    inicializarBotonFavorito,
    inicializarListaFavoritos,
    inicializarBotonTema,
    inicializarBotonBorrarDatos,
    actualizarBotonTema,
    renderizarFavoritos
} from "./ui.mjs";
import { inicializarBuscador } from "./search.mjs";
import { alternarFavorito, obtenerFavoritos, reemplazarFavoritos } from "./favorites.mjs";
import {
    aplicarTema,
    obtenerTema,
    obtenerUltimoPais,
    guardarUltimoPais,
    borrarDatosGuardados
} from "./preferencias.mjs";

const MAX_FAVORITOS_A_VALIDAR = 250;

let paisSeleccionadoActual = null;
let numeroSolicitud = 0;

async function iniciarAplicacion() {
    inicializarBotonTema();

    try {
        mostrarCarga("Conectando con el servidor… si estaba en reposo, puede tardar hasta un minuto.");
        await cargarPaises();
        ocultarCarga();

        await sanearFavoritos();

        inicializarBuscador(seleccionarPais);
        inicializarBotonFavorito(alternarFavoritoDelPaisActual);
        inicializarListaFavoritos(seleccionarPais, quitarFavorito);
        inicializarBotonBorrarDatos(borrarDatosDelUsuario);

        const contenedorGlobo = document.getElementById("globeViz");

        if (!contenedorGlobo) {
            throw new Error("No se encontró el contenedor del globo.");
        }

        try {
            await inicializarGlobo(
                contenedorGlobo,
                seleccionarPais,
                () => mostrarError(
                    "No se pudo cargar el globo 3D (falló la conexión a la API de mapas). " +
                    "Puedes seguir usando el buscador de países."
                ),
                deseleccionarPais
            );
        } catch (errorGlobo) {
            console.error("El globo 3D no se pudo iniciar:", errorGlobo);
        }

        
        const ultimoPais = obtenerUltimoPais();

        if (ultimoPais) {
            await seleccionarPais(ultimoPais);
        }
    } catch (error) {
        console.error("No se pudo iniciar la aplicación:", error);

        ocultarCarga();
        mostrarMensaje("No se pudo cargar la aplicación.");
        mostrarError(
            error instanceof ErrorApi
                ? error.message
                : "Ocurrió un problema cargando los datos. Revisa tu conexión e intenta recargar la página."
        );
    }
}


async function sanearFavoritos() {
    const guardados = [...new Set(obtenerFavoritos())].slice(0, MAX_FAVORITOS_A_VALIDAR);

    if (guardados.length === 0) {
        return;
    }

    try {
        const { validos } = await validarFavoritosApi(guardados);
        reemplazarFavoritos(validos);
    } catch (error) {
        console.warn("No se pudieron validar los favoritos guardados:", error.message);
    }
}

async function seleccionarPais(codigo) {
    if (codigo === paisSeleccionadoActual) {
        deseleccionarPais();
        return;
    }

    const solicitud = ++numeroSolicitud;
    mostrarCarga("Consultando información del país…");

    try {
        const pais = await cargarPais(codigo);

        if (solicitud !== numeroSolicitud) {
            return; 
        }

        paisSeleccionadoActual = codigo;
        resaltarPaisEnGlobo(codigo);
        guardarUltimoPais(codigo);

        ocultarError();
        mostrarInformacion(pais, codigo);
    } catch (error) {
        if (solicitud !== numeroSolicitud) {
            return;
        }

        console.error(`No se pudo obtener el país ${codigo}:`, error);

        if (error instanceof ErrorApi && error.estado === 404) {
            reiniciarSeleccion();
            mostrarMensaje("No existe información para este país.");
        } else {
            mostrarError(
                error instanceof ErrorApi
                    ? error.message
                    : "Ocurrió un problema inesperado al consultar el país."
            );
        }
    } finally {
        if (solicitud === numeroSolicitud) {
            ocultarCarga();
        }
    }
}

function reiniciarSeleccion() {
    paisSeleccionadoActual = null;
    quitarResaltadoEnGlobo();
    guardarUltimoPais(null);
    limpiarInformacion();
}

function deseleccionarPais() {
    if (!paisSeleccionadoActual) {
        return;
    }

    numeroSolicitud++;
    ocultarCarga();
    reiniciarSeleccion();
}

function alternarFavoritoDelPaisActual(codigo) {
    alternarFavorito(codigo);
    renderizarFavoritos();
}

function quitarFavorito(codigo) {
    alternarFavorito(codigo);
}

function borrarDatosDelUsuario() {
    borrarDatosGuardados();

    aplicarTema(obtenerTema());
    actualizarBotonTema();

    deseleccionarPais();
    renderizarFavoritos();
    mostrarEstado("Se borraron tus favoritos, el tema y la última visita guardados en este navegador.");
}

iniciarAplicacion();
