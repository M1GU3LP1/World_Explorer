import { obtenerPais } from "./countries.mjs";
import { esFavorito, obtenerFavoritos } from "./favorites.mjs";
import { obtenerTema, guardarTema, aplicarTema } from "./preferencias.mjs";
import { crearBandera } from "./utils.mjs";

let codigoPaisActual = null;
let temporizadorEstado = null;

// ============================================
// INFORMACIÓN DEL PAÍS
// ============================================

export function mostrarInformacion(pais, codigo) {
    if (!pais) {
        mostrarMensaje("No se encontró información del país.");
        return;
    }

    codigoPaisActual = codigo || null;

    document.getElementById("country-name").textContent = pais.name;
    document.getElementById("official-name").textContent = pais.officialName;
    document.getElementById("capital").textContent = pais.capital;
    document.getElementById("population").textContent =
        pais.population.toLocaleString("es-CO");
    document.getElementById("region").textContent = pais.region;
    document.getElementById("languages").textContent = pais.languages.join(", ");
    document.getElementById("currency").textContent = pais.currency;

    const contenedorBandera = document.getElementById("flag");
    contenedorBandera.textContent = "";
    contenedorBandera.appendChild(crearBandera(pais, 80));

    actualizarBotonFavorito();
}

export function mostrarMensaje(mensaje) {
    const elemento = document.getElementById("country-name");

    if (elemento) {
        elemento.textContent = mensaje;
    }
}

export function limpiarInformacion() {
    codigoPaisActual = null;

    mostrarMensaje("Selecciona un país");

    for (const id of ["official-name", "capital", "population", "region", "languages", "currency"]) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = "";
        }
    }

    const contenedorBandera = document.getElementById("flag");
    if (contenedorBandera) {
        contenedorBandera.textContent = "";
    }

    actualizarBotonFavorito();
}

// ============================================
// RETROALIMENTACIÓN: errores, estados y carga
// ============================================

export function mostrarError(mensaje) {
    const contenedor = document.getElementById("error-banner");

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.hidden = false;
}

export function ocultarError() {
    const contenedor = document.getElementById("error-banner");

    if (contenedor) {
        contenedor.hidden = true;
    }
}

// Mensaje de éxito que desaparece solo a los 5 segundos
export function mostrarEstado(mensaje) {
    const contenedor = document.getElementById("mensaje-estado");

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.hidden = false;

    clearTimeout(temporizadorEstado);
    temporizadorEstado = setTimeout(() => {
        contenedor.hidden = true;
    }, 5000);
}

export function mostrarCarga(texto) {
    const indicador = document.getElementById("indicador-carga");
    const textoCarga = document.getElementById("texto-carga");

    if (!indicador || !textoCarga) {
        return;
    }

    textoCarga.textContent = texto;
    indicador.hidden = false;
}

export function ocultarCarga() {
    const indicador = document.getElementById("indicador-carga");

    if (indicador) {
        indicador.hidden = true;
    }
}

// ============================================
// TEMA CLARO / OSCURO (Bootstrap data-bs-theme)
// ============================================

export function actualizarBotonTema() {
    const boton = document.getElementById("btn-tema");

    if (!boton) {
        return;
    }

    const tema = document.documentElement.getAttribute("data-bs-theme");
    boton.textContent = tema === "dark" ? "☀ Usar tema claro" : "☾ Usar tema oscuro";
}

export function inicializarBotonTema() {
    const boton = document.getElementById("btn-tema");

    if (!boton) {
        return;
    }

    boton.addEventListener("click", () => {
        const actual = document.documentElement.getAttribute("data-bs-theme");
        const nuevo = actual === "dark" ? "light" : "dark";

        aplicarTema(nuevo);
        guardarTema(nuevo);
        actualizarBotonTema();
    });

    aplicarTema(obtenerTema());
    actualizarBotonTema();
}

export function inicializarBotonBorrarDatos(alBorrar) {
    const boton = document.getElementById("btn-borrar-datos");

    if (!boton) {
        return;
    }

    boton.addEventListener("click", () => {
        const confirmado = window.confirm(
            "¿Borrar tus favoritos, el tema elegido y la última visita guardados en este navegador?"
        );

        if (confirmado) {
            alBorrar();
        }
    });
}

// ============================================
// BOTÓN DE FAVORITO
// ============================================

export function inicializarBotonFavorito(alAlternarFavorito) {
    const boton = document.getElementById("btn-favorito");

    if (!boton) {
        return;
    }

    boton.addEventListener("click", () => {
        if (!codigoPaisActual) {
            return;
        }

        alAlternarFavorito(codigoPaisActual);
        actualizarBotonFavorito();

        const pais = obtenerPais(codigoPaisActual);
        const nombre = pais ? pais.name : codigoPaisActual;

        mostrarEstado(
            esFavorito(codigoPaisActual)
                ? `${nombre} se agregó a favoritos.`
                : `${nombre} se quitó de favoritos.`
        );
    });
}

function actualizarBotonFavorito() {
    const boton = document.getElementById("btn-favorito");

    if (!boton) {
        return;
    }

    if (!codigoPaisActual) {
        boton.hidden = true;
        return;
    }

    boton.hidden = false;

    const favorito = esFavorito(codigoPaisActual);

    boton.setAttribute("aria-pressed", String(favorito));
    boton.textContent = favorito
        ? "★ En favoritos"
        : "☆ Agregar a favoritos";
}

// ============================================
// LISTA DE FAVORITOS (delegación de eventos)
// ============================================

export function inicializarListaFavoritos(alSeleccionarPais, alQuitarFavorito) {
    const lista = document.getElementById("lista-favoritos");

    if (!lista) {
        return;
    }

    // El despliegue de la lista lo maneja Bootstrap (collapse) y actualiza aria-expanded.
    lista.addEventListener("click", (evento) => {
        const botonQuitar = evento.target.closest("button[data-quitar]");

        if (botonQuitar) {
            const codigo = botonQuitar.dataset.quitar;
            const pais = obtenerPais(codigo);

            alQuitarFavorito(codigo);
            renderizarFavoritos();
            actualizarBotonFavorito();
            mostrarEstado(`${pais ? pais.name : codigo} se quitó de favoritos.`);
            return;
        }

        const botonPais = evento.target.closest("button[data-codigo]");

        if (botonPais) {
            alSeleccionarPais(botonPais.dataset.codigo);
        }
    });

    renderizarFavoritos();
}

export function renderizarFavoritos() {
    const lista = document.getElementById("lista-favoritos");
    const contador = document.getElementById("contador-favoritos");

    if (!lista) {
        return;
    }

    const codigos = obtenerFavoritos();

    if (contador) {
        contador.textContent = String(codigos.length);
    }

    lista.textContent = "";

    if (codigos.length === 0) {
        const vacio = document.createElement("li");
        vacio.className = "list-group-item text-body-secondary small";
        vacio.textContent = "Aún no tienes países favoritos. Selecciona uno y pulsa «Agregar a favoritos».";
        lista.appendChild(vacio);
        return;
    }

    for (const codigo of codigos) {
        const pais = obtenerPais(codigo);

        if (!pais) {
            continue;
        }

        const item = document.createElement("li");
        item.className = "list-group-item d-flex gap-1 p-1";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "resultado-item btn text-start flex-grow-1 d-flex align-items-center gap-2";
        boton.dataset.codigo = codigo;

        const nombre = document.createElement("span");
        nombre.textContent = pais.name;

        boton.appendChild(crearBandera(pais, 24));
        boton.appendChild(nombre);

        const botonQuitar = document.createElement("button");
        botonQuitar.type = "button";
        botonQuitar.className = "btn btn-danger btn-sm";
        botonQuitar.dataset.quitar = codigo;
        botonQuitar.setAttribute("aria-label", `Quitar ${pais.name} de favoritos`);
        botonQuitar.textContent = "✕";

        item.appendChild(boton);
        item.appendChild(botonQuitar);
        lista.appendChild(item);
    }
}
