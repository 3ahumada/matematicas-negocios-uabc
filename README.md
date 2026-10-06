# Matemáticas para Negocios · UABC

Plataforma web de práctica para la unidad de aprendizaje **Matemáticas 38976** del tronco común de Ciencias Administrativas.

## Qué incluye

La versión actual cubre cuatro unidades:

- **Unidad I. Funciones lineales:** ecuación de la recta, sistemas 2×2, costos, utilidad, oferta y demanda, punto de equilibrio.
- **Unidad II. Funciones cuadráticas:** fórmula general, factorización, vértice, dominio/rango, utilidad y punto de equilibrio.
- **Unidad III. Funciones exponenciales y logarítmicas:** evaluación de funciones, crecimiento, interés compuesto, proyecciones y tiempo mediante logaritmos.
- **Unidad IV. Matrices y sistemas lineales:** suma, multiplicación, sistemas, determinantes, matriz inversa y aplicaciones de insumo-producto.

Los ejercicios usan valores aleatorios, por lo que un mismo tipo de actividad puede generar muchas versiones diferentes.

## Modos de trabajo

- **Práctica:** muestra retroalimentación inmediata.
- **Actividad calificable:** registra la sesión y muestra retroalimentación.
- **Examen:** registra respuestas sin revelar procedimiento durante la sesión.

Cada sesión contiene cinco ejercicios. El resultado queda guardado en el navegador y se puede exportar a CSV para abrirlo en Excel.

## Publicar en GitHub Pages

1. En el repositorio entra a **Settings > Pages**.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/(root)**.
4. Guarda.
5. GitHub mostrará la URL pública, normalmente:
   `https://jesslopezg.github.io/matematicas-negocios-uabc/`

## Registro automático en Google Sheets

La app puede mandar cada sesión a una hoja de Google Sheets.

1. Crea un Google Sheet para el control de notas.
2. Copia el ID de la hoja desde su URL.
3. Abre **Extensiones > Apps Script**.
4. Copia el contenido de `apps-script/Code.gs`.
5. Sustituye:
   `PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET`
   por el ID real.
6. Ejecuta `prepararLibro()` una vez y autoriza el script.
7. Ve a **Implementar > Nueva implementación > Aplicación web**.
8. Ejecutar como: tu cuenta.
9. Acceso: cualquier persona con el enlace.
10. Copia la URL que termina en `/exec`.
11. Abre la plataforma, entra en **Panel docente** y pega esa URL en el campo de conexión.

A partir de entonces cada sesión terminada enviará automáticamente:

- fecha,
- matrícula,
- alumno,
- grupo,
- unidad,
- tema,
- modo,
- aciertos,
- total,
- calificación.

La hoja **Resumen** calcula el promedio registrado por estudiante. Desde Google Sheets puedes descargar el archivo como **Microsoft Excel (.xlsx)**.

## Archivos

- `index.html`: interfaz.
- `styles.css`: diseño responsivo.
- `app.js`: motor de ejercicios, evaluación, progreso y exportación.
- `apps-script/Code.gs`: backend opcional para Google Sheets.

## Próximas mejoras sugeridas

- Panel docente protegido por PIN.
- Banco ampliado de ejercicios por tema.
- Actividades asignadas por código.
- Recuperación de progreso entre dispositivos.
- Exámenes con tiempo.
- Reporte individual por alumno.
- Dashboard de errores frecuentes por tema.
- Portafolio descargable por estudiante.
