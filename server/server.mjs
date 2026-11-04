import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import { fileURLToPath } from "node:url";

import { cargarDatos } from "./datos.mjs";
import rutasPaises from "./rutas-paises.mjs";
import rutasFavoritos from "./rutas-favoritos.mjs";

const PUERTO = Number.parseInt(process.env.PORT ?? "3000", 10);

// CORS: solo los orígenes listados en la variable de entorno pueden usar la API.
const ORIGENES_PERMITIDOS = (
    process.env.ORIGENES_PERMITIDOS ??
    "http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500"
)
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean);

const CARPETA_PUBLICA = fileURLToPath(new URL("../public/", import.meta.url));

const app = express();

app.disable("x-powered-by");
app.use(compression());

app.use(
    "/api",
    cors({
        origin(origen, devolver) {
            // Sin cabecera Origin = mismo origen o herramientas como curl.
            devolver(null, !origen || ORIGENES_PERMITIDOS.includes(origen));
        },
        methods: ["GET", "POST"]
    })
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/salud", (req, res) => {
    res.status(200).json({ datos: { estado: "ok" } });
});

app.use("/api/paises", rutasPaises);
app.use("/api/favoritos", rutasFavoritos);

app.use("/api", (req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
});

// Frontend estático (útil en local; en producción puede estar en Netlify/Vercel).
app.use(express.static(CARPETA_PUBLICA, { maxAge: "1d" }));

// Manejador de errores: siempre responde JSON con el mismo formato.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "La petición es demasiado grande." });
    }

    console.error("Error no controlado:", err);
    res.status(500).json({ error: "Error interno del servidor." });
});

try {
    await cargarDatos();
    app.listen(PUERTO, () => {
        console.log(`Servidor escuchando en el puerto ${PUERTO}`);
        console.log(`Orígenes permitidos por CORS: ${ORIGENES_PERMITIDOS.join(", ")}`);
    });
} catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
}
