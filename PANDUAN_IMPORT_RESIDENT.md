# 📋 Template Import Resident Excel - PANDUAN LENGKAP

## ⚠️ PENTING - Nama Kolom Harus PERSIS!

Buat file Excel dengan header di baris pertama seperti ini (HURUF KECIL SEMUA):

```
name | email | password | nim | jurusan | angkatan | noTelp | usrohId | lantaiId
```

## 📊 Contoh Data yang Benar:

| name          | email                              | password    | nim        | jurusan            | angkatan | noTelp       | usrohId | lantaiId |
| ------------- | ---------------------------------- | ----------- | ---------- | ------------------ | -------- | ------------ | ------- | -------- |
| Farhan Rizky  | farhan.rizky.ft23@mail.umy.ac.id   | password123 | 2023010010 | Teknik Informatika | 2023     | 081234567890 | 1       | 1        |
| Siti Aisyah   | siti.aisyah.fk23@mail.umy.ac.id    | password123 | 2023010011 | Kedokteran         | 2023     | 081234567891 | 2       | 2        |
| Candra Wijaya | candra.wijaya.fte23@mail.umy.ac.id | password123 | 2023010012 | Teknik Elektro     | 2023     | 081234567892 | 1       | 1        |

## 📝 Keterangan Kolom:

### ✅ Kolom WAJIB (tidak boleh kosong):

- **name**: Nama lengkap resident
- **email**: Email unik (@mail.umy.ac.id) - tidak boleh duplikat
- **password**: Password untuk login pertama kali
- **nim**: Nomor Induk Mahasiswa

### ⚪ Kolom OPSIONAL (boleh kosong):

- **jurusan**: Nama jurusan (kosong = "Belum Diisi")
- **angkatan**: Tahun angkatan (kosong = tahun sekarang)
- **noTelp**: Nomor telepon
- **usrohId**: ID usroh (angka)
- **lantaiId**: ID lantai (angka)

## 🔍 Cara Melihat usrohId dan lantaiId:

### Dari Data Seeder:

**Usroh:**

- ID 1 = Usroh Al-Ikhlas
- ID 2 = Usroh Al-Falah
- ID 3 = Usroh Al-Furqon

**Lantai:**

- ID 1 = Gedung A Lantai 1
- ID 2 = Gedung A Lantai 2
- ID 3 = Gedung B Lantai 1

### Atau via Browser Console:

1. Login sebagai Musyrif
2. Tekan F12 → Console
3. Jalankan kode ini:

```javascript
// Lihat semua usroh
fetch("http://localhost:3001/api/musyrif/usroh", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => console.table(d.data));

// Lihat semua lantai
fetch("http://localhost:3001/api/musyrif/lantai", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => console.table(d.data));
```

## 🚀 Langkah-langkah Import:

### 1. Buat File Excel

- Buka Microsoft Excel / Google Sheets / LibreOffice Calc
- Di **baris 1**, ketik header (copy paste untuk akurat):
  ```
  name	email	password	nim	jurusan	angkatan	noTelp	usrohId	lantaiId
  ```
- Mulai isi data dari **baris 2**

### 2. Isi Data

- Pastikan kolom wajib (name, email, password, nim) terisi
- Email harus unik dan format: nama.jurusan.angkatan@mail.umy.ac.id
- usrohId dan lantaiId harus ANGKA (1, 2, 3, dst)
- angkatan juga ANGKA (2023, 2024, dst)

### 3. Save File

- File → Save As
- Pilih format: **Excel Workbook (.xlsx)** atau **.xls**
- Beri nama file, misal: `import_residents_2024.xlsx`

### 4. Upload ke Aplikasi

- Login sebagai Musyrif (misal: ahmad@unires.ac.id)
- Buka menu **Daftar Nama Resident**
- Klik tombol **"Impor Data"**
- Pilih file Excel yang sudah dibuat
- Tunggu proses selesai
- Lihat notifikasi sukses/error

## ❌ Troubleshooting Error:

### Error: "Import 0 dari X data"

**Kemungkinan Penyebab:**

1. **Nama kolom salah** ❌

   ```
   Name  Email  Password  (SALAH - huruf besar)
   ```

   ✅ **Harus:**

   ```
   name  email  password  (huruf kecil semua)
   ```

2. **Ada field wajib yang kosong**

   - Cek semua baris punya name, email, password, nim
   - Jangan ada cell kosong di kolom wajib

3. **Email duplikat**

   - Email harus unik
   - Cek apakah email sudah ada di database

4. **Format file salah**
   - Harus .xlsx atau .xls
   - Bukan .csv atau .txt

### Cara Debug:

1. **Buka Console Browser** (F12 → Console)

   - Lihat error detail yang muncul
   - Akan tampil row mana yang error

2. **Cek Terminal Backend**

   - Lihat log di terminal yang menjalankan `npm run dev`
   - Akan tampil detail error per row

3. **Test dengan 1 data dulu**
   - Buat file dengan 1 baris data saja
   - Jika berhasil, tambah data lainnya

## 📥 Download Template Excel:

Buat file Excel baru dan copy paste tabel ini:

| name         | email                            | password    | nim        | jurusan            | angkatan | noTelp       | usrohId | lantaiId |
| ------------ | -------------------------------- | ----------- | ---------- | ------------------ | -------- | ------------ | ------- | -------- |
| Farhan Rizky | farhan.rizky.ft23@mail.umy.ac.id | password123 | 2023010010 | Teknik Informatika | 2023     | 081234567890 | 1       | 1        |
| Siti Aisyah  | siti.aisyah.fk23@mail.umy.ac.id  | password123 | 2023010011 | Kedokteran         | 2023     | 081234567891 | 2       | 2        |

Ganti data sesuai kebutuhan, lalu save as .xlsx

## ✅ Checklist Sebelum Import:

- [ ] File format .xlsx atau .xls
- [ ] Baris 1 berisi header dengan nama kolom yang PERSIS
- [ ] Kolom name, email, password, nim terisi semua
- [ ] Email unik, tidak ada yang sama
- [ ] Email format: nama.xxx.angkatan@mail.umy.ac.id
- [ ] usrohId dan lantaiId berupa ANGKA (jika diisi)
- [ ] angkatan berupa ANGKA (jika diisi)
- [ ] Backend sedang running di port 3001
- [ ] Sudah login sebagai Musyrif

## 📞 Bantuan Tambahan:

Jika masih error setelah mengikuti panduan ini:

1. Screenshot error di console browser
2. Screenshot file Excel yang digunakan
3. Copy paste error dari terminal backend
4. Pastikan backend dan frontend sedang running

---

**Contoh Excel yang 100% Benar:**

Sheet1:

```
A1: name           B1: email                              C1: password    D1: nim        E1: jurusan            F1: angkatan  G1: noTelp       H1: usrohId  I1: lantaiId
A2: Farhan Rizky   B2: farhan.rizky.ft23@mail.umy.ac.id  C2: pass123     D2: 2023010010 E2: Teknik Informatika F2: 2023      G2: 081234567890 H2: 1        I2: 1
A3: Siti Aisyah    B3: siti.aisyah.fk23@mail.umy.ac.id   C3: pass123     D3: 2023010011 E3: Kedokteran         F3: 2023      G3: 081234567891 H3: 2        I3: 2
```

Save file ini dan coba import!
