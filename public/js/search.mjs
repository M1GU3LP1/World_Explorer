import { obtenerTodosLosPaises } from "./countries.mjs";
import { normalizarTexto, crearBandera } from "./utils.mjs";

let entradaBusqueda;
let selectorRegion;
let listaResultados;
let alSeleccionarPaisCallback;

export function inicializarBuscador(alSeleccionarPais) {
    entradaBusqueda = document.getElementById("buscar-pais");
    selectorRegion = document.getElementById("filtro-region");
    listaResultados = document.getElementById("lista-resultados");
    alSeleccionarPaisCallback = alSeleccionarPais;

    if (!entradaBusqueda || !selectorRegion || !listaResultados) {
        console.warn("El buscador no se pudo inicializar: faltan elementos en el DOM.");
        return;
    }

    poblarRegiones();
    renderizarResultados();

    entradaBusqueda.addEventListener("input", renderizarResultados);
    selectorRegion.addEventListener("change", renderizarResultados);
    listaResultados.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-codigo]");

        if (!boton) {
            return;
        }

        alSeleccionarPaisCallback(boton.dataset.codigo);
    });
}

function poblarRegiones() {
    const paises = obtenerTodosLosPaises();

    const regiones = [
        ...new Set(Object.values(paises).map((pais) => pais.region))
    ].sort();

    for (const region of regiones) {
        const opcion = document.createElement("option");
        opcion.value = region;
        opcion.textContent = region;
        selectorRegion.appendChild(opcion);
    }
}

function renderizarResultados() {
    const paises = obtenerTodosLosPaises();
    const texto = normalizarTexto(entradaBusqueda.value.trim());
    const region = selectorRegion.value;

    const coincidencias = Object.entries(paises).filter(([codigo, pais]) => {
        const coincideTexto =
            texto === "" ||
            normalizarTexto(pais.name).includes(texto) ||
            normalizarTexto(codigo).includes(texto);

        const coincideRegion = region === "" || pais.region === region;

        return coincideTexto && coincideRegion;
    });

    listaResultados.textContent = "";

    if (coincidencias.length === 0) {
        const vacio = document.createElement("li");
        vacio.className = "list-group-item text-body-secondary small";
        vacio.textContent = "Sin resultados para esa búsqueda.";
        listaResultados.appendChild(vacio);
        return;
    }

    for (const [codigo, pais] of coincidencias) {
        const item = document.createElement("li");
        item.className = "list-group-item p-0";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.dataset.codigo = codigo;
        boton.className = "resultado-item btn text-start w-100 d-flex align-items-center gap-2";

        const nombre = document.createElement("span");
        nombre.textContent = `${pais.name} — ${pais.region}`;

        boton.appendChild(crearBandera(pais, 24));
        boton.appendChild(nombre);
        item.appendChild(boton);
        listaResultados.appendChild(item);
    }
}
