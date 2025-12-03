# Template Import Resident Excel

Untuk import data resident, gunakan format Excel dengan kolom berikut:

## Kolom yang Diperlukan:

| name         | email                             | password    | nim        | jurusan            | angkatan | noTelp       | usrohId | lantaiId |
| ------------ | --------------------------------- | ----------- | ---------- | ------------------ | -------- | ------------ | ------- | -------- |
| Ahmad Fauzi  | ahmad.fauzi.ft22@mail.umy.ac.id   | password123 | 2022010001 | Teknik Informatika | 2022     | 082111111111 | 1       | 1        |
| Budi Santoso | budi.santoso.fsi22@mail.umy.ac.id | password123 | 2022010002 | Sistem Informasi   | 2022     | 082111111112 | 1       | 1        |

## Keterangan:

- **name**: Nama lengkap resident (wajib)
- **email**: Email format @mail.umy.ac.id (wajib, harus unik)
- **password**: Password default untuk login (wajib)
- **nim**: Nomor Induk Mahasiswa (wajib)
- **jurusan**: Nama jurusan (opsional, default: "Belum Diisi")
- **angkatan**: Tahun angkatan (opsional, default: tahun sekarang)
- **noTelp**: Nomor telepon (opsional)
- **usrohId**: ID usroh (opsional, lihat data usroh di database)
- **lantaiId**: ID lantai (opsional, lihat data lantai di database)

## Cara Menggunakan:

1. Buat file Excel (.xlsx atau .xls)
2. Isi baris pertama dengan header kolom seperti di atas
3. Isi data mulai dari baris kedua
4. Save file
5. Upload melalui tombol "Impor Data" di halaman Resident

## Catatan Penting:

- Email harus unik, tidak boleh ada yang sama
- Format email sebaiknya: nama.jurusan.angkatan@mail.umy.ac.id
- usrohId dan lantaiId harus sesuai dengan ID yang ada di database
- Jika ada error saat import, cek console browser untuk detail error
