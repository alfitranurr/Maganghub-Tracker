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
 * 5. Klik "Deploy" -> "Deployment baru" (New Deployment).
 * 6. Pilih Jenis: "Aplikasi Web" (Web App).
 * 7. Deskripsi: "Maganghub Tracker API v2".
 * 8. Jalankan sebagai (Execute as): "Saya" (Me).
 * 9. Yang memiliki akses (Who has access): "Siapa saja" (Anyone).
 * 10. Klik "Deploy", lalu Berikan Izin (Authorize Access).
 * 11. Salin URL Aplikasi Web (Web App URL) yang berakhiran `/exec`.
 * 12. Tempel URL tersebut pada file `.env.local` di variabel `NEXT_PUBLIC_API_URL`.
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
      "Status"
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

    jobs.push({
      id: i, // ID mewakili baris ke-i (1-indexed data row)
      no: i,
      namaPerusahaan: String(row[1] || ""),
      posisi: String(row[2] || ""),
      kuota: kuota,
      pelamar: pelamar,
      peluang: peluang,
      alamat: String(row[6] || ""),
      status: String(row[7] || "Status Belum Ditentukan")
    });
  }

  return { success: true, data: jobs };
}

function addJob(sheet, item) {
  var kuota = Number(item.kuota) || 0;
  var pelamar = Number(item.pelamar) || 0;
  var peluang = calculatePeluang(kuota, pelamar);
  
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
    item.status || "Status Belum Ditentukan"
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
      status: item.status
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

  sheet.getRange(rowIndex, 2).setValue(item.namaPerusahaan || "");
  sheet.getRange(rowIndex, 3).setValue(item.posisi || "");
  sheet.getRange(rowIndex, 4).setValue(kuota);
  sheet.getRange(rowIndex, 5).setValue(pelamar);
  sheet.getRange(rowIndex, 6).setValue(peluang / 100);
  sheet.getRange(rowIndex, 7).setValue(item.alamat || "");
  sheet.getRange(rowIndex, 8).setValue(item.status || "Status Belum Ditentukan");

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

    var keyword = posisi || perusahaan;
    var result = fetchDetailDariMaganghub(keyword, perusahaan, posisi);

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

function fetchDetailDariMaganghub(keyword, namaPerusahaan, namaPosisi) {
  var url = "https://maganghub.kemnaker.go.id/api/v1/lowongan?keyword=" + encodeURIComponent(keyword);

  try {
    var response = UrlFetchApp.fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json"
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) return null;

    var json = JSON.parse(response.getContentText());
    var items = json.data || json.result || [];
    if (!items || items.length === 0) return null;

    var match = items.find(function(item) {
      var itemComp = String(item.nama_perusahaan || item.perusahaan || "").toLowerCase();
      var itemPos = String(item.nama_lowongan || item.posisi || "").toLowerCase();

      return (
        (namaPerusahaan && itemComp.indexOf(namaPerusahaan.toLowerCase()) !== -1) ||
        (namaPosisi && itemPos.indexOf(namaPosisi.toLowerCase()) !== -1)
      );
    });

    var target = match || items[0];

    return {
      kuota: target.kuota || target.quota || 0,
      pelamar: target.jumlah_pelamar || target.total_applicant || 0
    };
  } catch (err) {
    Logger.log("Error fetch Maganghub: " + err.toString());
    return null;
  }
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
