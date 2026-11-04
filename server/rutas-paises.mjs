import { Router } from "express";
import { obtenerTodos, obtenerPorCodigo } from "./datos.mjs";

// Código ISO 3166-1 alfa-3: exactamente tres letras mayúsculas (ej. COL, JPN).
export const CODIGO_ISO3 = /^[A-Z]{3}$/;

const router = Router();

// GET /api/paises -> todos los países, indexados por código
router.get("/", (req, res) => {
    res.status(200).json({ datos: obtenerTodos() });
});

// GET /api/paises/:codigo -> un país
router.get("/:codigo", (req, res) => {
    const codigo = req.params.codigo.toUpperCase();

    if (!CODIGO_ISO3.test(codigo)) {
        return res.status(400).json({
            error: "El código del país debe tener 3 letras (ISO 3166-1 alfa-3)."
        });
    }

    const pais = obtenerPorCodigo(codigo);

    if (!pais) {
        return res.status(404).json({
            error: `No existe información para el país ${codigo}.`
        });
    }

    res.status(200).json({ datos: pais });
});

export default router;
