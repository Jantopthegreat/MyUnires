# 📋 Cara Mendapatkan usrohId dan lantaiId untuk Import Excel

## 🎯 Masalah: usrohId dan lantaiId tidak masuk ke database

Jika data **name, nim, angkatan, email** berhasil tersimpan, tetapi **usroh, asrama, dan noTelp** tidak masuk, kemungkinan:

1. **usrohId tidak valid** - ID yang Anda masukkan tidak ada di database
2. **lantaiId tidak valid** - ID yang Anda masukkan tidak ada di database
3. **Format data salah** - Bukan angka, atau ada spasi

---

## ✅ SOLUSI 1: Cek ID yang Valid via Browser Console

### Langkah-langkah:

1. **Login sebagai Musyrif** ke aplikasi
2. **Buka halaman Resident** (menu Daftar Nama Resident)
3. **Tekan F12** untuk buka DevTools
4. **Pilih tab Console**
5. **Copy-paste kode ini** dan tekan Enter:

```javascript
// Lihat daftar Usroh beserta ID-nya
console.log("=== DAFTAR USROH ===");
fetch("http://localhost:3001/api/musyrif/usroh", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => {
    console.table(d.data);
    console.log("💡 Gunakan kolom 'id' untuk usrohId di Excel");
  });

// Lihat daftar Lantai beserta ID-nya
console.log("\n=== DAFTAR LANTAI ===");
fetch("http://localhost:3001/api/musyrif/lantai", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => {
    console.table(d.data);
    console.log("💡 Gunakan kolom 'id' untuk lantaiId di Excel");
  });
```

6. **Lihat hasil di Console**, akan muncul tabel seperti ini:

**Contoh Output Usroh:**

```
┌─────────┬────┬──────────────────┐
│ (index) │ id │      nama        │
├─────────┼────┼──────────────────┤
│    0    │ 1  │ Usroh Al-Ikhlas  │
│    1    │ 2  │ Usroh Al-Falah   │
│    2    │ 3  │ Usroh Al-Furqon  │
└─────────┴────┴──────────────────┘
```

**Contoh Output Lantai:**

```
┌─────────┬────┬───────────────────────┐
│ (index) │ id │         nama          │
├─────────┼────┼───────────────────────┤
│    0    │ 1  │ Gedung A Lantai 1     │
│    1    │ 2  │ Gedung A Lantai 2     │
│    2    │ 3  │ Gedung B Lantai 1     │
└─────────┴────┴───────────────────────┘
```

7. **Catat ID-nya** dan gunakan di Excel

---

## ✅ SOLUSI 2: Dari Data Seeder (Default)

Jika Anda menjalankan seeder dengan `npm run seed`, ID default adalah:

### **Usroh ID:**

- `1` = Usroh Al-Ikhlas
- `2` = Usroh Al-Falah
- `3` = Usroh Al-Furqon

### **Lantai ID:**

- `1` = Gedung A Lantai 1
- `2` = Gedung A Lantai 2
- `3` = Gedung B Lantai 1

---

## 📝 Cara Menggunakan di Excel

### **Format Excel yang Benar:**

| name  | email                | password | nim     | jurusan | angkatan | noTelp       | usrohId | lantaiId |
| ----- | -------------------- | -------- | ------- | ------- | -------- | ------------ | ------- | -------- |
| Ahmad | ahmad@mail.umy.ac.id | pass123  | 2024001 | TI      | 2024     | 081234567890 | **1**   | **1**    |
| Budi  | budi@mail.umy.ac.id  | pass123  | 2024002 | FK      | 2024     | 081234567891 | **2**   | **2**    |

**PENTING:**

- ✅ usrohId harus **ANGKA** (1, 2, 3)
- ✅ lantaiId harus **ANGKA** (1, 2, 3)
- ✅ **JANGAN** pakai text ("Usroh Al-Ikhlas", "Gedung A")
- ✅ Pastikan ID-nya **ada di database**

---

## ⚠️ Kesalahan Umum

### ❌ SALAH:

| usrohId                           | lantaiId          |
| --------------------------------- | ----------------- |
| Usroh Al-Ikhlas                   | Gedung A Lantai 1 |
| usroh1                            | lantai1           |
| "1" (dengan tanda petik di Excel) | "2"               |

### ✅ BENAR:

| usrohId | lantaiId |
| ------- | -------- |
| 1       | 1        |
| 2       | 2        |
| 3       | 3        |

---

## 🔧 Jika ID Tidak Valid

### **Gejala:**

- Data name, email, nim masuk
- usroh dan asrama tidak masuk / null
- Terminal backend menampilkan:
  ```
  ⚠️ Row 2 - Invalid usrohId: 5, akan di-skip
  ⚠️ Row 2 - Invalid lantaiId: 10, akan di-skip
  ```

### **Solusi:**

1. **Cek ID yang valid** dengan cara di atas
2. **Ganti angka di Excel** dengan ID yang valid
3. **Upload ulang**

---

## 💡 Tips:

### **Jika Tidak Mau Isi usrohId/lantaiId:**

**Boleh dikosongkan!** Kolom ini opsional:

| name  | email                | password | nim     | jurusan | angkatan | noTelp       | usrohId    | lantaiId   |
| ----- | -------------------- | -------- | ------- | ------- | -------- | ------------ | ---------- | ---------- |
| Ahmad | ahmad@mail.umy.ac.id | pass123  | 2024001 | TI      | 2024     | 081234567890 | _(kosong)_ | _(kosong)_ |

Data akan tersimpan dengan usroh dan lantai = **null** (bisa diupdate nanti).

### **Format noTelp:**

noTelp bisa berbagai format:

- ✅ `081234567890`
- ✅ `+6281234567890`
- ✅ `0812-3456-7890`
- ⚠️ Boleh kosong

---

## 🧪 Test dengan Data Ini:

Copy-paste ke Excel (Cell A1):

```
name	email	password	nim	jurusan	angkatan	noTelp	usrohId	lantaiId
Test Usroh 1	test.usroh1@mail.umy.ac.id	pass123	2024888001	Teknik Informatika	2024	081234567890	1	1
Test Usroh 2	test.usroh2@mail.umy.ac.id	pass123	2024888002	Kedokteran	2024	081234567891	2	2
Test Usroh 3	test.usroh3@mail.umy.ac.id	pass123	2024888003	Teknik Elektro	2024	081234567892	3	3
Test Tanpa Usroh	test.tanpa@mail.umy.ac.id	pass123	2024888004	Farmasi	2024	081234567893
```

**Baris terakhir** kosong di usrohId dan lantaiId → akan tersimpan dengan null (boleh).

Save as .xlsx dan upload!

---

## 🔍 Cara Cek di Terminal Backend

Setelah upload, lihat terminal backend:

```
✅ Row 2 - Valid usrohId: 1
✅ Row 2 - Valid lantaiId: 1
✅ Row 2 - Successfully created: test.usroh1@mail.umy.ac.id
   - Usroh: 1, Lantai: 1, NoTelp: 081234567890

⚠️ Row 5 - Invalid usrohId: undefined, akan di-skip
⚠️ Row 5 - Invalid lantaiId: undefined, akan di-skip
✅ Row 5 - Successfully created: test.tanpa@mail.umy.ac.id
   - Usroh: tidak diset, Lantai: tidak diset, NoTelp: 081234567893
```

Jika muncul `Invalid usrohId`, artinya ID yang Anda input tidak ada di database!

---

**Sekarang usroh, lantai, dan noTelp akan masuk dengan benar!** ✅
