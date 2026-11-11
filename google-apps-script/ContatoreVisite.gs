const COUNTER_SHEET_ID = '1aCbgpGVv1sNpWkry7EurGmS2zoNDEJWVT5cldMeG7Sw';
const COUNTER_SHEET_NAME = 'Foglio1';


function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = String(params.action || 'hit').toLowerCase();

  // Endpoint aggiuntivo Seoul 2027. Il flusso del contatore visite resta invariato.
  if (action === 'seoul' || action === 'seoul-status' || action === 'posti-seoul') {
    return getSeoulStatusResponse_(params);
  }
  if (action === 'seoul-rates' || action === 'rate-seoul' || action === 'piano-rate-seoul') {
    return getSeoulRatesResponse_(params);
  }
  const namespace = sanitizeKey(params.ns || 'pellegrinaggi-cnc-piemonte-svizzera');
  const page = sanitizeKey(params.page || 'home');

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

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, namespace, page, total }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getCounterSheet_() {
  const spreadsheet = SpreadsheetApp.openById(COUNTER_SHEET_ID);
  const sheet = spreadsheet.getSheetByName(COUNTER_SHEET_NAME) || spreadsheet.insertSheet(COUNTER_SHEET_NAME);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([['namespace', 'page', 'totale_visite', 'ultimo_aggiornamento', 'ultima_origine']]);
    return;
  }

  const header = sheet.getRange(1, 1, 1, 5).getValues()[0];
  const expected = ['namespace', 'page', 'totale_visite', 'ultimo_aggiornamento', 'ultima_origine'];
  const isDifferent = expected.some(function (value, index) {
    return String(header[index] || '') !== value;
  });

  if (isDifferent) {
    sheet.getRange(1, 1, 1, 5).setValues([expected]);
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
// ============================================================================
// SEOUL 2027 — DISPONIBILITÀ POSTI PUBBLICA
// Estensione non invasiva del contatore visite.
// Il sito continua a usare la stessa Web App e richiama:
//   ?action=seoul
// oppure, per verificare una categoria specifica:
//   ?action=seoul&categoria=giovani|coppie|presbiteri
// ============================================================================

const SEOUL_SHEET_NAME = 'Seoul';
const SEOUL_REGISTRATION_SPREADSHEET_ID = '1fEcaFQv_6Wbfx5XeahTyD3_aCezp_mu0soHUrxGkIfo';
const SEOUL_REGISTRATION_SHEET_NAME = 'Iscrizioni_Pell';
const SEOUL_PROFILES_SHEET_NAME = 'Profili';

const SEOUL_HEADERS = [
  'pellegrinaggio_id',
  'descrizione',
  'posti_totali',
  'posti_giovani',
  'posti_coppie',
  'posti_presbiteri',
  'gestione_attiva',
  'refresh_secondi',
  'iscritti_totali',
  'iscritti_giovani',
  'coppie_iscritte',
  'presbiteri_iscritti',
  'posti_rimanenti',
  'sold_out_totale',
  'limite_categoria_raggiunto',
  'ultimo_aggiornamento'
];

/**
 * Eseguire una sola volta dall'editor Apps Script.
 * Crea il foglio Seoul senza toccare Foglio1 e il contatore visite.
 */
function setupSeoulSheet() {
  const sheet = ensureSeoulSheet_();
  const status = calculateSeoulStatus_(sheet);
  writeSeoulSnapshot_(sheet, status);
  return status;
}

/**
 * Aggiorna manualmente i valori calcolati nel foglio Seoul.
 */
function refreshSeoulSheet() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = ensureSeoulSheet_();
    const status = calculateSeoulStatus_(sheet);
    writeSeoulSnapshot_(sheet, status);
    return status;
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/**
 * Risposta pubblica usata dal sito. Non espone dati personali né il dettaglio
 * numerico delle categorie.
 */
function getSeoulStatusResponse_(params) {
  const callback = String((params && params.callback) || '').trim();
  const requestedCategory = normalizeSeoulCategory_((params && (params.categoria || params.category)) || '');
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    const sheet = ensureSeoulSheet_();
    const status = calculateSeoulStatus_(sheet);
    writeSeoulSnapshot_(sheet, status);

    const requestedCategorySoldOut = requestedCategory
      ? !!status.soldOutByCategory[requestedCategory]
      : false;

    const blocked = !!status.soldOutTotal || requestedCategorySoldOut;
    let message = '';

    if (status.soldOutTotal) {
      message = 'Posti esauriti: tutti i posti sono occupati o temporaneamente riservati.';
    } else if (requestedCategorySoldOut) {
      message = 'La disponibilità per la categoria selezionata è esaurita.';
    } else if (status.anyCategorySoldOut) {
      message = 'Una delle categorie ha raggiunto il limite. La disponibilità personale sarà verificata durante l’iscrizione.';
    } else if (status.remainingTotal <= 10) {
      message = 'Ultimi posti disponibili.';
    }

    let publicRatePlan = null;
    try {
      publicRatePlan = buildSeoulRatesData_({ pellegrinaggioId: status.pilgrimageId });
    } catch (rateError) {
      // Il conteggio posti deve continuare a funzionare anche se il piano rate non è disponibile.
      publicRatePlan = null;
    }

    const payload = {
      ok: true,
      action: 'seoul',
      pellegrinaggio: status.description,
      gestioneAttiva: status.enabled,
      totalePosti: status.totalLimit,
      postiRimanenti: status.remainingTotal,
      soldOut: status.soldOutTotal,
      limiteCategoriaRaggiunto: status.anyCategorySoldOut,
      categoriaRichiestaEsaurita: requestedCategorySoldOut,
      blocco: blocked,
      iscrizioniAperte: status.enabled ? !blocked : true,
      avviso: !!message,
      messaggio: message,
      refreshSecondi: status.refreshSeconds,
      ultimoAggiornamento: status.updatedAt,
      ratePlan: publicRatePlan
    };

    return createSeoulOutput_(payload, callback);
  } catch (error) {
    return createSeoulOutput_({
      ok: false,
      action: 'seoul',
      message: String(error && error.message ? error.message : error)
    }, callback);
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/**
 * Piano rate pubblico Korea 2027.
 * Legge direttamente le righe ATTIVE del foglio PIANO_RATE_V42 usato dalla Web App.
 * Non espone pagamenti, nominativi, ricevute o altre informazioni personali.
 */
function buildSeoulRatesData_(params) {
  const pid = String((params && (params.pellegrinaggioId || params.pid)) || '2').trim() || '2';
  const spreadsheet = SpreadsheetApp.openById(SEOUL_REGISTRATION_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('PIANO_RATE_V42');
  if (!sheet) throw new Error('Foglio PIANO_RATE_V42 non trovato.');

  const data = sheet.getDataRange().getValues();
  if (!data.length) throw new Error('Piano rate non configurato.');

  const headers = buildHeaderMap_(data[0] || []);
  const installments = [];
  let description = 'Pellegrinaggio Korea 2027';
  let lastUpdated = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowPid = stringCell_(row, headers, ['pellegrinaggioid', 'pellegrinaggio_id'], -1);
    if (rowPid !== pid) continue;

    const active = booleanValue_(valueCell_(row, headers, ['attiva'], -1), false);
    if (!active) continue;

    const numero = parseInt(valueCell_(row, headers, ['numerorata', 'numero_rata'], -1), 10) || 0;
    if (!numero) continue;

    const title = stringCell_(row, headers, ['titolorata', 'titolo_rata'], -1) || ('Rata ' + numero);
    const detail = stringCell_(row, headers, ['descrizionerata', 'descrizione_rata'], -1);
    const rawAmount = valueCell_(row, headers, ['importo'], -1);
    const amount = seoulPublicMoney_(rawAmount);
    const rawDate = valueCell_(row, headers, ['scadenza'], -1);
    const dueDate = seoulPublicDateText_(rawDate);
    const rowDescription = stringCell_(row, headers, ['descrizione'], -1);
    const updated = valueCell_(row, headers, ['aggiornatoil', 'aggiornato_il'], -1);

    if (rowDescription) description = rowDescription;
    if (updated instanceof Date && !isNaN(updated.getTime()) && (!lastUpdated || updated > lastUpdated)) lastUpdated = updated;

    installments.push({
      numero: numero,
      titolo: title,
      descrizione: detail,
      scadenza: dueDate,
      importo: amount,
      definita: amount > 0
    });
  }

  installments.sort(function(a, b) { return a.numero - b.numero; });

  const definedCount = installments.filter(function(x) { return x.definita; }).length;
  const totalDefined = installments.reduce(function(sum, x) { return sum + (x.definita ? x.importo : 0); }, 0);
  const now = new Date();
  const zone = Session.getScriptTimeZone() || 'Europe/Rome';

  return {
    ok: true,
    action: 'seoul-rates',
    pellegrinaggioId: pid,
    descrizione: description,
    installments: installments,
    totalCount: installments.length,
    definedCount: definedCount,
    undefinedCount: Math.max(0, installments.length - definedCount),
    totalDefined: Math.round(totalDefined * 100) / 100,
    pianoAggiornatoIl: lastUpdated ? Utilities.formatDate(lastUpdated, zone, 'dd/MM/yyyy HH:mm:ss') : '',
    ultimoAggiornamento: Utilities.formatDate(now, zone, 'dd/MM/yyyy HH:mm:ss')
  };
}

function getSeoulRatesResponse_(params) {
  const callback = String((params && params.callback) || '').trim();
  try {
    return createSeoulOutput_(buildSeoulRatesData_(params), callback);
  } catch (error) {
    return createSeoulOutput_({
      ok: false,
      action: 'seoul-rates',
      message: String(error && error.message ? error.message : error),
      installments: []
    }, callback);
  }
}

function seoulPublicMoney_(value) {
  if (typeof value === 'number') return isFinite(value) ? Math.round(value * 100) / 100 : 0;
  let text = String(value == null ? '' : value).trim().replace(/\s/g, '').replace(/€/g, '');
  if (!text) return 0;
  if (text.indexOf(',') >= 0 && text.indexOf('.') >= 0) text = text.replace(/\./g, '').replace(',', '.');
  else text = text.replace(',', '.');
  const number = parseFloat(text);
  return isNaN(number) ? 0 : Math.round(number * 100) / 100;
}

function seoulPublicDateText_(value) {
  const zone = Session.getScriptTimeZone() || 'Europe/Rome';
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, zone, 'dd/MM/yyyy');
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  const italian = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (italian) return String(italian[1]).padStart(2, '0') + '/' + String(italian[2]).padStart(2, '0') + '/' + italian[3];
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return String(iso[3]).padStart(2, '0') + '/' + String(iso[2]).padStart(2, '0') + '/' + iso[1];
  return raw;
}

function ensureSeoulSheet_() {
  const spreadsheet = SpreadsheetApp.openById(COUNTER_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SEOUL_SHEET_NAME);
  let structureChanged = false;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SEOUL_SHEET_NAME);
    structureChanged = true;
  }

  if (sheet.getMaxColumns() < SEOUL_HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), SEOUL_HEADERS.length - sheet.getMaxColumns());
  }

  const currentHeaders = sheet.getRange(1, 1, 1, SEOUL_HEADERS.length).getValues()[0];
  const headersDiffer = SEOUL_HEADERS.some(function(header, index) {
    return String(currentHeaders[index] || '').trim() !== header;
  });

  if (headersDiffer) {
    sheet.getRange(1, 1, 1, SEOUL_HEADERS.length).setValues([SEOUL_HEADERS]);
    structureChanged = true;
  }

  if (sheet.getLastRow() < 2 || !String(sheet.getRange(2, 1).getValue() || '').trim()) {
    // 175 giovani + 10 coppie (20 persone) + 5 presbiteri = 200 posti.
    structureChanged = true;
    sheet.getRange(2, 1, 1, SEOUL_HEADERS.length).setValues([[
      '2',
      'Pellegrinaggio Seoul 2027',
      200,
      175,
      10,
      5,
      true,
      30,
      0,
      0,
      0,
      0,
      200,
      false,
      false,
      new Date()
    ]]);
  }

  if (structureChanged) {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, SEOUL_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0d2340')
      .setFontColor('#ffffff');
    sheet.getRange('A:A').setNumberFormat('@');
    sheet.getRange(2, 7, Math.max(1, sheet.getMaxRows() - 1), 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireCheckbox().build()
    );
    sheet.autoResizeColumns(1, SEOUL_HEADERS.length);
  }

  return sheet;
}

function readSeoulConfig_(sheet) {
  const row = sheet.getRange(2, 1, 1, SEOUL_HEADERS.length).getValues()[0];

  return {
    pilgrimageId: String(row[0] || '2').trim(),
    description: String(row[1] || 'Pellegrinaggio Seoul 2027').trim(),
    totalLimit: nonNegativeInteger_(row[2], 200),
    youthLimit: nonNegativeInteger_(row[3], 175),
    couplesLimit: nonNegativeInteger_(row[4], 10),
    priestsLimit: nonNegativeInteger_(row[5], 5),
    enabled: booleanValue_(row[6], true),
    refreshSeconds: Math.max(15, nonNegativeInteger_(row[7], 30) || 30)
  };
}

function calculateSeoulStatus_(configSheet) {
  configSheet = configSheet || ensureSeoulSheet_();
  const config = readSeoulConfig_(configSheet);

  // Mantiene allineati i limiti usati dal gestionale iscrizioni.
  // Il backend V52 già presente in Codice.gs continuerà così a effettuare
  // il blocco reale per totale e categoria usando i valori del foglio Seoul.
  syncSeoulLimitsToRegistrationApp_(config);

  const counts = countCurrentSeoulRegistrations_(config.pilgrimageId);

  const remaining = {
    total: Math.max(0, config.totalLimit - counts.total),
    youth: Math.max(0, config.youthLimit - counts.youth),
    couples: Math.max(0, config.couplesLimit - counts.couples),
    priests: Math.max(0, config.priestsLimit - counts.priests)
  };

  const soldOutByCategory = {
    giovani: config.enabled && remaining.youth <= 0,
    coppie: config.enabled && remaining.couples <= 0,
    presbiteri: config.enabled && remaining.priests <= 0
  };

  const soldOutTotal = config.enabled && remaining.total <= 0;
  const anyCategorySoldOut = soldOutByCategory.giovani || soldOutByCategory.coppie || soldOutByCategory.presbiteri;
  const now = new Date();

  return {
    success: true,
    pilgrimageId: config.pilgrimageId,
    description: config.description,
    enabled: config.enabled,
    refreshSeconds: config.refreshSeconds,
    totalLimit: config.totalLimit,
    youthLimit: config.youthLimit,
    couplesLimit: config.couplesLimit,
    priestsLimit: config.priestsLimit,
    counts: counts,
    remainingTotal: remaining.total,
    remaining: remaining,
    soldOutTotal: soldOutTotal,
    soldOutByCategory: soldOutByCategory,
    anyCategorySoldOut: anyCategorySoldOut,
    updatedAtDate: now,
    updatedAt: Utilities.formatDate(now, Session.getScriptTimeZone() || 'Europe/Rome', 'dd/MM/yyyy HH:mm:ss')
  };
}

function syncSeoulLimitsToRegistrationApp_(config) {
  const spreadsheet = SpreadsheetApp.openById(SEOUL_REGISTRATION_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('info_pellegrinaggio');
  if (!sheet) throw new Error('Foglio info_pellegrinaggio non trovato nel file delle iscrizioni.');

  const rowNumber = parseInt(config.pilgrimageId, 10);
  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    throw new Error('ID pellegrinaggio Seoul non valido nel foglio info_pellegrinaggio.');
  }

  const quotaHeaders = [
    'Limite Partecipanti Totali',
    'Limite Giovani',
    'Limite Coppie',
    'Limite Presbiteri',
    'Gestione Limiti Attiva',
    'Contatore Refresh Secondi'
  ];

  if (sheet.getMaxColumns() < 12) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 12 - sheet.getMaxColumns());
  }

  const existingHeaders = sheet.getRange(1, 7, 1, 6).getValues()[0];
  const headersDiffer = quotaHeaders.some(function (header, index) {
    return String(existingHeaders[index] || '').trim() !== header;
  });
  if (headersDiffer) sheet.getRange(1, 7, 1, 6).setValues([quotaHeaders]);

  const desired = [
    config.totalLimit,
    config.youthLimit,
    config.couplesLimit,
    config.priestsLimit,
    config.enabled,
    config.refreshSeconds
  ];
  const current = sheet.getRange(rowNumber, 7, 1, 6).getValues()[0];
  const changed = desired.some(function (value, index) {
    return String(current[index]) !== String(value);
  });

  if (changed) sheet.getRange(rowNumber, 7, 1, 6).setValues([desired]);
}

function countCurrentSeoulRegistrations_(pilgrimageId) {
  const spreadsheet = SpreadsheetApp.openById(SEOUL_REGISTRATION_SPREADSHEET_ID);
  const registrationsSheet = spreadsheet.getSheetByName(SEOUL_REGISTRATION_SHEET_NAME)
    || spreadsheet.getSheetByName('ISCRIZIONI_PELL')
    || spreadsheet.getSheetByName('Iscrizioni Pell');

  if (!registrationsSheet) {
    throw new Error('Foglio Iscrizioni_Pell non trovato nel file delle iscrizioni.');
  }

  const data = registrationsSheet.getDataRange().getValues();
  if (data.length < 2) {
    return { total: 0, youth: 0, couples: 0, priests: 0, activeRows: 0 };
  }

  const headerMap = buildHeaderMap_(data[0]);
  const profileMap = buildSeoulProfileMap_(spreadsheet);
  const countedCouples = {};
  const counts = { total: 0, youth: 0, couples: 0, priests: 0, activeRows: 0 };

  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    const rowPilgrimageId = stringCell_(row, headerMap, ['pellegrinaggioid', 'pellegrinaggio_id'], 1);
    if (rowPilgrimageId !== String(pilgrimageId || '').trim()) continue;

    const status = upperCell_(row, headerMap, ['stato'], 3);
    const blocked = booleanValue_(valueCell_(row, headerMap, ['bloccato'], 7), false);

    if (blocked) continue;
    if (['CANCELLATA', 'ANNULLATA', 'RIFIUTATA', 'BLOCCATO'].indexOf(status) >= 0) continue;

    // Un POSTO_PROPOSTO è già riservato a una persona della lista d'attesa:
    // finché la proposta è attiva non deve risultare tra i posti disponibili.
    // LISTA_ATTESA e LISTA_ATTESA_DA_CONFERMARE restano invece escluse dal conteggio.
    if (['IN_ATTESA', 'UFFICIALE', 'POSTO_PROPOSTO'].indexOf(status) < 0) continue;

    counts.activeRows++;

    const email = stringCell_(row, headerMap, ['email'], 0).toLowerCase();
    const surname = upperCell_(row, headerMap, ['cognome'], 12);
    const name = upperCell_(row, headerMap, ['nome'], 13);
    const uniqueCode = upperCell_(row, headerMap, ['codice_univoco', 'codiceunivoco'], 17);
    const profile = profileMap['CODE|' + uniqueCode]
      || profileMap[email + '|' + surname + '|' + name]
      || {};

    let category = upperCell_(row, headerMap, ['categoria_quota'], -1);
    if (!category) category = categoryFromProfile_(profile) || 'GIOVANE';

    if (category === 'COPPIA') {
      const coupleKey = upperCell_(row, headerMap, ['codice_coppia_quota'], -1)
        || coupleKeyFromProfile_(profile, email)
        || ('ROW:' + String(rowIndex + 1));

      if (countedCouples[coupleKey]) continue;
      countedCouples[coupleKey] = true;
      counts.couples++;
      counts.total += 2;
    } else if (category === 'PRESBITERO') {
      counts.priests++;
      counts.total++;
    } else {
      counts.youth++;
      counts.total++;
    }
  }

  return counts;
}

function buildSeoulProfileMap_(spreadsheet) {
  const profileSheet = spreadsheet.getSheetByName(SEOUL_PROFILES_SHEET_NAME);
  const output = {};

  if (!profileSheet || profileSheet.getLastRow() < 2) return output;

  const data = profileSheet.getDataRange().getValues();
  const headerMap = buildHeaderMap_(data[0]);

  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    const profile = {};

    Object.keys(headerMap).forEach(function(key) {
      profile[key] = row[headerMap[key]];
    });

    const email = String(profile.email_partecipante || profile.email || row[0] || '').trim().toLowerCase();
    const surname = String(profile.cognome || '').trim().toUpperCase();
    const name = String(profile.nome || '').trim().toUpperCase();
    const uniqueCode = String(profile.codice_univoco || profile.codiceunivoco || '').trim().toUpperCase();

    if (email || surname || name) output[email + '|' + surname + '|' + name] = profile;
    if (uniqueCode) output['CODE|' + uniqueCode] = profile;
  }

  return output;
}

function categoryFromProfile_(profile) {
  const value = String((profile || {}).stato_partecipante || '').trim().toUpperCase();
  if (/PRESBITER|PRETE|SACERDOT/.test(value)) return 'PRESBITERO';
  if (/COPPIA/.test(value)) return 'COPPIA';
  if (/SINGOLO|GIOVANE/.test(value)) return 'GIOVANE';
  return '';
}

function coupleKeyFromProfile_(profile, email) {
  const p = profile || {};
  const explicitCode = String(p.codice_coppia || '').trim().toUpperCase();
  if (explicitCode) return explicitCode;

  const firstEmail = String(email || p.email_partecipante || '').trim().toLowerCase();
  const spouseEmail = String(p.email_coniuge || '').trim().toLowerCase();
  if (firstEmail && spouseEmail) return 'PAIR:' + [firstEmail, spouseEmail].sort().join('|');

  return '';
}

function writeSeoulSnapshot_(sheet, status) {
  sheet.getRange(2, 9, 1, 8).setValues([[
    status.counts.total,
    status.counts.youth,
    status.counts.couples,
    status.counts.priests,
    status.remainingTotal,
    status.soldOutTotal,
    status.anyCategorySoldOut,
    status.updatedAtDate
  ]]);

  sheet.getRange(2, 14, 1, 2).setDataValidation(
    SpreadsheetApp.newDataValidation().requireCheckbox().build()
  );
  sheet.getRange(2, 16).setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

function createSeoulOutput_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeSeoulCategory_(value) {
  const category = String(value || '').trim().toLowerCase();
  if (category === 'giovane' || category === 'giovani' || category === 'singolo') return 'giovani';
  if (category === 'coppia' || category === 'coppie') return 'coppie';
  if (category === 'presbitero' || category === 'presbiteri' || category === 'prete' || category === 'sacerdote') return 'presbiteri';
  return '';
}

function buildHeaderMap_(headers) {
  const map = {};
  (headers || []).forEach(function(header, index) {
    map[normalizeHeader_(header)] = index;
  });
  return map;
}

function normalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function valueCell_(row, headerMap, aliases, fallbackIndex) {
  for (let i = 0; i < aliases.length; i++) {
    const key = normalizeHeader_(aliases[i]);
    if (Object.prototype.hasOwnProperty.call(headerMap, key)) return row[headerMap[key]];
  }
  return fallbackIndex >= 0 ? row[fallbackIndex] : '';
}

function stringCell_(row, headerMap, aliases, fallbackIndex) {
  return String(valueCell_(row, headerMap, aliases, fallbackIndex) || '').trim();
}

function upperCell_(row, headerMap, aliases, fallbackIndex) {
  return stringCell_(row, headerMap, aliases, fallbackIndex).toUpperCase();
}

function nonNegativeInteger_(value, defaultValue) {
  const number = parseInt(value, 10);
  return isNaN(number) || number < 0 ? Number(defaultValue || 0) : number;
}

function booleanValue_(value, defaultValue) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const normalized = String(value == null ? '' : value).trim().toLowerCase();
  if (['true', '1', 'si', 'sì', 'yes', 'on', 'attivo'].indexOf(normalized) >= 0) return true;
  if (['false', '0', 'no', 'off', 'disattivo'].indexOf(normalized) >= 0) return false;
  return !!defaultValue;
}

