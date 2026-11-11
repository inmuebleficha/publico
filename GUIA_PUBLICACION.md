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

## Convención de carpetas, portadas y avisos

- Cada carpeta de inmueble lleva su código delante: `INM-008 aptoNormandia`. Los scripts localizan la
  carpeta por ese prefijo, así que se pueden renombrar sin romper nada.
- El archivo `fotoIndex` de la carpeta (o `fotoIndex.jpeg` / `fotoIndex.jpg`) marca **la imagen de
  portada**: es la que se ve al compartir el enlace. Se publica esa foto como `cover` y se deja de
  primera en la galería. Si la foto marcada cambia de contenido, hay que republicarla.
- Si una foto tiene matrícula de vehículo legible, no se publica hasta que se difumine. Antes de
  publicar, revisa las fotos nuevas una a una.
- `dataNegocio.txt` de cada carpeta indica la situación comercial. Las fichas compartidas con bróker
  50/50 muestran el aviso "Trabajo con co-broker 50/50, posible tercería 1-1-1."; las de captación
  directa no muestran aviso. El detalle completo se guarda en `inventario/negocio.json`, fuera de la
  carpeta publicada.

## Publicar con git (recomendado)

Con git instalado y una clave SSH registrada en la cuenta:

```
powershell -ExecutionPolicy Bypass -File C:\Users\lprie\Tools\publicar-sitio.ps1
```

El script sincroniza datos, fichas, código y medios (y borra del sitio los medios que ya no estén en
la carpeta de publicación), bumpea la etiqueta de caché, regenera las 15 fichas, hace commit y push.
El despliegue de Pages tarda entre 1 y 5 minutos; si el workflow se queda mucho rato en "Queued",
espera y revisa de nuevo antes de tocar nada más.
