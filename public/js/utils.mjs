export function obtenerCodigoPais(pais) {
    const propiedades = pais.properties;

    if (propiedades.ISO_A3 && propiedades.ISO_A3 !== "-99") {
        return propiedades.ISO_A3;
    }

    if (propiedades.ADM0_A3 && propiedades.ADM0_A3 !== "-99") {
        return propiedades.ADM0_A3;
    }

    return null;
}

export function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function crearBandera(pais, ancho = 40) {
    const img = document.createElement("img");

    img.className = "bandera-img";
    img.src = `https://flagcdn.com/w${ancho}/${pais.cca2}.png`;
    img.alt = `Bandera de ${pais.name}`;
    img.width = ancho;
    img.loading = "lazy";

    img.addEventListener("error", () => {
        const respaldo = document.createElement("span");
        respaldo.className = "bandera-respaldo";
        respaldo.textContent = pais.flag;
        respaldo.setAttribute("role", "img");
        respaldo.setAttribute("aria-label", `Bandera de ${pais.name}`);
        img.replaceWith(respaldo);
    });

    return img;
}
