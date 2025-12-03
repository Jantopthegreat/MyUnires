# Template Import Nilai Tahfidz

## Format File Excel

File Excel harus memiliki kolom-kolom berikut (case-sensitive):

| residentId | targetHafalanId | status       | nilaiHuruf |
| ---------- | --------------- | ------------ | ---------- |
| 1          | 1               | Lulus        | A          |
| 2          | 1               | Dalam Proses | B          |
| 3          | 2               | Belum Lulus  | C          |

## Penjelasan Kolom

### 1. residentId (Required)

- **Tipe**: Number
- **Deskripsi**: ID resident yang akan dinilai
- **Catatan**: Resident HARUS berada di lantai yang sama dengan musyrif yang login
- **Contoh**: `1`, `2`, `3`

### 2. targetHafalanId (Required)

- **Tipe**: Number
- **Deskripsi**: ID target hafalan dari tabel TargetHafalan
- **Contoh**: `1`, `2`, `3`
- **Cara cek**: Lihat di database tabel `TargetHafalan` atau tanya admin

### 3. status (Required)

- **Tipe**: String
- **Pilihan yang valid**:
  - `Lulus`
  - `Belum Lulus`
  - `Dalam Proses`
- **Contoh**: `Lulus`

### 4. nilaiHuruf (Required)

- **Tipe**: String (1 huruf)
- **Pilihan yang valid**: `A`, `B`, `C`, `D`, `E`
- **Contoh**: `A`

## Validasi Otomatis

Backend akan melakukan validasi berikut:

### ✅ Validasi Hak Akses

- Cek apakah resident ada di database
- **Cek apakah resident berada di lantai yang dipegang musyrif**
- Jika resident bukan binaan musyrif → **ERROR: "Resident bukan binaan Anda (beda lantai)"**

### ✅ Validasi Data

- Semua field harus diisi (tidak boleh kosong)
- residentId harus ada di database
- targetHafalanId harus ada di database
- status harus salah satu dari: Lulus, Belum Lulus, Dalam Proses
- nilaiHuruf harus salah satu dari: A, B, C, D, E

### ✅ Update vs Create

- Jika kombinasi (residentId + targetHafalanId) **sudah ada** → **UPDATE** nilai lama
- Jika kombinasi (residentId + targetHafalanId) **belum ada** → **CREATE** nilai baru

## Contoh Data Valid

### Scenario 1: Musyrif Budi (Lantai 2, Gedung A)

Budi hanya bisa import nilai untuk resident yang berada di **Lantai 2, Gedung A**.

**residents_lantai2.xlsx**

```
residentId | targetHafalanId | status         | nilaiHuruf
-----------|-----------------|-----------------|-----------
5          | 1               | Lulus           | A
5          | 2               | Dalam Proses    | B
6          | 1               | Belum Lulus     | C
7          | 1               | Lulus           | A
```

**Hasil:**

- Row 2-5: ✅ Berhasil (semua resident ada di Lantai 2 Gedung A)

### Scenario 2: Error - Beda Lantai

**residents_mixed.xlsx**

```
residentId | targetHafalanId | status         | nilaiHuruf
-----------|-----------------|-----------------|-----------
5          | 1               | Lulus           | A          <- OK (Lantai 2)
10         | 1               | Lulus           | A          <- ERROR (Lantai 3)
```

**Hasil:**

- Row 2: ✅ Berhasil diimpor
- Row 3: ❌ Error: "Resident Ahmad bukan binaan Anda (beda lantai)"

## Response Import

### Success Response

```json
{
  "success": true,
  "message": "Import berhasil",
  "successCount": 10,
  "skippedCount": 0
}
```

### Error Response

```json
{
  "success": false,
  "message": "Import selesai dengan 2 error",
  "successCount": 8,
  "skippedCount": 2,
  "errors": [
    {
      "row": 3,
      "message": "Resident dengan ID 999 tidak ditemukan"
    },
    {
      "row": 5,
      "message": "Resident Ahmad bukan binaan Anda (beda lantai)"
    }
  ]
}
```

## Tips Import

1. **Cek lantai binaan Anda terlebih dahulu**

   - Login ke sistem
   - Lihat dashboard untuk mengetahui lantai yang Anda pegang

2. **Export data resident terlebih dahulu**

   - Gunakan halaman "Resident Per Lantai"
   - Filter sesuai lantai Anda
   - Lihat ID resident yang valid

3. **Gunakan template ini**

   - Copy paste format di atas ke Excel baru
   - Isi data sesuai resident di lantai Anda
   - Save sebagai .xlsx atau .xls

4. **Upload dan cek error**
   - Upload file Excel
   - Jika ada error, perbaiki baris yang error
   - Upload ulang

## Troubleshooting

### Error: "Resident tidak ditemukan"

**Penyebab**: residentId salah atau resident tidak ada di database  
**Solusi**: Cek kembali ID resident di halaman Resident Per Lantai

### Error: "Resident bukan binaan Anda (beda lantai)"

**Penyebab**: Resident berada di lantai yang bukan binaan musyrif  
**Solusi**: Hanya import resident di lantai Anda. Cek lantai binaan di dashboard.

### Error: "Target Hafalan tidak ditemukan"

**Penyebab**: targetHafalanId salah atau tidak ada di database  
**Solusi**: Hubungi admin untuk mendapatkan daftar target hafalan yang valid

### Error: "Field wajib diisi"

**Penyebab**: Ada kolom yang kosong  
**Solusi**: Pastikan semua kolom terisi (residentId, targetHafalanId, status, nilaiHuruf)

## Keamanan & Hak Akses

🔒 **Prinsip Keamanan:**

- Musyrif **HANYA** bisa mengatur nilai untuk resident di **lantainya sendiri**
- Backend akan **reject** import jika ada resident dari lantai lain
- Setiap import di-validasi berdasarkan `lantaiId` musyrif yang login

**Contoh:**

- Budi (Musyrif Lantai 2 Gedung A) → Hanya bisa import resident Lantai 2 Gedung A
- Ahmad (Musyrif Lantai 3 Gedung B) → Hanya bisa import resident Lantai 3 Gedung B

Tidak ada cara untuk bypass validasi ini. Jika perlu import lintas lantai, hubungi Admin.
