/**
 * Backend opcional para Matemáticas 38976.
 * 1) Crea una hoja de cálculo en Google Sheets.
 * 2) Extensiones > Apps Script.
 * 3) Pega este archivo y reemplaza SPREADSHEET_ID.
 * 4) Implementar > Nueva implementación > Aplicación web.
 * 5) Ejecutar como: tú. Acceso: Cualquier persona con el enlace.
 * 6) Copia la URL /exec y pégala en "Panel docente" de la app.
 */

const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
const SHEET_NAME = 'Resultados';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, app: 'Matematicas 38976' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sh = ss.getSheetByName(SHEET_NAME);

    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow([
        'Fecha ISO','Matrícula','Alumno','Grupo','Unidad','Nombre unidad',
        'Tema','Modo','Aciertos','Total','Calificación'
      ]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,11).setFontWeight('bold');
    }

    sh.appendRow([
      data.timestamp || new Date().toISOString(),
      data.studentId || '',
      data.studentName || '',
      data.group || '',
      data.unit || '',
      data.unitTitle || '',
      data.topic || '',
      data.mode || '',
      Number(data.correct || 0),
      Number(data.total || 0),
      Number(data.score || 0)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ejecuta una vez esta función si quieres crear también una hoja resumen.
 * Después puedes usar una tabla dinámica o fórmulas sobre "Resultados".
 */
function prepararLibro() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow([
      'Fecha ISO','Matrícula','Alumno','Grupo','Unidad','Nombre unidad',
      'Tema','Modo','Aciertos','Total','Calificación'
    ]);
  }

  let summary = ss.getSheetByName('Resumen');
  if (!summary) summary = ss.insertSheet('Resumen');
  summary.clear();

  summary.getRange('A1').setValue('Control de notas · Matemáticas 38976').setFontWeight('bold').setFontSize(14);
  summary.getRange('A3').setFormula(
    '=QUERY(Resultados!A:K,"select B,C,D,avg(K) where B is not null group by B,C,D label avg(K) \'Promedio\'",1)'
  );
  summary.setFrozenRows(2);
}
