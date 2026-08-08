/**
 * Melody AI — waitlist → Google Sheet
 * Appends every landing-page signup as a row: [timestamp, email, source, page].
 *
 * ── DEPLOY (4 steps) ──────────────────────────────────────────────
 * 1. Open your sheet:
 *      https://docs.google.com/spreadsheets/d/1taqOc4e8kF4dzx81rXIjFCOeqDtAFSmgzZeliXOlF_Q/edit
 *    → Extensions ▸ Apps Script. Delete any sample code and paste this whole file.
 * 2. Click Deploy ▸ New deployment ▸ (gear) Web app.
 *      - Execute as:            Me
 *      - Who has access:        Anyone
 *    Click Deploy, authorize when prompted, and copy the Web app URL (ends in /exec).
 * 3. Paste that URL into WAITLIST_ENDPOINT at the top of the <script> in index.html.
 * 4. (Optional) Run `setup` once from the Apps Script editor to add a header row.
 *
 * Re-deploying after edits: Deploy ▸ Manage deployments ▸ edit ▸ Version: New version.
 * ──────────────────────────────────────────────────────────────────
 */

var SHEET_ID = '1taqOc4e8kF4dzx81rXIjFCOeqDtAFSmgzZeliXOlF_Q';
var SHEET_NAME = 'Waitlist'; // first sheet is used if this tab doesn't exist

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

// Adds a header row. Run once (optional).
function setup() {
  var sheet = getSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email', 'Source', 'Page']);
  }
}

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var email = (p.email || '').toString().trim();

    // basic email sanity check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'invalid email' });
    }

    var sheet = getSheet_();

    // de-dupe: skip if this email is already in column B
    var existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    if (existing.indexOf(email) === -1) {
      sheet.appendRow([new Date(), email, p.source || 'web', p.page || '']);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Lets you sanity-check the deployment in a browser (GET the /exec URL).
function doGet() {
  return json_({ ok: true, service: 'melody-waitlist' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
