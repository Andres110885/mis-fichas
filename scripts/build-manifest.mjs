#!/usr/bin/env node
// Escanea la carpeta Temas/ de forma recursiva y genera data.json con el
// árbol completo de temas (carpetas) y fichas (PDFs).
// No hay que tocar este archivo: al añadir/quitar PDFs, se regenera solo.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, basename, extname } from "node:path";

const ROOT = "Temas";            // carpeta raíz de contenido
const OUT = "data.json";

// Convierte "Guerra Civil Española (1923–1939).pdf" en
//   { title: "Guerra Civil Española", subtitle: "1923–1939" }
function parseName(fileName) {
  const stem = basename(fileName, extname(fileName)).trim();
  const m = stem.match(/^(.*?)[\s·\-–—]*\(([^()]*)\)\s*$/);
  if (m && m[1].trim()) {
    return { title: m[1].trim(), subtitle: m[2].trim() };
  }
  return { title: stem, subtitle: "" };
}

// Título legible para una carpeta a partir de su nombre
function folderTitle(name) {
  return name.replace(/[_]+/g, " ").trim();
}

function walk(absDir) {
  const entries = readdirSync(absDir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith(".")) // ignora ocultos
    .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));

  const folders = [];
  const fichas = [];

  for (const e of entries) {
    const abs = join(absDir, e.name);
    if (e.isDirectory()) {
      const child = walk(abs);
      folders.push({
        type: "folder",
        name: folderTitle(e.name),
        path: relative(".", abs).split("\\").join("/"),
        folders: child.folders,
        fichas: child.fichas,
        counts: child.counts,
      });
    } else if (extname(e.name).toLowerCase() === ".pdf") {
      const { title, subtitle } = parseName(e.name);
      fichas.push({
        type: "ficha",
        title,
        subtitle,
        path: relative(".", abs).split("\\").join("/"),
        size: statSync(abs).size,
      });
    }
  }

  // Cuenta agregada (fichas totales bajo este nodo, recursivo)
  let totalFichas = fichas.length;
  for (const f of folders) totalFichas += f.counts.fichas;
  const counts = { fichas: totalFichas, subtemas: folders.length };

  return { folders, fichas, counts };
}

let tree;
try {
  tree = walk(ROOT);
} catch (err) {
  console.error(`No se pudo leer la carpeta "${ROOT}/":`, err.message);
  tree = { folders: [], fichas: [], counts: { fichas: 0, subtemas: 0 } };
}

const data = {
  generatedAt: new Date().toISOString(),
  root: ROOT,
  folders: tree.folders,
  fichas: tree.fichas,
  counts: tree.counts,
};

writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(
  `data.json generado · ${data.counts.fichas} fichas · ${data.folders.length} temas de primer nivel`
);
