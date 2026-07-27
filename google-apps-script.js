/* cspell:disable */
/**
 * ============================================================================
 * GOOGLE APPS SCRIPT FOR MAGANGHUB APPLICATION TRACKER
 * Spreadsheet ID: 1ppIpyuAzy92EOmSBFtFboE8HPwBmNuDKW5ERRfxRUmU
 * ============================================================================
 * 
 * CARA PASANG:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu Extensi -> Apps Script.
 * 3. Hapus semua kode yang ada, lalu paste seluruh kode di bawah ini.
 * 4. Klik tombol "Simpan" (Ctrl+S / Cmd+S).
 * 5. Klik "Deploy" -> "Kelola deployment" -> Edit -> Versi Baru -> Deploy.
 * ============================================================================
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var action = e.parameter.action;
    var postData = null;

    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
        if (!action && postData.action) {
          action = postData.action;
        }
      } catch (err) {
        // payload might be form-encoded or plain
      }
    }

    if (!action) {
      action = "get";
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pastikan Header terpasang jika sheet masih kosong
    ensureHeaderRow(sheet);

    if (action === "get") {
      return responseJSON(getJobs(sheet));
    } else if (action === "add") {
      var newJob = postData || e.parameter;
      return responseJSON(addJob(sheet, newJob));
    } else if (action === "update") {
      var updateData = postData || e.parameter;
      return responseJSON(updateJob(sheet, updateData));
    } else if (action === "delete") {
      var idToDelete = (postData && postData.id) || e.parameter.id;
      return responseJSON(deleteJob(sheet, idToDelete));
    } else if (action === "sync_maganghub") {
      return responseJSON(syncKuotaDanPelamarMaganghub(sheet));
    } else {
      return responseJSON({ success: false, message: "Action tidak dikenal: " + action });
    }
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "No",
      "Nama Perusahaan",
      "Posisi",
      "Kuota",
      "Pelamar",
      "Peluang (%)",
      "Alamat",
      "Status",
      "Terakhir Diperbarui"
    ]);
  }
}

function getJobs(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, data: [] };
  }

  var jobs = [];
  // Baris 0 adalah Header
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // skip baris kosong

    var kuota = Number(row[3]) || 0;
    var pelamar = Number(row[4]) || 0;
    var peluang = calculatePeluang(kuota, pelamar);
    var lastUpdated = row[8] ? String(row[8]) : "";

    jobs.push({
      id: i, // ID mewakili baris ke-i (1-indexed data row)
      no: i,
      namaPerusahaan: String(row[1] || ""),
      posisi: String(row[2] || ""),
      kuota: kuota,
      pelamar: pelamar,
      peluang: peluang,
      alamat: String(row[6] || ""),
      status: String(row[7] || "Status Belum Ditentukan"),
      lastUpdated: lastUpdated
    });
  }

  return { success: true, data: jobs };
}

function addJob(sheet, item) {
  var kuota = Number(item.kuota) || 0;
  var pelamar = Number(item.pelamar) || 0;
  var peluang = calculatePeluang(kuota, pelamar);
  var nowStr = item.lastUpdated || new Date().toISOString();
  
  var data = sheet.getDataRange().getValues();
  var nextNo = data.length; // Baris baru akan memiliki No = total baris data (excluding header + 1)

  var newRow = [
    nextNo,
    item.namaPerusahaan || "",
    item.posisi || "",
    kuota,
    pelamar,
    peluang / 100,
    item.alamat || "",
    item.status || "Status Belum Ditentukan",
    nowStr
  ];

  sheet.appendRow(newRow);
  autoRenumber(sheet);

  return { 
    success: true, 
    message: "Data berhasil ditambahkan",
    data: {
      id: nextNo,
      no: nextNo,
      namaPerusahaan: item.namaPerusahaan,
      posisi: item.posisi,
      kuota: kuota,
      pelamar: pelamar,
      peluang: peluang,
      alamat: item.alamat,
      status: item.status,
      lastUpdated: nowStr
    }
  };
}

function updateJob(sheet, item) {
  var targetId = Number(item.id || item.no);
  if (!targetId || targetId < 1) {
    return { success: false, message: "ID data tidak valid" };
  }

  var rowIndex = targetId + 1; // Baris 1 adalah header, jadi id=1 ada di baris 2
  if (rowIndex > sheet.getLastRow()) {
    return { success: false, message: "Data tidak ditemukan di spreadsheet" };
  }

  var kuota = Number(item.kuota) || 0;
  var pelamar = Number(item.pelamar) || 0;
  var peluang = calculatePeluang(kuota, pelamar);
  var nowStr = item.lastUpdated || new Date().toISOString();

  sheet.getRange(rowIndex, 2).setValue(item.namaPerusahaan || "");
  sheet.getRange(rowIndex, 3).setValue(item.posisi || "");
  sheet.getRange(rowIndex, 4).setValue(kuota);
  sheet.getRange(rowIndex, 5).setValue(pelamar);
  sheet.getRange(rowIndex, 6).setValue(peluang / 100);
  sheet.getRange(rowIndex, 7).setValue(item.alamat || "");
  sheet.getRange(rowIndex, 8).setValue(item.status || "Status Belum Ditentukan");
  sheet.getRange(rowIndex, 9).setValue(nowStr);

  autoRenumber(sheet);

  return { success: true, message: "Data berhasil diperbarui" };
}

function deleteJob(sheet, id) {
  var targetId = Number(id);
  if (!targetId || targetId < 1) {
    return { success: false, message: "ID data tidak valid" };
  }

  var rowIndex = targetId + 1; // Row in sheet
  if (rowIndex > sheet.getLastRow()) {
    return { success: false, message: "Data tidak ditemukan di spreadsheet" };
  }

  sheet.deleteRow(rowIndex);
  autoRenumber(sheet);

  return { success: true, message: "Data berhasil dihapus" };
}

/**
 * FUNGSI AUTO-SYNC KUOTA & PELAMAR DARI MAGANGHUB KEMNAKER
 */
function syncKuotaDanPelamarMaganghub(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, message: "Tidak ada data untuk disinkronkan.", data: [] };
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var updatedCount = 0;

  for (var i = 0; i < data.length; i++) {
    var rowIndex = i + 2;
    var perusahaan = String(data[i][1] || "").trim();
    var posisi = String(data[i][2] || "").trim();

    if (!posisi && !perusahaan) continue;

    var result = fetchDetailDariMaganghub(perusahaan, posisi);

    if (result) {
      var newKuota = Number(result.kuota) || 0;
      var newPelamar = Number(result.pelamar) || 0;

      sheet.getRange(rowIndex, 4).setValue(newKuota);
      sheet.getRange(rowIndex, 5).setValue(newPelamar);

      var newPeluang = calculatePeluang(newKuota, newPelamar);
      sheet.getRange(rowIndex, 6).setValue(newPeluang / 100);
      updatedCount++;
    }
  }

  return {
    success: true,
    message: "Berhasil memperbarui " + updatedCount + " data dari Maganghub Kemnaker!",
    data: getJobs(sheet).data
  };
}

/**
 * SMART MULTI-PAGE FUZZY SEARCH KEMNAKER API
 */
function fetchDetailDariMaganghub(namaPerusahaan, namaPosisi) {
  // 1. Ekstrak nama perusahaan bersih (hilangkan PT, Tbk, Indonesia)
  var cleanComp = (namaPerusahaan || "")
    .replace(/PT\.?\s*/gi, "")
    .replace(/Tbk\.?/gi, "")
    .replace(/Indonesia/gi, "")
    .trim();

  var cleanPos = (namaPosisi || "")
    .replace(/Analyst/gi, "")
    .replace(/Intern/gi, "")
    .replace(/Specialist/gi, "")
    .trim();

  // Urutan kata kunci pencarian API
  var searchTerms = [cleanComp, namaPerusahaan, namaPosisi, cleanPos].filter(Boolean);
  var items = [];

  for (var s = 0; s < searchTerms.length; s++) {
    var term = searchTerms[s];
    if (!term || term.length < 2) continue;

    // Fetch page 1, 2, dan 3 untuk memastikan seluruh halaman pencarian Kemnaker terbaca
    for (var page = 1; page <= 3; page++) {
      var url = "https://maganghub.kemnaker.go.id/api/v1/lowongan?limit=50&page=" + page + "&keyword=" + encodeURIComponent(term);

      try {
        var response = UrlFetchApp.fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json"
          },
          muteHttpExceptions: true
        });

        if (response.getResponseCode() === 200) {
          var json = JSON.parse(response.getContentText());
          var resItems = json.data || json.result || json.items || [];
          if (resItems && resItems.length > 0) {
            items = items.concat(resItems);
          }
        }
      } catch (e) {}
    }

    if (items.length > 0) break; // Mengambil seluruh item dari halaman 1 - 3
  }

  if (!items || items.length === 0) return null;

  // 2. Bobot Kesamaan Kata (Word Overlap Scoring)
  var targetText = (namaPerusahaan + " " + namaPosisi).toLowerCase();
  var targetWords = targetText
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(function(w) { return w.length > 2 && w !== "indonesia" && w !== "tbk"; });

  var target = null;
  var bestScore = -1;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemText = ((item.nama_perusahaan || item.perusahaan || "") + " " + (item.nama_lowongan || item.posisi || "")).toLowerCase();

    var score = 0;
    for (var w = 0; w < targetWords.length; w++) {
      if (itemText.indexOf(targetWords[w]) !== -1) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      target = item;
    }
  }

  if (!target) return null;

  return {
    kuota: target.kuota || target.quota || 0,
    pelamar: target.jumlah_pelamar || target.total_applicant || 0
  };
}

function autoRenumber(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  for (var r = 2; r <= lastRow; r++) {
    sheet.getRange(r, 1).setValue(r - 1);
  }
}

/**
 * Formula Peluang Lolos: MIN(1, Kuota / (Pelamar + 1)) * 100
 */
function calculatePeluang(kuota, pelamar) {
  var k = Number(kuota) || 0;
  var p = Number(pelamar) || 0;
  if (k <= 0) return 0;
  var ratio = k / (p + 1);
  var percentage = Math.min(1, ratio) * 100;
  return Number(percentage.toFixed(2));
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
