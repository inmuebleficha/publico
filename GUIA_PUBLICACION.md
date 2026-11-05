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

Puedes abrir `docs/index.html` directamente para revisar el catálogo sin publicar. Si usas un servidor HTTP local, la página también debe cargar desde la dirección que ese servidor indique. Después de cada actualización del inventario, regenera los dos archivos de datos con el script de preparación antes de copiar o desplegar el sitio.
