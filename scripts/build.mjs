// Compila el frontend para producción: minifica JS y CSS y deja todo en /dist.
import { build, transform } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const SALIDA = "dist";

await rm(SALIDA, { recursive: true, force: true });
await mkdir(`${SALIDA}/css`, { recursive: true });

// JavaScript: une los módulos .mjs en un solo archivo minificado (menos peticiones).
await build({
    entryPoints: ["public/js/main.mjs"],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2020",
    outfile: `${SALIDA}/js/main.mjs`
});

// CSS minificado
const css = await readFile("public/css/styles.css", "utf-8");
const { code } = await transform(css, { loader: "css", minify: true });
await writeFile(`${SALIDA}/css/styles.css`, code);

await cp("public/index.html", `${SALIDA}/index.html`);

console.log("Compilación lista en la carpeta dist/");
