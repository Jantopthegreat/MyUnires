# Panduan Lengkap - Tambah Data Nilai Tahfidz

## 🎯 Cara Menambah Data Nilai Tahfidz

Ada **2 cara** untuk menambah data nilai tahfidz:

### Cara 1: Import Excel (Bulk Data) 📊

**Keuntungan:** Bisa import banyak data sekaligus  
**Kekurangan:** Harus tahu ID resident dan ID target hafalan

### Cara 2: Input Manual via Form (Coming Soon) ✍️

**Keuntungan:** Lebih user-friendly, pilih dari dropdown  
**Kekurangan:** Satu per satu

---

## 📋 Cara 1: Import Excel (Detailed Guide)

### Step 1: Dapatkan Daftar Resident ID

Ada 2 cara untuk tahu ID resident:

#### Option A: Lihat di Halaman "Resident Per Lantai"

1. Buka halaman `/pembina/dashboard/resident`
2. Lihat daftar resident di lantai Anda
3. Klik icon "mata" untuk lihat detail
4. Catat **ID** resident

#### Option B: Via API (Untuk Developer)

```bash
# GET Request dengan token
GET http://localhost:3001/api/musyrif/residents
Authorization: Bearer <your_token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 5,              // <-- INI RESIDENT ID
      "name": "Ahmad",
      "email": "ahmad@student.umy.ac.id",
      "nim": "20220001",
      "usroh": "Usroh Alpha",
      "lantai": "Lantai 2 Gedung A"
    },
    {
      "id": 6,              // <-- INI RESIDENT ID
      "name": "Budi",
      ...
    }
  ]
}
```

### Step 2: Dapatkan Daftar Target Hafalan ID

#### Option A: Via Browser (Mudah!)

Buka URL ini di browser (setelah login):

```
http://localhost:3001/api/musyrif/target-hafalan
```

Response akan seperti ini:

```json
{
  "success": true,
  "data": [
    {
      "id": 1, // <-- INI TARGET HAFALAN ID
      "nama": "Juz 1",
      "surah": "Al-Fatihah - Al-Baqarah 141",
      "deskripsi": "Hafalan Juz 1"
    },
    {
      "id": 2, // <-- INI TARGET HAFALAN ID
      "nama": "Juz 2",
      "surah": "Al-Baqarah 142-252",
      "deskripsi": "Hafalan Juz 2"
    }
  ]
}
```

#### Option B: Via Postman/Insomnia

```bash
GET http://localhost:3001/api/musyrif/target-hafalan
Authorization: Bearer <your_token>
```

#### Option C: Buka Database Langsung (Paling Akurat)

```bash
cd myunires-be
npx prisma studio
```

- Buka tabel `TargetHafalan`
- Lihat kolom `id`, `nama`, `surah`

### Step 3: Buat File Excel

Buat file Excel dengan format ini:

| residentId | targetHafalanId | status       | nilaiHuruf |
| ---------- | --------------- | ------------ | ---------- |
| 5          | 1               | Lulus        | A          |
| 5          | 2               | Dalam Proses | B          |
| 6          | 1               | Belum Lulus  | C          |

**Penjelasan:**

- **residentId**: ID dari Step 1 (misal: 5, 6, 7)
- **targetHafalanId**: ID dari Step 2 (misal: 1, 2, 3)
- **status**: Pilih dari `Lulus`, `Belum Lulus`, `Dalam Proses`
- **nilaiHuruf**: Pilih dari `A`, `B`, `C`, `D`, `E`

### Step 4: Upload Excel

1. Buka halaman `/pembina/dashboard/tahfidz`
2. Klik tombol **"Impor Data"**
3. Pilih file Excel Anda
4. Tunggu proses import
5. Lihat hasil:
   - ✅ Berhasil: Data akan muncul di tabel
   - ❌ Error: Akan muncul pesan error dengan nomor baris

---

## 🔍 Cara Mendapatkan ID dengan Mudah

### Script Helper untuk Developer

Buat file `get-ids.html` dan buka di browser:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Get IDs Helper</title>
    <style>
      body {
        font-family: Arial;
        padding: 20px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      button {
        background: #0d6b44;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 10px 5px;
      }
      button:hover {
        background: #004220;
      }
      pre {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        overflow: auto;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background: #0d6b44;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔍 Helper - Dapatkan ID untuk Import Tahfidz</h1>

      <h2>1. Login Token</h2>
      <p>Paste token Anda (dari localStorage setelah login):</p>
      <input
        type="text"
        id="token"
        placeholder="Paste token di sini"
        style="width: 100%; padding: 10px;"
      />

      <h2>2. Dapatkan Data</h2>
      <button onclick="getResidents()">Get Resident IDs</button>
      <button onclick="getTargetHafalan()">Get Target Hafalan IDs</button>
      <button onclick="generateTemplate()">Generate Excel Template</button>

      <div id="residents-section" style="display:none;">
        <h3>📋 Daftar Resident di Lantai Anda:</h3>
        <div id="residents-table"></div>
      </div>

      <div id="target-section" style="display:none;">
        <h3>🎯 Daftar Target Hafalan:</h3>
        <div id="target-table"></div>
      </div>

      <div id="template-section" style="display:none;">
        <h3>📄 Template Excel:</h3>
        <p>Copy paste ke Excel:</p>
        <pre id="template-data"></pre>
      </div>
    </div>

    <script>
      const API_BASE = "http://localhost:3001";

      function getToken() {
        return document.getElementById("token").value;
      }

      async function getResidents() {
        const token = getToken();
        if (!token) {
          alert("Masukkan token terlebih dahulu!");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/musyrif/residents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.success) {
            let html =
              "<table><tr><th>ID</th><th>Nama</th><th>Email</th><th>NIM</th><th>Usroh</th></tr>";
            data.data.forEach((r) => {
              html += `<tr>
                            <td><strong>${r.id}</strong></td>
                            <td>${r.name}</td>
                            <td>${r.email}</td>
                            <td>${r.nim}</td>
                            <td>${r.usroh}</td>
                        </tr>`;
            });
            html += "</table>";

            document.getElementById("residents-table").innerHTML = html;
            document.getElementById("residents-section").style.display =
              "block";

            // Save to global for template
            window.residentsData = data.data;
          } else {
            alert("Error: " + data.message);
          }
        } catch (error) {
          alert("Error: " + error.message);
        }
      }

      async function getTargetHafalan() {
        const token = getToken();
        if (!token) {
          alert("Masukkan token terlebih dahulu!");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/musyrif/target-hafalan`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.success) {
            let html = "<table><tr><th>ID</th><th>Nama</th><th>Surah</th></tr>";
            data.data.forEach((t) => {
              html += `<tr>
                            <td><strong>${t.id}</strong></td>
                            <td>${t.nama}</td>
                            <td>${t.surah}</td>
                        </tr>`;
            });
            html += "</table>";

            document.getElementById("target-table").innerHTML = html;
            document.getElementById("target-section").style.display = "block";

            // Save to global for template
            window.targetData = data.data;
          } else {
            alert("Error: " + data.message);
          }
        } catch (error) {
          alert("Error: " + error.message);
        }
      }

      function generateTemplate() {
        if (!window.residentsData || !window.targetData) {
          alert("Dapatkan data residents dan target hafalan terlebih dahulu!");
          return;
        }

        let template = "residentId\ttargetHafalanId\tstatus\tnilaiHuruf\n";

        // Generate sample data
        const statuses = ["Lulus", "Belum Lulus", "Dalam Proses"];
        const nilais = ["A", "B", "C", "D", "E"];

        for (let i = 0; i < Math.min(5, window.residentsData.length); i++) {
          const resident = window.residentsData[i];
          const target = window.targetData[0]; // First target
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const nilai = nilais[Math.floor(Math.random() * nilais.length)];

          template += `${resident.id}\t${target.id}\t${status}\t${nilai}\n`;
        }

        document.getElementById("template-data").textContent = template;
        document.getElementById("template-section").style.display = "block";

        alert(
          "Template berhasil dibuat! Copy paste ke Excel (akan otomatis jadi tabel)"
        );
      }
    </script>
  </body>
</html>
```

**Cara Pakai:**

1. Save file di atas sebagai `get-ids.html`
2. Buka di browser
3. Login ke aplikasi, ambil token dari localStorage (F12 → Application → Local Storage → token)
4. Paste token di input box
5. Klik tombol untuk dapatkan data
6. Klik "Generate Excel Template" untuk auto-generate template

---

## ✅ Validasi & Error Handling

### Validasi yang Dilakukan Backend:

1. **Field Required:**

   - Semua field harus diisi (residentId, targetHafalanId, status, nilaiHuruf)

2. **Resident Exists:**

   - residentId harus ada di database

3. **Hak Akses (PENTING!):**

   - Resident HARUS berada di lantai yang dipegang musyrif
   - Jika beda lantai → Error: "Resident bukan binaan Anda (beda lantai)"

4. **Target Hafalan Exists:**

   - targetHafalanId harus ada di database

5. **Valid Values:**
   - status: hanya `Lulus`, `Belum Lulus`, `Dalam Proses`
   - nilaiHuruf: hanya `A`, `B`, `C`, `D`, `E`

### Contoh Error Messages:

```
❌ "Field residentId, targetHafalanId, status, dan nilaiHuruf wajib diisi"
❌ "Resident dengan ID 999 tidak ditemukan"
❌ "Resident Ahmad bukan binaan Anda (beda lantai)"
❌ "Target Hafalan dengan ID 99 tidak ditemukan"
```

---

## 🎓 Contoh Praktis

### Scenario: Musyrif Budi (Lantai 2 Gedung A)

**Step 1:** Get residents

```
GET /api/musyrif/residents
→ Dapat: ID 5 (Ahmad), ID 6 (Budi), ID 7 (Citra)
```

**Step 2:** Get target hafalan

```
GET /api/musyrif/target-hafalan
→ Dapat: ID 1 (Juz 1), ID 2 (Juz 2), ID 3 (Juz 3)
```

**Step 3:** Buat Excel

```
residentId | targetHafalanId | status         | nilaiHuruf
-----------|-----------------|----------------|------------
5          | 1               | Lulus          | A
5          | 2               | Dalam Proses   | B
6          | 1               | Lulus          | A
6          | 2               | Belum Lulus    | C
7          | 1               | Dalam Proses   | B
```

**Step 4:** Upload → Semua berhasil! ✅

---

## 🚫 Common Mistakes

### Mistake 1: Salah ID

```excel
residentId: 999  ← Tidak ada di database
```

**Fix:** Cek daftar resident terlebih dahulu

### Mistake 2: Resident Beda Lantai

```excel
residentId: 10  ← Resident lantai 3, tapi musyrif pegang lantai 2
```

**Fix:** Hanya gunakan resident di lantai Anda

### Mistake 3: Status Salah Tulis

```excel
status: "lulus"  ← Huruf kecil semua
```

**Fix:** Gunakan "Lulus" (huruf besar di awal)

### Mistake 4: Nilai Huruf Invalid

```excel
nilaiHuruf: "F"  ← Tidak ada nilai F
```

**Fix:** Gunakan A, B, C, D, atau E saja

---

## 📞 Troubleshooting

### "Token tidak ditemukan"

- Anda belum login atau token expired
- Login ulang untuk dapatkan token baru

### "Lantai binaan tidak ditemukan"

- User Anda bukan musyrif
- Atau musyrif belum assign ke lantai manapun
- Hubungi admin untuk assign lantai

### "File Excel kosong"

- File yang diupload tidak ada data
- Pastikan ada minimal 1 baris data (selain header)

### "Format file tidak valid"

- File bukan .xlsx atau .xls
- Save ulang file sebagai Excel Workbook

---

## 🎯 Next Steps

Setelah berhasil import, Anda bisa:

- ✅ Lihat data di halaman Tahfidz
- ✅ Search by nama/email/surah
- ✅ Filter by usroh
- ✅ Klik icon mata untuk lihat detail
- ✅ Export data (coming soon)

Jika ada pertanyaan, hubungi admin atau developer! 🚀
