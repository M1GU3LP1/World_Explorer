import { Router } from "express";
import { obtenerPorCodigo } from "./datos.mjs";
import { CODIGO_ISO3 } from "./rutas-paises.mjs";

const MAX_CODIGOS = 250;

const router = Router();

// POST /api/favoritos/validar
// Recibe { codigos: ["COL", "JPN"] } (lo guardado en localStorage, que el usuario
// puede alterar) y devuelve solo los códigos que realmente existen.
router.post("/validar", (req, res) => {
    const codigos = req.body?.codigos;

    if (!Array.isArray(codigos)) {
        return res.status(400).json({
            error: "El campo «codigos» debe ser una lista de códigos de país."
        });
    }

    if (codigos.length > MAX_CODIGOS) {
        return res.status(400).json({
            error: `La lista no puede tener más de ${MAX_CODIGOS} códigos.`
        });
    }

    if (!codigos.every((codigo) => typeof codigo === "string")) {
        return res.status(400).json({
            error: "Todos los códigos deben ser texto."
        });
    }

    const unicos = [...new Set(codigos.map((codigo) => codigo.trim().toUpperCase()))];
    const validos = unicos.filter(
        (codigo) => CODIGO_ISO3.test(codigo) && obtenerPorCodigo(codigo) !== null
    );

    res.status(200).json({
        datos: {
            validos,
            descartados: unicos.length - validos.length
        }
    });
});

export default router;
