# Publicación en GitHub Pages

## Antes de publicar

Este catálogo es un borrador: los inmuebles, descripciones, imágenes y videos deben revisarse y contar con autorización antes de hacerse públicos. GitHub Pages es público; todo archivo dentro de la carpeta de publicación puede descargarse aunque no aparezca enlazado desde la página.

Verifica que la carpeta `docs/` contenga únicamente contenido aprobado. No copies aquí contratos, identificaciones, documentos de propiedad, archivos originales ni las carpetas excluidas del inventario de trabajo. Solo se incluyen videos seleccionados después de revisar su contenido y exportarlos sin audio ni metadatos; los clips con teléfonos, texto promocional u otros datos visibles deben permanecer fuera o editarse antes.

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
4. Sube `index.html`, `ficha.html`, las 15 fichas y los archivos de datos, y espera el despliegue.
5. Verifica en producción que el contador de fotos y los precios coincidan con los datos nuevos.

Las fotos nuevas deben publicarse en `assets/listings/INM-XXX/photo-NN.jpg` sin metadatos EXIF ni GPS,
con el lado mayor a 1600 px. Las fichas estáticas también necesitan regenerarse cuando cambia la portada
(`cover`), porque la vista previa de WhatsApp toma la imagen de `og:image`.
