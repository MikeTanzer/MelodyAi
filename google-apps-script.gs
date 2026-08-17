/**
 * Melody AI waitlist → Google Sheet.
 *
 * IMPORTANT: open this from INSIDE the target sheet (Extensions ▸ Apps Script)
 * so the script is bound to that sheet. The @OnlyCurrentDoc tag below limits
 * the permission to ONLY this spreadsheet — not your other Google Sheets.
 *
 * Deploy: Deploy ▸ Manage deployments ▸ edit ▸ Version: New version ▸ Deploy.
 * Saving alone changes nothing — the web app serves the last DEPLOYED version.
 *
 * Columns written:
 *   A Date   B Email   C Message   D Name   E Number   F Page
 *
 * NOTE: rows added before this version put the source ("coming-soon") in C and
 * the page URL in D, so they will not line up with these headers.
 *
 * @OnlyCurrentDoc
 */

var HEADERS = ['Date', 'Email', 'Message', 'Name', 'Number', 'Page'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); // the bound sheet only
  var sh = ss.getSheetByName('Waitlist') || ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'invalid email' });

  var sh = sheet_();
  var message = String(p.message || '').trim().slice(0, 1000);
  var name = String(p.name || '').trim().slice(0, 120);
  var phone = String(p.phone || '').trim().slice(0, 40);

  // Already on the list? Fill in whatever is new rather than adding a duplicate
  // row — someone may sign up first and come back later to leave details.
  if (sh.getLastRow() > 1) {
    var emails = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === email.toLowerCase()) {
        var row = i + 2;
        if (message) sh.getRange(row, 3).setValue(message);
        if (name) sh.getRange(row, 4).setValue(name);
        if (phone) sh.getRange(row, 5).setValue(phone);
        return out_({ ok: true, duplicate: true });
      }
    }
  }

  sh.appendRow([
    new Date(),          // A Date
    email,               // B Email
    message,             // C Message
    name,                // D Name
    phone,               // E Number
    p.page || ''         // F Page
  ]);
  return out_({ ok: true });
}

function doGet() {
  return out_({ ok: true, service: 'melody-waitlist' });
}

/** Run once from the editor to write the header row onto an existing sheet. */
function setHeaders() {
  var sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
