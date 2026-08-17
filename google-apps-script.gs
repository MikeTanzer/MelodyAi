/**
 * Melody AI waitlist → the "Beta Sign Ups" Google Sheet.
 *
 * IMPORTANT: open this from INSIDE that sheet (Extensions ▸ Apps Script) so the
 * script is bound to it. The @OnlyCurrentDoc tag limits the permission to ONLY
 * this spreadsheet — not your other Google Sheets.
 *
 * Deploy: Deploy ▸ Manage deployments ▸ edit (pencil) ▸ Version: New version ▸
 * Deploy. Saving alone changes nothing — the web app serves the last DEPLOYED
 * version, so this step is what actually makes the new columns take effect.
 *
 * Target columns:
 *   A Date   B Email   C Message   D Name   E Number   F Page
 *
 * Values are matched to the HEADER TEXT in row 1, not to fixed positions, so
 * "Name" always lands under the Name header even if columns are reordered
 * later. Headers are matched case-insensitively and ignore surrounding spaces.
 *
 * @OnlyCurrentDoc
 */

var HEADERS = ['Date', 'Email', 'Message', 'Name', 'Number', 'Page'];

/** The tab behind gid=0 (the one in the sheet URL), else the first tab. */
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var all = ss.getSheets();
  var sh = all[0];
  for (var i = 0; i < all.length; i++) {
    if (all[i].getSheetId() === 0) { sh = all[i]; break; }
  }
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

/** { message: 3, name: 4, number: 5, ... } — 1-based column per header text. */
function headerMap_(sh) {
  var width = Math.max(sh.getLastColumn(), HEADERS.length);
  var row = sh.getRange(1, 1, 1, width).getValues()[0];
  var map = {};
  for (var i = 0; i < row.length; i++) {
    var key = String(row[i] || '').trim().toLowerCase();
    if (key && !map[key]) map[key] = i + 1;
  }
  return map;
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'invalid email' });

  var sh = sheet_();
  var col = headerMap_(sh);

  // Form field  ->  sheet header
  var values = {
    'date': new Date(),
    'email': email,
    'message': String(p.message || '').trim().slice(0, 1000),  // C Message
    'name': String(p.name || '').trim().slice(0, 120),         // D Name
    'number': String(p.phone || '').trim().slice(0, 40),       // E Number
    'page': String(p.page || '').trim()                        // F Page
  };

  // Fall back to fixed positions for any header the sheet doesn't have.
  var fallback = { 'date': 1, 'email': 2, 'message': 3, 'name': 4, 'number': 5, 'page': 6 };
  function colFor(key) { return col[key] || fallback[key]; }

  // Already on the list? Fill in whatever is new instead of adding a duplicate
  // row — someone may sign up first and come back later with their details.
  if (sh.getLastRow() > 1) {
    var emailCol = colFor('email');
    var existing = sh.getRange(2, emailCol, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i][0]).trim().toLowerCase() === email.toLowerCase()) {
        var row = i + 2;
        ['message', 'name', 'number'].forEach(function (k) {
          if (values[k]) sh.getRange(row, colFor(k)).setValue(values[k]);
        });
        return out_({ ok: true, duplicate: true, updatedRow: row });
      }
    }
  }

  // Build the new row positionally from the header map.
  var width = Math.max(sh.getLastColumn(), HEADERS.length);
  var out = new Array(width).fill('');
  Object.keys(values).forEach(function (k) {
    var c = colFor(k);
    if (c >= 1 && c <= width) out[c - 1] = values[k];
  });
  sh.appendRow(out);
  return out_({ ok: true, wroteColumns: { message: colFor('message'), name: colFor('name'), number: colFor('number') } });
}

function doGet() {
  return out_({ ok: true, service: 'melody-waitlist' });
}

/** Run once from the editor to write the header row. */
function setHeaders() {
  var sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
}

/**
 * Run this from the editor to prove the mapping before touching the live form.
 * Writes one obvious test row, then logs which column each value went to.
 * Delete the row afterwards.
 */
function testMapping() {
  var res = doPost({ parameter: {
    email: 'mapping-test@example.com',
    message: 'TEST → should be in Message (C)',
    name: 'TEST → Name (D)',
    phone: 'TEST → Number (E)',
    page: 'https://melody.ai/'
  }});
  var sh = sheet_();
  var map = headerMap_(sh);
  Logger.log('Header positions found: %s', JSON.stringify(map));
  Logger.log('Result: %s', res.getContent());
  Logger.log('Check row %s — then delete it.', sh.getLastRow());
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
