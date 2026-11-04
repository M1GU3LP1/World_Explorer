import { obtenerCodigoPais } from "./utils.mjs";

let globo;
let codigoSeleccionado = null;

const COLOR_NORMAL = "rgba(200, 200, 200, 0.7)";
const COLOR_SELECCIONADO = "rgba(56, 189, 248, 0.85)";
const ALTITUD_NORMAL = 0.01;
const ALTITUD_SELECCIONADA = 0.06;

function crearAccessorColor() {
    return (feature) => {
        const codigo = obtenerCodigoPais(feature);
        return codigo && codigo === codigoSeleccionado
            ? COLOR_SELECCIONADO
            : COLOR_NORMAL;
    };
}

function crearAccessorAltitud() {
    return (feature) => {
        const codigo = obtenerCodigoPais(feature);
        return codigo && codigo === codigoSeleccionado
            ? ALTITUD_SELECCIONADA
            : ALTITUD_NORMAL;
    };
}

function actualizarResaltado() {
    if (!globo) {
        return;
    }

    globo
        .polygonCapColor(crearAccessorColor())
        .polygonAltitude(crearAccessorAltitud());
}

export function resaltarPaisEnGlobo(codigo) {
    codigoSeleccionado = codigo;
    actualizarResaltado();

    if (globo) {
        globo.controls().autoRotate = false;
    }
}

export function quitarResaltadoEnGlobo() {
    codigoSeleccionado = null;
    actualizarResaltado();

    if (globo) {
        globo.controls().autoRotate = true;
    }
}

export async function inicializarGlobo(contenedor, alSeleccionarPais, alFallarCarga, alClicVacio) {
    try {
        const respuesta = await fetch(
            "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datosGeoJSON = await respuesta.json();

        globo = Globe()(contenedor)
            .width(contenedor.clientWidth)
            .height(contenedor.clientHeight)
            .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
            .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
            .polygonsData(datosGeoJSON.features)
            .polygonAltitude(crearAccessorAltitud())
            .polygonCapColor(crearAccessorColor())
            .polygonSideColor(() => "rgba(100, 100, 100, 0.3)")
            .polygonStrokeColor(() => "#ffffff")
            .polygonsTransitionDuration(300)
            .onPolygonClick((pais) => {
                const codigo = obtenerCodigoPais(pais);

                if (codigo) {
                    alSeleccionarPais(codigo);
                }
            })
            .onGlobeClick(() => {
                if (alClicVacio) {
                    alClicVacio();
                }
            });

        globo.controls().autoRotate = true;
        globo.controls().autoRotateSpeed = 0.5;

        // El globo se ajusta cuando cambia el tamaño de su contenedor (celular, giro de pantalla, F12)
        new ResizeObserver(() => {
            globo.width(contenedor.clientWidth).height(contenedor.clientHeight);
        }).observe(contenedor);

        return globo;
    } catch (error) {
        console.error("Error inicializando el globo:", error);

        if (alFallarCarga) {
            alFallarCarga(error);
        }

        throw error;
    }
}
