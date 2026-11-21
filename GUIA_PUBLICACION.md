# Publicación en GitHub Pages

## Estado actual

El catálogo publica **19 inmuebles** (INM-001 a INM-019, sin huecos). Cada uno tiene su carpeta en el
disco local con el código delante (`INM-008 aptoNormandia`) y su ficha estática
`ficha-INM-XXX.html` con Open Graph propia.

WhatsApp y Facebook **no ejecutan JavaScript**: la vista previa al compartir se sirve de la ficha
estática `ficha-INM-XXX.html`, que lleva sus meta Open Graph propias (`og:title`, `og:image`,
`og:description`) más meta genéricas de respaldo en `ficha.html`.

## Antes de publicar

Este catálogo es un borrador: los inmuebles, descripciones, imágenes y videos deben revisarse y contar con autorización antes de hacerse públicos. GitHub Pages es público; todo archivo dentro de la carpeta de publicación puede descargarse aunque no aparezca enlazado desde la página.

Verifica que la carpeta `docs/` contenga únicamente contenido aprobado. No copies aquí contratos, identificaciones, documentos de propiedad, archivos originales ni las carpetas excluidas del inventario de trabajo. Solo se incluyen videos seleccionados después de revisar su contenido y exportarlos sin audio ni metadatos; los clips con teléfonos, texto promocional u otros datos visibles deben permanecer fuera o editarse antes.

Carpetas que **nunca** se publican (excluidas del inventario): `documentosTrabajoNoPublicar`,
`inmueblesEnEspera`, `inmueblesNoPublicar`, `inmueblesRevision`, `mercadeo`, `presenciaWeb`,
`proyectos`, `zipDescargas`, `inmueblesCompartidosNoPublicar`, `NoPublicar`, `videoNoPublicar`,
`ArchivosTrabajoNoPublicar`, `documentosNoPublicar` y cualquier subcarpeta "No Publicar".

- El informe `informe_diagnostico_plan_trabajo.xlsx` es **interno**: no se copia al repositorio del
  sitio. Se regenera con `gen_informe.py` después de cada cambio de inventario (filas de Inventario,
  Medios y Resumen).
- Los estados y nombres de las carpetas fuente del disco **no se cambian**: solo se leen.
- La revisión visual de fotos y videos (matrículas, personas, teléfonos, texto promocional) la hace
  el usuario antes de dar por buena una publicación; queda pendiente en las fichas nuevas.

## Activar GitHub Pages

1. Sube el sitio al repositorio de GitHub, manteniendo `index.html`, `ficha.html`, `app.js`, `styles.css`, los archivos `data/` y `assets/` dentro de `docs/`.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**, selecciona la rama que contiene el sitio y la carpeta **`/docs`**; guarda el cambio.
4. Espera a que termine el despliegue. Prueba la página principal, los filtros, enlaces a fichas como `ficha.html?id=INM-001` y las imágenes desde la URL pública.

## Prueba local

Puedes abrir `docs/index.html` directamente para revisar el catálogo sin publicar. Si usas un servidor HTTP local, la página también debe cargar desde la dirección que ese servidor indique. Después de cada actualización del inventario, regenera los dos archivos de datos con el generador del catálogo antes de copiar o desplegar el sitio.

## Caché: bumpea la versión al cambiar los datos

Las páginas cargan el inventario con una etiqueta de versión: `data/listings.js?v=20261110-inm015`.
Si cambias `data/listings.js` **y no cambias esa etiqueta**, los navegadores (y los rastreadores de
WhatsApp o Facebook) siguen sirviendo la versión anterior del inventario desde su caché, aunque el
archivo ya esté actualizado en el repositorio.

Procedimiento obligatorio al modificar datos o fotos:

1. Actualiza `data/listings.json` y `data/listings.js`.
2. Cambia la etiqueta en `ficha.html` e `index.html` a una versión nueva, por ejemplo `?v=20261110-inm015`.
3. Regenera las fichas estáticas con el generador (`gen_fichas.py`), que copian esa misma versión a cada `ficha-INM-XXX.html`.
4. Sube `index.html`, `ficha.html`, las fichas `ficha-INM-*.html` y los archivos de datos, y espera el despliegue.
5. Verifica en producción que el contador de fotos y los precios coincidan con los datos nuevos.

Las fotos nuevas deben publicarse en `assets/listings/INM-XXX/photo-NN.jpg` sin metadatos EXIF ni GPS,
con el lado mayor a 1600 px. Las fichas estáticas también necesitan regenerarse cuando cambia la portada
(`cover`), porque la vista previa de WhatsApp toma la imagen de `og:image`.

## Convención de carpetas, portadas y avisos

- Cada carpeta de inmueble lleva su código delante: `INM-008 aptoNormandia`. Los scripts localizan la
  carpeta por ese prefijo, así que se pueden renombrar sin romper nada.
- El archivo `fotoIndex` de la carpeta (o `fotoIndex.jpeg` / `fotoIndex.jpg`) marca **la imagen de
  portada**: es la que se ve al compartir el enlace. Se publica esa foto como `cover` y se deja de
  primera en la galería. Si la foto marcada cambia de contenido, hay que republicarla.
- Si una foto tiene matrícula de vehículo legible, no se publica hasta que se difumine. Antes de
  publicar, revisa las fotos nuevas una a una.
- **Regla de videos (2026-11-21): solo clips superiores a 20 segundos.** Cualquier video de
  20 segundos o menos se descarta y no se publica (ejemplo: INM-019 tenía un clip de 0.5 s que se
  retiró; también se retiraron los de INM-005 de 10 s, 5.7 s y 14 s y el de INM-011 de 12.5 s).
  Quedan como excepción ya publicados, por decisión del usuario, los dos clips de 19.9 s de
  INM-005 (`video-03`) e INM-013 (`video-01`); no agregar más de esa duración.
  Además, todos los videos se publican **sin audio** (re-codificados a H.264 con
  `-an`, más su póster `video-NN.jpg`) y se listan en `videos` como `{path, poster}`.
  En este equipo no hay ffmpeg de sistema: se usa el binario incluido en el paquete
  `imageio-ffmpeg` (`imageio_ffmpeg.get_ffmpeg_exe()`), que también sirve para extraer el póster
  (`-frames:v 1`).
- `dataNegocio.txt` de cada carpeta indica la situación comercial. Las fichas compartidas con bróker
  50/50 muestran el aviso "Trabajo con co-broker 50/50, posible tercería 1-1-1."; las de captación
  directa no muestran aviso. El detalle completo se guarda en `inventario/negocio.json`, fuera de la
  carpeta publicada.
- **Fotos nuevas**: se reescalan a 1600 px de lado mayor, se guardan como JPEG sin EXIF/GPS, se
  deduplican por MD5 y se clasifican en `horizontalPhotos`, `verticalPhotos` y `squarePhotos`
  (el carrusel muestra secciones separadas con contador `n/total`).
- Los videos originales de las carpetas fuente **no se borran**: si se descartan, solo se dejan de
  publicar (los que ya estaban en el sitio se eliminan con el script de publicación).

## Reglas de datos de la ficha

- **Títulos**: `Tipo · m² · Zona`, con la ubicación al final del metraje
  (ej. `Apartamento · 52 m² · Hacienda Los Sauces`).
- **Zonas**: se usa el texto exacto de la carpeta, sin agregados; ej. INM-005 es
  `Salitre, Gran Reserva` (sin ", Bogotá").
- **`features`**: vocabulario cerrado a `balcony`, `parking`, `elevator`, `security`
  (etiquetas en `FEATURE_LABELS` de `app.js` y casillas en `index.html`); no se agregan valores
  nuevos sin ampliar los dos lugares a la vez.
- **Sin precio**: `price: null` y `rentPrice: null` → la tarjeta muestra "Precio por confirmar";
  nunca se inventa una cifra.
- **Precio con "administración incluida"**: se publica como **Arriendo** — `operation: "Arriendo"`,
  `rentPrice`, `priceIncludesAdmin: true` y `administration: null` (para no mostrar un dato
  contradictorio). Definido con INM-019: arriendo $1.500.000/mes con administración incluida
  ($153.000).
- **Descripción**: se toma del `Descripcion.txt` de la carpeta, saneado (sin teléfonos ni datos
  personales), con los datos clave al final. Ej.: "Estrato 3, piso 10, año 2026.
  Arriendo $1.500.000/mes con administración incluida."
- **`listings.json` y `listings.js`** deben quedar idénticos: el `.js` es el que carga el sitio
  (`window.PROPERTY_LISTINGS = ...;`). Tras cada cambio se valida la igualdad de los dos.

## Publicar con git (recomendado)

Con git instalado y una clave SSH registrada en la cuenta:

```
powershell -ExecutionPolicy Bypass -File C:\Users\lprie\Tools\publicar-sitio.ps1
```

El script sincroniza datos, fichas, código y medios (y borra del sitio los medios que ya no estén en
la carpeta de publicación), bumpea la etiqueta de caché, regenera las fichas estáticas, hace commit y push.
El despliegue de Pages tarda entre 1 y 5 minutos; si el workflow se queda mucho rato en "Queued",
espera y revisa de nuevo antes de tocar nada más.

### Despliegue (GitHub Actions)

- El workflow `.github/workflows/static.yml` usa **`actions/deploy-pages@v4`**. No se debe subir a
  `v5`: con Node 24 falla de forma persistente con
  `No artifacts named "github-pages" were found` (comprobado el 2026-11-21).
- El estado se consulta en la API pública de GitHub
  (`/repos/inmuebleficha/publico/deployments` → `statuses_url`); los logs de Actions sin token
  devuelven 403, pero las anotaciones del job sí se pueden leer por API.
- Si un despliegue queda en `failure` o pasa de ~1 hora en "Queued", un push nuevo lo destraba
  (aunque sea `git commit --allow-empty` seguido de `git push`).
- **Verificación posterior**: 19 fichas en vivo, `data/listings.js` con el total y los valores
  nuevos, `ficha-INM-XXX.html` con su `og:image`, y que los medios referenciados respondan 200
  (los retirados deben dar 404). Ejemplo de comprobación: leer
  `https://inmuebleficha.github.io/publico/data/listings.js` y comparar con el local.
