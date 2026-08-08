/**
 * Melody AI waitlist → Google Sheet.
 *
 * IMPORTANT: open this from INSIDE the target sheet (Extensions ▸ Apps Script)
 * so the script is bound to that sheet. The @OnlyCurrentDoc tag below limits
 * the permission to ONLY this spreadsheet — not your other Google Sheets.
 *
 * Deploy: Deploy ▸ New deployment ▸ Web app · Execute as: Me · Access: Anyone.
 * Copy the /exec URL into WAITLIST_ENDPOINT in index.html.
 *
 * @OnlyCurrentDoc
 */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); // the bound sheet only
  var sh = ss.getSheetByName('Waitlist') || ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['Timestamp', 'Email', 'Source', 'Page']);
  return sh;
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'invalid email' });
  var sh = sheet_();
  var seen = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().join('|') : '';
  if (seen.indexOf(email) === -1) sh.appendRow([new Date(), email, p.source || 'web', p.page || '']);
  return out_({ ok: true });
}

function doGet() {
  return out_({ ok: true, service: 'melody-waitlist' });
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
