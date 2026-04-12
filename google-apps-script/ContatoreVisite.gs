const COUNTER_SHEET_ID = '1aCbgpGVv1sNpWkry7EurGmS2zoNDEJWVT5cldMeG7Sw';
const COUNTER_SHEET_NAME = 'Foglio1';

function doGet(e) {
  const params = (e && e.parameter) || {};

  const action = String(params.action || params.mode || 'hit').toLowerCase();
  const namespace = sanitizeKey(
    params.ns || params.namespace || 'pellegrinaggi-cnc-piemonte-svizzera'
  );
  const page = sanitizeKey(params.page || params.pageKey || 'home');

  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const sheet = getCounterSheet_();
    ensureHeader_(sheet);

    let total;
    if (action === 'get') {
      total = getCurrentTotal_(sheet, namespace, page);
    } else {
      total = incrementTotal_(sheet, namespace, page);
    }

    lock.releaseLock();

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, namespace, page, total })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, message: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getCounterSheet_() {
  const spreadsheet = SpreadsheetApp.openById(COUNTER_SHEET_ID);
  return spreadsheet.getSheetByName(COUNTER_SHEET_NAME) || spreadsheet.insertSheet(COUNTER_SHEET_NAME);
}

function ensureHeader_(sheet) {
  const expected = [
    'namespace',
    'page',
    'totale_visite',
    'ultimo_aggiornamento',
    'ultima_origine',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    return;
  }

  const header = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  const isDifferent = expected.some(function (value, index) {
    return String(header[index] || '') !== value;
  });

  if (isDifferent) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  }
}

function getCurrentTotal_(sheet, namespace, page) {
  const row = findCounterRow_(sheet, namespace, page);
  if (!row) return 0;
  return Number(sheet.getRange(row, 3).getValue() || 0);
}

function incrementTotal_(sheet, namespace, page) {
  const row = findCounterRow_(sheet, namespace, page);
  const now = new Date();
  const origin = 'webapp';

  if (!row) {
    sheet.appendRow([namespace, page, 1, now, origin]);
    return 1;
  }

  const cell = sheet.getRange(row, 3);
  const current = Number(cell.getValue() || 0);
  const next = current + 1;

  cell.setValue(next);
  sheet.getRange(row, 4).setValue(now);
  sheet.getRange(row, 5).setValue(origin);

  return next;
}

function findCounterRow_(sheet, namespace, page) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === namespace && String(values[i][1]) === page) {
      return i + 2;
    }
  }
  return 0;
}

function sanitizeKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
}
