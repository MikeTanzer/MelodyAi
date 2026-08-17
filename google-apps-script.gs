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
 * Columns written:
 *   A Date   B Email   C Message   D Source   E Page   F Referrer
 *
 * NOTE: rows added before this version put the source ("coming-soon") in C and
 * the page URL in D. Those older rows will not line up with the new headers.
 *
 * @OnlyCurrentDoc
 */

var HEADERS = ['Date', 'Email', 'Message', 'Source', 'Page', 'Referrer'];

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

  // Already on the list? Update their row instead of adding a duplicate, so a
  // message sent on a second submit isn't lost.
  if (sh.getLastRow() > 1) {
    var emails = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === email.toLowerCase()) {
        if (message) sh.getRange(i + 2, 3).setValue(message);
        return out_({ ok: true, duplicate: true });
      }
    }
  }

  sh.appendRow([
    new Date(),                        // A Date
    email,                             // B Email
    message,                           // C Message (optional)
    p.source || 'web',                 // D Source
    p.page || '',                      // E Page
    p.referrer || ''                   // F Referrer
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
