# 🔍 Debug Panduan - Halaman Revisi Nilai Tahfidz

## Langkah Testing:

### 1. **Buka Browser & Console**

- Buka halaman: `http://localhost:3000/pembina/dashboard/revisi`
- Tekan `F12` atau `Ctrl + Shift + I` untuk buka Developer Tools
- Pilih tab **Console**

### 2. **Cek Data yang Ter-fetch**

Setelah halaman load, cari di console:

```
🔍 Debug - Nilai Data: {success: true, data: [...]}
🔍 Debug - Residents Data: {success: true, data: [...]}
🔍 Debug - Usroh Data: {success: true, data: [...]}
🔍 Debug - Target Hafalan Data: {success: true, data: [...]}
```

**EXPECTED:**

- `Residents Data` harus punya array dengan field: `id`, `name`, `nim`
- `Target Hafalan Data` harus punya array dengan field: `id`, `nama`, `surah`, `ayatMulai`, `ayatAkhir`

### 3. **Klik Tombol "Tambah Nilai"**

Di console akan muncul:

```
🎯 Add Button Clicked
📋 Residents available: [{id: 1, name: "...", nim: "..."}, ...]
🎯 Target Hafalan available: [{id: 1, nama: "Target 1", surah: "An-Naba'", ...}, ...]
```

### 4. **Cek Modal Terbuka**

Di console akan muncul:

```
🔍 Modal Debug - Residents: [...]
🔍 Modal Debug - Target Hafalan: [...]
🔍 Modal Debug - Mode: "add"
🔍 Modal Debug - Data: null
```

## ❗ Troubleshooting

### Masalah: Dropdown Resident Kosong

**Kemungkinan:**

1. ❌ Data `residents` array kosong → Cek apakah musyrif punya resident di lantainya
2. ❌ Response structure salah → Cek `residentsData.data` di console
3. ❌ Field mapping salah → Cek apakah ada field `id`, `name`, `nim`

**Solusi:**

- Pastikan login sebagai musyrif yang punya resident
- Cek database: `SELECT * FROM Resident WHERE lantaiId = [lantai_musyrif];`

### Masalah: Dropdown Target Hafalan Kosong

**Kemungkinan:**

1. ❌ Data `targetHafalan` array kosong → Database belum di-seed
2. ❌ Response structure salah → Cek `targetData.data` di console

**Solusi:**

```bash
cd myunires-be
node -e "import('./prisma/reset-and-seed.js')"
```

### Masalah: Warna Badge Tidak Kelihatan

**Sudah diperbaiki:**

- ✅ Ganti dari `bg-green-100` ke `bg-green-500` (warna lebih solid)
- ✅ Ganti text dari `text-green-800` ke `text-white` (kontras lebih tinggi)
- ✅ Tambah `font-bold` dan `text-sm` untuk lebih jelas

## 📊 Expected Data Structure

### Residents:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ahmad Fauzi",
      "nim": "20220000001",
      "email": "ahmad.fauzi.ft22@mail.umy.ac.id",
      "usroh": "Abu Bakar Ash-Shiddiq",
      "usrohId": 1
    }
  ]
}
```

### Target Hafalan:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Target 1",
      "surah": "An-Naba'",
      "ayatMulai": 1,
      "ayatAkhir": 40
    }
  ]
}
```

## 🧪 Test Checklist

- [ ] Backend running di `localhost:3001`
- [ ] Frontend running di `localhost:3000`
- [ ] Login sebagai musyrif (budi@unires.ac.id / password123)
- [ ] Console terbuka (F12)
- [ ] Cek 4 console log data ter-fetch
- [ ] Klik "Tambah Nilai"
- [ ] Modal terbuka dengan dropdown berisi data
- [ ] Badge warna terlihat jelas di tabel

## 📞 Jika Masih Error

Screenshot bagian:

1. Console log (4 debug log awal)
2. Modal (tampilkan dropdown kosong)
3. Network tab → Response dari endpoint `/residents` dan `/target-hafalan`
