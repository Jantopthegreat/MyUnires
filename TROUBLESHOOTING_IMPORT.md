# 🐛 DEBUGGING IMPORT EXCEL - Solusi Error "Import 0 dari X data"

## 🔍 Langkah 1: Lihat Error Detail

1. **Buka Browser Console** (Tekan F12)
2. **Pilih tab Console**
3. **Lihat error yang muncul**, cari baris seperti ini:
   ```
   ❌ Row 2 - Missing fields: ["name", "email"]
   atau
   ❌ Row 2 - Email already exists: xxx@mail.umy.ac.id
   ```

## 🧪 Langkah 2: Test dengan Data Minimal

Buat file Excel BARU dengan format ini:

### **File: test_import.xlsx**

**Sheet1:**

| A (name)    | B (email)                     | C (password) | D (nim)    |
| ----------- | ----------------------------- | ------------ | ---------- |
| name        | email                         | password     | nim        |
| Test User 1 | testuser1.ft24@mail.umy.ac.id | pass123      | 9999999991 |
| Test User 2 | testuser2.ft24@mail.umy.ac.id | pass123      | 9999999992 |

**PENTING:**

- Baris 1 = Header (name, email, password, nim)
- Baris 2 dst = Data
- **JANGAN ada kolom lain dulu** (jurusan, angkatan, dll)
- Email harus yang **BELUM PERNAH** dipakai
- NIM harus unik

### Cara Buat di Excel:

1. Buka Excel baru
2. Di Cell **A1** ketik: `name`
3. Di Cell **B1** ketik: `email`
4. Di Cell **C1** ketik: `password`
5. Di Cell **D1** ketik: `nim`
6. Di Cell **A2** ketik: `Test User 1`
7. Di Cell **B2** ketik: `testuser1.ft24@mail.umy.ac.id`
8. Di Cell **C2** ketik: `pass123`
9. Di Cell **D2** ketik: `9999999991`
10. Ulangi untuk baris 3 dengan data Test User 2
11. **Save as Excel Workbook (.xlsx)**

### Test Upload:

1. Upload file ini
2. Lihat hasilnya di console
3. **Jika BERHASIL** → lanjut ke langkah 3
4. **Jika GAGAL** → lihat error di console, laporkan

## 🔧 Langkah 3: Cek Terminal Backend

Buka terminal yang menjalankan backend (`npm run dev`), cari output seperti:

```
📁 File received: test_import.xlsx
📊 Data parsed from Excel: 2 rows
📋 First row sample: {
  name: 'Test User 1',
  email: 'testuser1.ft24@mail.umy.ac.id',
  password: 'pass123',
  nim: '9999999991'
}

🔄 Processing row 2: {...}
✅ Row 2 - Successfully created: testuser1.ft24@mail.umy.ac.id

🔄 Processing row 3: {...}
✅ Row 3 - Successfully created: testuser2.ft24@mail.umy.ac.id

📊 Import Summary:
  ✅ Imported: 2
  ❌ Failed: 0
```

### Jika Output Menunjukkan:

**A. "First row sample: {}" (object kosong)**
→ **MASALAH:** Excel tidak terbaca
→ **SOLUSI:**

- Pastikan baris 1 ada header
- Jangan ada baris kosong di atas header
- Save as .xlsx (bukan .csv)

**B. "Missing fields: ['name']"**
→ **MASALAH:** Nama kolom salah atau typo
→ **SOLUSI:**

- Ketik ulang header: `name` `email` `password` `nim`
- Huruf kecil semua
- Tidak ada spasi

**C. "Email already exists"**
→ **MASALAH:** Email sudah terdaftar
→ **SOLUSI:**

- Ganti dengan email lain
- Atau hapus data lama dengan seeder: `npm run seed`

## 📋 Langkah 4: Format Excel yang Pasti Benar

### Cara Paling Aman:

1. **Copy text ini:**

```
name	email	password	nim	jurusan	angkatan	noTelp	usrohId	lantaiId
Test Resident 1	test.resident1.ft24@mail.umy.ac.id	password123	2024888001	Teknik Informatika	2024	081234567890	1	1
Test Resident 2	test.resident2.fk24@mail.umy.ac.id	password123	2024888002	Kedokteran	2024	081234567891	2	2
```

2. **Buka Excel**
3. **Paste di Cell A1**
4. **Data akan otomatis masuk ke kolom yang benar** (karena ada TAB di antara)
5. **Save as .xlsx**
6. **Upload**

## 🎯 Langkah 5: Gunakan Script Debug

1. Buka halaman Resident
2. Tekan **F12** → **Console**
3. **Copy-paste** isi file `debug-import.js`
4. Tekan **Enter**
5. Lihat output:
   - Apakah backend running?
   - Usroh ID apa saja yang tersedia?
   - Lantai ID apa saja yang tersedia?
   - Email apa saja yang sudah terdaftar?

## ❌ Error Umum dan Solusi:

### Error 1: "Import 0 dari X data"

**Penyebab:** Data tidak terbaca atau validasi gagal
**Solusi:**

1. Cek console browser untuk detail error
2. Cek terminal backend untuk log
3. Pastikan header persis: `name`, `email`, `password`, `nim`
4. Pastikan tidak ada baris kosong

### Error 2: "Missing fields: ['email']"

**Penyebab:** Kolom email tidak ketemu
**Solusi:**

1. Pastikan header di B1 adalah `email` (huruf kecil)
2. Jangan ada spasi: ❌ `email ` ✅ `email`
3. Ketik ulang manual, jangan copy-paste yang aneh

### Error 3: "Email already exists"

**Penyebab:** Email sudah dipakai resident lain
**Solusi:**

1. Ganti email dengan yang baru
2. Format: `nama.jurusan.angkatan@mail.umy.ac.id`
3. Cek dulu email yang sudah ada dengan script debug

### Error 4: File tidak terbaca

**Penyebab:** Format file bukan .xlsx
**Solusi:**

1. Jangan save as .csv
2. Harus: **Excel Workbook (.xlsx)**
3. Atau **Excel 97-2003 Workbook (.xls)**

## 🆘 Jika Masih Gagal:

Kirimkan ke developer:

1. **Screenshot** file Excel yang digunakan (tampilkan kolom A-I)
2. **Screenshot** error di Console browser
3. **Copy-paste** output dari terminal backend
4. **Screenshot** Sweet Alert yang muncul

## ✅ Checklist Sebelum Upload:

- [ ] File format .xlsx atau .xls
- [ ] Baris 1 = Header (name, email, password, nim, dst)
- [ ] Header huruf kecil semua
- [ ] Tidak ada baris kosong di atas header
- [ ] Email unik (belum pernah dipakai)
- [ ] NIM unik
- [ ] Backend running di terminal
- [ ] Frontend running di browser
- [ ] Sudah login sebagai Musyrif

## 💡 Tips Pro:

1. **Test dulu dengan 1-2 data**
2. **Jangan langsung 100 data**
3. **Gunakan NIM palsu dulu** (9999xxx) untuk testing
4. **Setelah berhasil, baru input data real**
5. **Backup database sebelum import banyak**

---

**Need Help?**

- Baca `PANDUAN_IMPORT_RESIDENT.md` untuk detail
- Jalankan `debug-import.js` untuk cek koneksi
- Lihat console browser & terminal backend untuk error detail
