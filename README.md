# Mis Fichas de Estudio 📚

App web para consultar tus fichas de estudio (en PDF) desde el móvil, organizadas
por temas y subtemas. Se **actualiza sola**: cuando subes un PDF nuevo a GitHub,
aparece en la app en menos de un minuto.

---

## Cómo funciona (en 1 frase)

Cada **carpeta** dentro de `Temas/` es un tema; cada **PDF** dentro es una ficha.
Puedes anidar carpetas todo lo que quieras (`Temas/Historia/España/…`).

---

## Puesta en marcha (solo una vez)

1. Crea un repositorio nuevo en GitHub (público) y sube todo el contenido de esta
   carpeta (arrastra los archivos y carpetas a la página del repo, o usa GitHub
   Desktop). La rama debe llamarse `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Espera ~1 minuto. En **Settings → Pages** aparecerá la dirección pública
   (algo como `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`). Ábrela en el móvil.
4. En el móvil, menú del navegador → **“Añadir a pantalla de inicio”**. Ya tienes
   la app instalada como un icono más.

## Cómo añadir una ficha nueva (tú mismo, sin ayuda)

La forma más cómoda: **desde la propia app**. Pulsa el botón **“＋ Añadir”** (arriba a la
derecha). Te recuerda cómo nombrar el PDF y te da un botón por cada tema que **abre
directamente la pantalla de subida de GitHub** en esa carpeta. Ahí arrastras el PDF,
pulsas **Commit changes**, y en ~1 minuto la ficha aparece en la app. Funciona igual
desde el móvil o desde el ordenador.

Reglas del formato (siempre iguales):
1. Un PDF = una ficha.
2. Nombre del archivo: `Título (fechas).pdf` — p. ej. `Napoleón (1769–1821).pdf`.
   Las fechas entre paréntesis son opcionales y se muestran como subtítulo.
3. El PDF va dentro de la carpeta del tema, en `Temas/…`.

Alternativas equivalentes:
- **GitHub Desktop:** copia el PDF a su carpeta dentro de `Temas/` → **Commit** → **Push**.
- **Web de GitHub:** entra en la carpeta del tema → **Add file → Upload files**.

## Cómo crear un tema o subtema nuevo

Crea una carpeta dentro de `Temas/` (o dentro de otra carpeta, para anidar).
En GitHub se crea una carpeta subiendo un archivo con la ruta, p. ej. escribiendo
`Historia/Guerras Mundiales/` antes del nombre del archivo al subirlo.

---

## Estructura del proyecto

```
Temas/                     ← TODO tu contenido va aquí
  Historia/
    Guerra Civil Española (1923–1939).pdf
  Escritores/
    George Orwell (1903–1950).pdf
  Personajes/
    Marie Curie (1867–1934).pdf
    Henry Ford (1863–1947).pdf

index.html                 ← la app (no hay que tocar nada)
sw.js, manifest.webmanifest ← para instalarla en el móvil
assets/pdfjs/              ← visor de PDF incluido (funciona sin internet)
scripts/build-manifest.mjs ← genera el índice de fichas automáticamente
.github/workflows/deploy.yml ← publica la app sola en cada cambio
data.json                  ← índice generado (no editar a mano)
```

No hace falta editar `data.json` ni ningún archivo de código: solo añadir PDFs.
