import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('👤 Creating Admin...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@unires.ac.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create Gedung
  console.log('🏢 Creating Gedung...');
  const gedungY = await prisma.gedung.create({
    data: { nama: 'Gedung Y' }, // Putri
  });
  const gedungU = await prisma.gedung.create({
    data: { nama: 'Gedung U' }, // Putra
  });

  // 3. Create Lantai
  console.log('🏗️ Creating Lantai...');
  const lantaiY1 = await prisma.lantai.create({ data: { nama: 'Lantai 1', gedungId: gedungY.id } });
  const lantaiY2 = await prisma.lantai.create({ data: { nama: 'Lantai 2', gedungId: gedungY.id } });
  const lantaiY3 = await prisma.lantai.create({ data: { nama: 'Lantai 3', gedungId: gedungY.id } });
  const lantaiY4 = await prisma.lantai.create({ data: { nama: 'Lantai 4', gedungId: gedungY.id } });
  
  const lantaiU1 = await prisma.lantai.create({ data: { nama: 'Lantai 1', gedungId: gedungU.id } });
  const lantaiU2 = await prisma.lantai.create({ data: { nama: 'Lantai 2', gedungId: gedungU.id } });
  const lantaiU3 = await prisma.lantai.create({ data: { nama: 'Lantai 3', gedungId: gedungU.id } });
  const lantaiU4 = await prisma.lantai.create({ data: { nama: 'Lantai 4', gedungId: gedungU.id } });

  // 4. Create Usroh (4 per lantai = 32 total)
  console.log('👥 Creating Usroh...');
  const usrohData = [
    // Gedung Y - Lantai 1
    { nama: "Aisyah binti Abu Bakar", lantaiId: lantaiY1.id },
    { nama: "Hafshah binti Umar", lantaiId: lantaiY1.id },
    { nama: "Zainab binti Jahsy", lantaiId: lantaiY1.id },
    { nama: "Saudah binti Zam'ah", lantaiId: lantaiY1.id },
    // Gedung Y - Lantai 2
    { nama: "Khadijah binti Khuwailid", lantaiId: lantaiY2.id },
    { nama: "Ummu Habibah", lantaiId: lantaiY2.id },
    { nama: "Ummu Aiman", lantaiId: lantaiY2.id },
    { nama: "Raihanah binti Zaid", lantaiId: lantaiY2.id },
    // Gedung Y - Lantai 3
    { nama: "Ummu Salamah Hindun", lantaiId: lantaiY3.id },
    { nama: "Maimunah binti Al-Harith", lantaiId: lantaiY3.id },
    { nama: "Juwairiyah binti Al-Harith", lantaiId: lantaiY3.id },
    { nama: "Shafiyyah binti Huyay", lantaiId: lantaiY3.id },
    // Gedung Y - Lantai 4
    { nama: "Fatimah az-Zahra", lantaiId: lantaiY4.id },
    { nama: "Asma' binti Abu Bakar", lantaiId: lantaiY4.id },
    { nama: "Sumayyah binti Khayyat", lantaiId: lantaiY4.id },
    { nama: "Nusaibah binti Ka'ab", lantaiId: lantaiY4.id },
    // Gedung U - Lantai 1
    { nama: "Abu Bakar ash-Shiddiq", lantaiId: lantaiU1.id },
    { nama: "Umar bin Khattab", lantaiId: lantaiU1.id },
    { nama: "Utsman bin Affan", lantaiId: lantaiU1.id },
    { nama: "Ali bin Abi Thalib", lantaiId: lantaiU1.id },
    // Gedung U - Lantai 2
    { nama: "Bilal bin Rabah", lantaiId: lantaiU2.id },
    { nama: "Sa'ad bin Abi Waqqash", lantaiId: lantaiU2.id },
    { nama: "Abdurrahman bin Auf", lantaiId: lantaiU2.id },
    { nama: "Zubair bin Awwam", lantaiId: lantaiU2.id },
    // Gedung U - Lantai 3
    { nama: "Talhah bin Ubaidillah", lantaiId: lantaiU3.id },
    { nama: "Khalid bin Walid", lantaiId: lantaiU3.id },
    { nama: "Muadz bin Jabal", lantaiId: lantaiU3.id },
    { nama: "Abu Ubaidah bin Jarrah", lantaiId: lantaiU3.id },
    // Gedung U - Lantai 4
    { nama: "Anas bin Malik", lantaiId: lantaiU4.id },
    { nama: "Salman Al-Farisi", lantaiId: lantaiU4.id },
    { nama: "Ammar bin Yasir", lantaiId: lantaiU4.id },
    { nama: "Hudzaifah bin Yaman", lantaiId: lantaiU4.id },
  ];

  const usrohList = [];
  for (const data of usrohData) {
    const usroh = await prisma.usroh.create({ data });
    usrohList.push(usroh);
  }

  // 5. Create Musyrif (1 per lantai = 8 total)
  console.log('👨‍🏫 Creating Musyrif...');
  await prisma.user.create({
    data: {
      name: 'Ustadzah Aminah',
      email: 'aminah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiY1.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadzah Fatimah',
      email: 'fatimah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiY2.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadzah Khadijah',
      email: 'khadijah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiY3.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadzah Maryam',
      email: 'maryam@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiY4.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadz Ahmad',
      email: 'ahmad@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiU1.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadz Budi',
      email: 'budi@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiU2.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadz Hasan',
      email: 'hasan@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiU3.id } },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Ustadz Ibrahim',
      email: 'ibrahim@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: lantaiU4.id } },
    },
  });

  // 6. Create Asisten Musyrif (minimal 1)
  console.log('👨‍🎓 Creating Asisten Musyrif...');
  await prisma.user.create({
    data: {
      name: 'Muhammad Fajar',
      email: 'muhammad.fajar.ft21@mail.umy.ac.id',
      password: hashedPassword,
      role: 'ASISTEN',
      asisten: {
        create: {
          nim: '2021010001',
          jurusan: 'Teknik Informatika',
          angkatan: 2021,
          noTelp: '081234567890',
          usrohId: usrohList[0].id,
        },
      },
    },
  });

  // 7. Create Residents (4 per usroh = 128 total)
  console.log('🎓 Creating Residents...');
  
  const residentTemplate = {
    jurusan: [
      { nama: 'Teknik Informatika', kode: 'ft' },
      { nama: 'Teknik Elektro', kode: 'ft' },
      { nama: 'Teknik Mesin', kode: 'ft' },
      { nama: 'Teknik Sipil', kode: 'ft' },
      { nama: 'Sistem Informasi', kode: 'fti' },
      { nama: 'Informatika', kode: 'fti' },
      { nama: 'Pendidikan Agama Islam', kode: 'fai' },
      { nama: 'Ekonomi Pembangunan', kode: 'fe' },
      { nama: 'Akuntansi', kode: 'fe' },
      { nama: 'Manajemen', kode: 'fe' },
      { nama: 'Kedokteran', kode: 'fk' },
      { nama: 'Farmasi', kode: 'ff' },
      { nama: 'Psikologi', kode: 'fp' },
    ],
    angkatan: [2022, 2023, 2024],
  };

  const femaleNames = [
    'Zahra', 'Siti', 'Fathiya', 'Naila', 'Aisha', 'Rahma', 'Salma', 'Mariam',
    'Nabila', 'Hanifa', 'Aliya', 'Yasmin', 'Inara', 'Rania', 'Kayla', 'Laila',
    'Dina', 'Salsabila', 'Alifah', 'Putri', 'Najwa', 'Shafa', 'Hana', 'Farah',
    'Annisa', 'Kirana', 'Aqila', 'Azizah', 'Nadia', 'Raisa', 'Safina', 'Qonita',
    'Zara', 'Hasna', 'Amira', 'Balqis', 'Kinanti', 'Naura', 'Sekar', 'Alya',
    'Rifa', 'Maryam', 'Syifa', 'Ghania', 'Talita', 'Calista', 'Adzkia', 'Dzakira',
    'Khanza', 'Mahira', 'Aisyah', 'Sakina', 'Nadira', 'Kamilah', 'Alisha', 'Ratna',
    'Fariha', 'Nazwa', 'Assyifa', 'Qistina', 'Lathifa', 'Almira', 'Syakira', 'Humairah',
  ];

  const maleNames = [
    'Farhan', 'Rizki', 'Zaki', 'Hafiz', 'Fauzan', 'Daffa', 'Ibrahim', 'Yusuf',
    'Arif', 'Bayu', 'Aditya', 'Azka', 'Salman', 'Reza', 'Ilham', 'Haikal',
    'Malik', 'Akbar', 'Naufal', 'Rafi', 'Dzaki', 'Kemal', 'Fadhil', 'Alif',
    'Raihan', 'Kenzie', 'Azzam', 'Nadhif', 'Razan', 'Zahran', 'Hilal', 'Shidqi',
    'Harun', 'Gibran', 'Farrel', 'Rafif', 'Arkan', 'Athallah', 'Raziq', 'Kaisar',
    'Daniyal', 'Rayyan', 'Lutfi', 'Hanif', 'Khairan', 'Najib', 'Haekal', 'Muzakki',
    'Ghalib', 'Taufiq', 'Syamil', 'Furqan', 'Bariq', 'Najwan', 'Rafka', 'Ziyad',
    'Rasyid', 'Ghifari', 'Sahil', 'Faris', 'Rifqi', 'Tsaqif', 'Basil', 'Uwais',
  ];

  const lastNames = [
    'Putri', 'Rahmawati', 'Ahmad', 'Ibrahim', 'Malik', 'Sari', 'Dewi', 'Noor',
    'Ali', 'Rahman', 'Hidayat', 'Pratama', 'Nugroho', 'Hasan', 'Abdullah', 'Hakim',
  ];

  let residentCount = 0;
  for (let usrohIndex = 0; usrohIndex < usrohList.length; usrohIndex++) {
    const usroh = usrohList[usrohIndex];
    const isGedungY = usrohIndex < 16; // First 16 usroh are Gedung Y (female)
    const names = isGedungY ? femaleNames : maleNames;
    
    // Determine lantaiId based on usroh
    let lantaiId;
    if (usrohIndex < 4) lantaiId = lantaiY1.id;
    else if (usrohIndex < 8) lantaiId = lantaiY2.id;
    else if (usrohIndex < 12) lantaiId = lantaiY3.id;
    else if (usrohIndex < 16) lantaiId = lantaiY4.id;
    else if (usrohIndex < 20) lantaiId = lantaiU1.id;
    else if (usrohIndex < 24) lantaiId = lantaiU2.id;
    else if (usrohIndex < 28) lantaiId = lantaiU3.id;
    else lantaiId = lantaiU4.id;

    // Create 4 residents per usroh
    for (let i = 0; i < 4; i++) {
      const nameIndex = (usrohIndex * 4 + i) % names.length;
      const lastNameIndex = (residentCount) % lastNames.length;
      const firstName = names[nameIndex];
      const lastName = lastNames[lastNameIndex];
      const fullName = `${firstName} ${lastName}`;
      
      // Get jurusan and angkatan
      const jurusanData = residentTemplate.jurusan[residentCount % residentTemplate.jurusan.length];
      const angkatan = residentTemplate.angkatan[residentCount % residentTemplate.angkatan.length];
      
      // Generate NIM: YYYYNNNNNNN (YYYY = tahun, NNNNNNN = nomor urut)
      const nim = `${angkatan}${String(residentCount + 1).padStart(7, '0')}`;
      
      // Generate email: firstname.lastname.kode+tahun@mail.umy.ac.id
      // Example: zahra.putri.ft22@mail.umy.ac.id
      const emailFirstName = firstName.toLowerCase().replace(/'/g, '');
      const emailLastName = lastName.toLowerCase().replace(/'/g, '');
      const tahunSingkat = String(angkatan).slice(-2); // 2022 -> 22
      const email = `${emailFirstName}.${emailLastName}.${jurusanData.kode}${tahunSingkat}@mail.umy.ac.id`;

      await prisma.user.create({
        data: {
          name: fullName,
          email: email,
          password: hashedPassword,
          role: 'RESIDENT',
          resident: {
            create: {
              nim: nim,
              jurusan: jurusanData.nama,
              angkatan: angkatan,
              noTelp: `0821${String(residentCount + 1).padStart(8, '0')}`,
              usrohId: usroh.id,
              lantaiId: lantaiId,
            },
          },
        },
      });
      residentCount++;
    }
  }

  console.log(`✅ Created ${residentCount} residents`);

  // 8. Create Kategori Materi
  console.log('📚 Creating Kategori Materi...');
  const kategoriTahsinTafkhim = await prisma.kategoriMateri.create({ data: { nama: 'Tahsin dan Tafkhim' } });
  const kategoriTahfidz = await prisma.kategoriMateri.create({ data: { nama: 'Tahfidz' } });
  const kategoriKemuhammadiyahan = await prisma.kategoriMateri.create({ data: { nama: 'Kemuhammadiyahan' } });

  // 9. Create Materi
  console.log('📖 Creating Materi...');
  await prisma.materi.createMany({
    data: [
      // Tahsin dan Tafkhim (4 materi)
      {
        judul: 'Makharijul Huruf',
        deskripsi: 'Materi tentang tempat-tempat keluar huruf dalam bacaan Al-Quran',
        fileUrl: '/uploads/materi/makharijul-huruf.pdf',
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: 'Sifatul Huruf',
        deskripsi: 'Penjelasan tentang sifat-sifat huruf dalam tajwid',
        fileUrl: '/uploads/materi/sifatul-huruf.pdf',
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: 'Hukum Mad',
        deskripsi: 'Pembelajaran tentang berbagai macam hukum mad dalam Al-Quran',
        fileUrl: '/uploads/materi/hukum-mad.pdf',
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: 'Hukum Nun Mati dan Tanwin',
        deskripsi: 'Penjelasan hukum bacaan nun mati dan tanwin (Idzhar, Idgham, Iqlab, Ikhfa)',
        fileUrl: '/uploads/materi/nun-mati-tanwin.pdf',
        kategoriId: kategoriTahsinTafkhim.id,
      },
      
      // Tahfidz (3 materi)
      {
        judul: 'Metode Menghafal Juz Amma',
        deskripsi: 'Teknik dan metode efektif menghafal surat-surat pendek',
        fileUrl: '/uploads/materi/metode-hafalan-juz-amma.pdf',
        kategoriId: kategoriTahfidz.id,
      },
      {
        judul: 'Tips Menjaga Hafalan',
        deskripsi: 'Cara-cara menjaga dan muroja\'ah hafalan Al-Quran',
        fileUrl: '/uploads/materi/tips-jaga-hafalan.pdf',
        kategoriId: kategoriTahfidz.id,
      },
      {
        judul: 'Adab Membaca dan Menghafal Al-Quran',
        deskripsi: 'Adab dan etika dalam membaca serta menghafal Al-Quran',
        fileUrl: '/uploads/materi/adab-quran.pdf',
        kategoriId: kategoriTahfidz.id,
      },
      
      // Kemuhammadiyahan (6 materi)
      {
        judul: 'Sejarah Berdirinya Muhammadiyah',
        deskripsi: 'Latar belakang dan sejarah pendirian organisasi Muhammadiyah',
        fileUrl: '/uploads/materi/sejarah-muhammadiyah.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: 'Matan Keyakinan dan Cita-cita Hidup Muhammadiyah',
        deskripsi: 'Pemahaman tentang MKCH sebagai pedoman warga Muhammadiyah',
        fileUrl: '/uploads/materi/mkch.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: 'Akhlak Islami',
        deskripsi: 'Pembelajaran tentang akhlak mahmudah dan madzmumah dalam Islam',
        fileUrl: '/uploads/materi/akhlak-islami.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: 'Fiqih Ibadah',
        deskripsi: 'Panduan praktis tentang thaharah, shalat, puasa, dan zakat',
        fileUrl: '/uploads/materi/fiqih-ibadah.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: 'Gerakan Amal Usaha Muhammadiyah',
        deskripsi: 'Pengenalan berbagai amal usaha Muhammadiyah (pendidikan, kesehatan, sosial)',
        fileUrl: '/uploads/materi/amal-usaha.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: 'Kepemimpinan dalam Islam',
        deskripsi: 'Konsep dan prinsip kepemimpinan menurut Islam dan Muhammadiyah',
        fileUrl: '/uploads/materi/kepemimpinan-islam.pdf',
        kategoriId: kategoriKemuhammadiyahan.id,
      },
    ],
  });

  // 10. Create Target Hafalan (Juz 30 lengkap)
  console.log('🎯 Creating Target Hafalan...');
  
  // 1. An-Naba'
  await prisma.targetHafalan.create({
    data: {
      nama: 'An-Naba\'',
      surah: 'An-Naba\'',
      ayatMulai: 1,
      ayatAkhir: 40,
      subTargets: {
        create: [
          { nama: 'An-Naba\' 1–10' },
          { nama: 'An-Naba\' 11–20' },
          { nama: 'An-Naba\' 21–30' },
          { nama: 'An-Naba\' 31–40' },
        ],
      },
    },
  });

  // 2. An-Naazi'aat
  await prisma.targetHafalan.create({
    data: {
      nama: 'An-Naazi\'aat',
      surah: 'An-Naazi\'aat',
      ayatMulai: 1,
      ayatAkhir: 46,
      subTargets: {
        create: [
          { nama: 'An-Naazi\'aat 1–10' },
          { nama: 'An-Naazi\'aat 11–20' },
          { nama: 'An-Naazi\'aat 21–31' },
          { nama: 'An-Naazi\'aat 32–46' },
        ],
      },
    },
  });

  // 3. 'Abasa
  await prisma.targetHafalan.create({
    data: {
      nama: '\'Abasa',
      surah: '\'Abasa',
      ayatMulai: 1,
      ayatAkhir: 42,
      subTargets: {
        create: [
          { nama: '\'Abasa 1–11' },
          { nama: '\'Abasa 12–23' },
          { nama: '\'Abasa 24–42' },
        ],
      },
    },
  });

  // 4. At-Takwiir
  await prisma.targetHafalan.create({
    data: {
      nama: 'At-Takwiir',
      surah: 'At-Takwiir',
      ayatMulai: 1,
      ayatAkhir: 29,
      subTargets: {
        create: [
          { nama: 'At-Takwiir 1–10' },
          { nama: 'At-Takwiir 11–20' },
          { nama: 'At-Takwiir 21–29' },
        ],
      },
    },
  });

  // 5. Al-Infithaar
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Infithaar',
      surah: 'Al-Infithaar',
      ayatMulai: 1,
      ayatAkhir: 19,
      subTargets: {
        create: [
          { nama: 'Al-Infithaar 1–10' },
          { nama: 'Al-Infithaar 11–19' },
        ],
      },
    },
  });

  // 6. Al-Muthaffifiin
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Muthaffifiin',
      surah: 'Al-Muthaffifiin',
      ayatMulai: 1,
      ayatAkhir: 36,
      subTargets: {
        create: [
          { nama: 'Al-Muthaffifiin 1–10' },
          { nama: 'Al-Muthaffifiin 11–19' },
          { nama: 'Al-Muthaffifiin 20–36' },
        ],
      },
    },
  });

  // 7. Al-Insyiqaaq
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Insyiqaaq',
      surah: 'Al-Insyiqaaq',
      ayatMulai: 1,
      ayatAkhir: 25,
      subTargets: {
        create: [
          { nama: 'Al-Insyiqaaq 1–15' },
          { nama: 'Al-Insyiqaaq 16–25' },
        ],
      },
    },
  });

  // 8. Al-Buruuj
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Buruuj',
      surah: 'Al-Buruuj',
      ayatMulai: 1,
      ayatAkhir: 22,
      subTargets: {
        create: [
          { nama: 'Al-Buruuj 1–10' },
          { nama: 'Al-Buruuj 11–22' },
        ],
      },
    },
  });

  // 9. At-Taariq
  await prisma.targetHafalan.create({
    data: {
      nama: 'At-Taariq',
      surah: 'At-Taariq',
      ayatMulai: 1,
      ayatAkhir: 17,
      subTargets: {
        create: [
          { nama: 'At-Taariq 1–10' },
          { nama: 'At-Taariq 11–17' },
        ],
      },
    },
  });

  // 10. Al-A'laa
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-A\'laa',
      surah: 'Al-A\'laa',
      ayatMulai: 1,
      ayatAkhir: 19,
      subTargets: {
        create: [
          { nama: 'Al-A\'laa 1–10' },
          { nama: 'Al-A\'laa 11–19' },
        ],
      },
    },
  });

  // 11. Al-Ghaasyiyah
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Ghaasyiyah',
      surah: 'Al-Ghaasyiyah',
      ayatMulai: 1,
      ayatAkhir: 26,
      subTargets: {
        create: [
          { nama: 'Al-Ghaasyiyah 1–10' },
          { nama: 'Al-Ghaasyiyah 11–26' },
        ],
      },
    },
  });

  // 12. Al-Fajr
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Fajr',
      surah: 'Al-Fajr',
      ayatMulai: 1,
      ayatAkhir: 30,
      subTargets: {
        create: [
          { nama: 'Al-Fajr 1–12' },
          { nama: 'Al-Fajr 13–20' },
          { nama: 'Al-Fajr 21–30' },
        ],
      },
    },
  });

  // 13. Al-Balad
  await prisma.targetHafalan.create({
    data: {
      nama: 'Al-Balad',
      surah: 'Al-Balad',
      ayatMulai: 1,
      ayatAkhir: 20,
      subTargets: {
        create: [
          { nama: 'Al-Balad 1–10' },
          { nama: 'Al-Balad 11–20' },
        ],
      },
    },
  });

  // 14. Asy-Syams, Al-Lail (combined target)
  await prisma.targetHafalan.create({
    data: {
      nama: 'Asy-Syams & Al-Lail',
      surah: 'Asy-Syams, Al-Lail',
      ayatMulai: 1,
      ayatAkhir: 21,
      subTargets: {
        create: [
          { nama: 'Asy-Syams 1–8' },
          { nama: 'Asy-Syams 9–15' },
          { nama: 'Al-Lail 1–11' },
          { nama: 'Al-Lail 12–21' },
        ],
      },
    },
  });

  // 15-37. Surat-surat pendek (tidak ada sub-target karena pendek)
  const suratPendek = [
    { nama: 'Adh-Dhuhaa', surah: 'Adh-Dhuhaa', ayatMulai: 1, ayatAkhir: 11 },
    { nama: 'Al-Insyirah', surah: 'Al-Insyirah', ayatMulai: 1, ayatAkhir: 8 },
    { nama: 'At-Tiin', surah: 'At-Tiin', ayatMulai: 1, ayatAkhir: 8 },
    { nama: 'Al-\'Alaq', surah: 'Al-\'Alaq', ayatMulai: 1, ayatAkhir: 19, 
      subTargets: [
        { nama: 'Al-\'Alaq 1–10' },
        { nama: 'Al-\'Alaq 11–19' },
      ]
    },
    { nama: 'Al-Qadr', surah: 'Al-Qadr', ayatMulai: 1, ayatAkhir: 5 },
    { nama: 'Al-Bayyinah', surah: 'Al-Bayyinah', ayatMulai: 1, ayatAkhir: 8,
      subTargets: [
        { nama: 'Al-Bayyinah 1–4' },
        { nama: 'Al-Bayyinah 5–6' },
        { nama: 'Al-Bayyinah 7–8' },
      ]
    },
    { nama: 'Az-Zalzalah', surah: 'Az-Zalzalah', ayatMulai: 1, ayatAkhir: 8 },
    { nama: 'Al-\'Adiyaat', surah: 'Al-\'Adiyaat', ayatMulai: 1, ayatAkhir: 11 },
    { nama: 'Al-Qari\'ah', surah: 'Al-Qari\'ah', ayatMulai: 1, ayatAkhir: 11 },
    { nama: 'At-Takatsur', surah: 'At-Takatsur', ayatMulai: 1, ayatAkhir: 8 },
    { nama: 'Al-\'Ashr', surah: 'Al-\'Ashr', ayatMulai: 1, ayatAkhir: 3 },
    { nama: 'Al-Humazah', surah: 'Al-Humazah', ayatMulai: 1, ayatAkhir: 9 },
    { nama: 'Al-Fiil', surah: 'Al-Fiil', ayatMulai: 1, ayatAkhir: 5 },
    { nama: 'Quraisy', surah: 'Quraisy', ayatMulai: 1, ayatAkhir: 4 },
    { nama: 'Al-Ma\'un', surah: 'Al-Ma\'un', ayatMulai: 1, ayatAkhir: 7 },
    { nama: 'Al-Kautsar', surah: 'Al-Kautsar', ayatMulai: 1, ayatAkhir: 3 },
    { nama: 'Al-Kaafiruun', surah: 'Al-Kaafiruun', ayatMulai: 1, ayatAkhir: 6 },
    { nama: 'An-Nashr', surah: 'An-Nashr', ayatMulai: 1, ayatAkhir: 3 },
    { nama: 'Al-Lahab', surah: 'Al-Lahab', ayatMulai: 1, ayatAkhir: 5 },
    { nama: 'Al-Ikhlash', surah: 'Al-Ikhlash', ayatMulai: 1, ayatAkhir: 4 },
    { nama: 'Al-Falaq', surah: 'Al-Falaq', ayatMulai: 1, ayatAkhir: 5 },
    { nama: 'An-Naas', surah: 'An-Naas', ayatMulai: 1, ayatAkhir: 6 },
  ];

  for (const surat of suratPendek) {
    const data = {
      nama: surat.nama,
      surah: surat.surah,
      ayatMulai: surat.ayatMulai,
      ayatAkhir: surat.ayatAkhir,
    };
    
    if (surat.subTargets) {
      data.subTargets = {
        create: surat.subTargets,
      };
    }
    
    await prisma.targetHafalan.create({ data });
  }

  // 11. Create sample Nilai Tahfidz (3 residents per usroh)
  console.log('📝 Creating Sample Nilai Tahfidz...');
  
  // Get all residents grouped by usroh
  const allResidents = await prisma.resident.findMany({
    include: { usroh: true }
  });
  
  // Get some target hafalan
  const targets = await prisma.targetHafalan.findMany({
    take: 10,
  });
  
  const nilaiOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
  const statusOptions = ['SELESAI', 'BELUM SELESAI', 'SELESAI'];
  
  let nilaiCount = 0;
  
  // Group residents by usroh
  const residentsByUsroh = {};
  for (const resident of allResidents) {
    const usrohId = resident.usrohId;
    if (!residentsByUsroh[usrohId]) {
      residentsByUsroh[usrohId] = [];
    }
    residentsByUsroh[usrohId].push(resident);
  }
  
  // Create nilai for 3 residents per usroh
  for (const usrohId in residentsByUsroh) {
    const residents = residentsByUsroh[usrohId];
    
    // Take first 3 residents in this usroh
    for (let i = 0; i < Math.min(3, residents.length); i++) {
      const resident = residents[i];
      
      // Give each resident 2-4 target hafalan with nilai
      const numTargets = 2 + (nilaiCount % 3); // 2, 3, or 4 targets
      
      for (let j = 0; j < numTargets && j < targets.length; j++) {
        const targetIndex = (nilaiCount + j) % targets.length;
        const target = targets[targetIndex];
        
        const nilaiHuruf = nilaiOptions[nilaiCount % nilaiOptions.length];
        const status = statusOptions[nilaiCount % statusOptions.length];
        
        await prisma.nilaiTahfidz.create({
          data: {
            residentId: resident.id,
            targetHafalanId: target.id,
            nilaiHuruf: nilaiHuruf,
            status: status,
          },
        });
        
        nilaiCount++;
      }
    }
  }
  
  console.log(`✅ Created ${nilaiCount} nilai tahfidz entries`);

  // 12. Create sample Assignments
  console.log('📝 Creating Sample Assignments...');
  
  // Get all materi
  const allMateri = await prisma.materi.findMany({
    include: { kategori: true }
  });
  
  // Create assignments for each materi (2-3 per materi)
  const assignmentsData = [
    // Tahsin dan Tafkhim - Makharijul Huruf
    {
      judul: 'Kuis Makharijul Huruf Bagian 1',
      pertanyaan: 'Dari manakah huruf ب (Ba), م (Mim), dan و (Wau) keluar?',
      opsiA: 'Al-Jauf (rongga mulut)',
      opsiB: 'Asy-Syafatain (dua bibir)',
      opsiC: 'Al-Lisan (lidah)',
      opsiD: 'Al-Halq (tenggorokan)',
      jawabanBenar: 'B',
      materiNama: 'Makharijul Huruf',
    },
    {
      judul: 'Kuis Makharijul Huruf Bagian 2',
      pertanyaan: 'Berapa jumlah makhraj huruf secara umum?',
      opsiA: '3 tempat',
      opsiB: '5 tempat',
      opsiC: '7 tempat',
      opsiD: '9 tempat',
      jawabanBenar: 'B',
      materiNama: 'Makharijul Huruf',
    },
    
    // Tahsin dan Tafkhim - Sifatul Huruf
    {
      judul: 'Kuis Sifatul Huruf',
      pertanyaan: 'Berapa jumlah sifat huruf yang memiliki lawan (muta dhaddah)?',
      opsiA: '5 pasang',
      opsiB: '7 pasang',
      opsiC: '10 pasang',
      opsiD: '12 pasang',
      jawabanBenar: 'A',
      materiNama: 'Sifatul Huruf',
    },
    {
      judul: 'Sifat Huruf Isti\'la',
      pertanyaan: 'Huruf-huruf isti\'la (tebal) berjumlah?',
      opsiA: '5 huruf',
      opsiB: '6 huruf',
      opsiC: '7 huruf',
      opsiD: '8 huruf',
      jawabanBenar: 'C',
      materiNama: 'Sifatul Huruf',
    },
    
    // Tahsin dan Tafkhim - Hukum Mad
    {
      judul: 'Kuis Hukum Mad Dasar',
      pertanyaan: 'Mad Thobi\'i dibaca selama berapa harakat?',
      opsiA: '1 harakat',
      opsiB: '2 harakat',
      opsiC: '4 harakat',
      opsiD: '6 harakat',
      jawabanBenar: 'B',
      materiNama: 'Hukum Mad',
    },
    {
      judul: 'Mad Wajib Muttashil',
      pertanyaan: 'Mad Wajib Muttashil dibaca panjang berapa harakat?',
      opsiA: '2-3 harakat',
      opsiB: '4-5 harakat',
      opsiC: '6 harakat',
      opsiD: '2 harakat saja',
      jawabanBenar: 'B',
      materiNama: 'Hukum Mad',
    },
    
    // Tahsin dan Tafkhim - Nun Mati dan Tanwin
    {
      judul: 'Hukum Nun Mati',
      pertanyaan: 'Berapa hukum bacaan nun mati atau tanwin?',
      opsiA: '3 hukum',
      opsiB: '4 hukum',
      opsiC: '5 hukum',
      opsiD: '6 hukum',
      jawabanBenar: 'B',
      materiNama: 'Hukum Nun Mati dan Tanwin',
    },
    {
      judul: 'Huruf Ikhfa',
      pertanyaan: 'Huruf ikhfa berjumlah?',
      opsiA: '5 huruf',
      opsiB: '10 huruf',
      opsiC: '15 huruf',
      opsiD: '20 huruf',
      jawabanBenar: 'C',
      materiNama: 'Hukum Nun Mati dan Tanwin',
    },
    
    // Tahfidz - Metode Menghafal
    {
      judul: 'Metode Hafalan Al-Quran',
      pertanyaan: 'Waktu terbaik untuk menghafal Al-Quran adalah?',
      opsiA: 'Pagi hari setelah subuh',
      opsiB: 'Siang hari',
      opsiC: 'Sore hari',
      opsiD: 'Malam hari',
      jawabanBenar: 'A',
      materiNama: 'Metode Menghafal Juz Amma',
    },
    {
      judul: 'Teknik Menghafal',
      pertanyaan: 'Metode menghafal dengan mengulang-ulang satu ayat hingga lancar disebut?',
      opsiA: 'Metode Wahdah',
      opsiB: 'Metode Kitabah',
      opsiC: 'Metode Jama\'',
      opsiD: 'Metode Talaqqi',
      jawabanBenar: 'A',
      materiNama: 'Metode Menghafal Juz Amma',
    },
    
    // Tahfidz - Tips Menjaga Hafalan
    {
      judul: 'Muroja\'ah Hafalan',
      pertanyaan: 'Yang dimaksud dengan muroja\'ah adalah?',
      opsiA: 'Menghafal surat baru',
      opsiB: 'Mengulang hafalan lama',
      opsiC: 'Menulis hafalan',
      opsiD: 'Mendengarkan murotal',
      jawabanBenar: 'B',
      materiNama: 'Tips Menjaga Hafalan',
    },
    {
      judul: 'Menjaga Hafalan',
      pertanyaan: 'Frekuensi ideal muroja\'ah hafalan adalah?',
      opsiA: 'Sebulan sekali',
      opsiB: 'Seminggu sekali',
      opsiC: 'Setiap hari',
      opsiD: 'Setahun sekali',
      jawabanBenar: 'C',
      materiNama: 'Tips Menjaga Hafalan',
    },
    
    // Tahfidz - Adab Membaca Al-Quran
    {
      judul: 'Adab Membaca Al-Quran',
      pertanyaan: 'Sebelum membaca Al-Quran, kita diwajibkan?',
      opsiA: 'Mandi',
      opsiB: 'Berwudhu',
      opsiC: 'Shalat sunnah',
      opsiD: 'Membaca doa panjang',
      jawabanBenar: 'B',
      materiNama: 'Adab Membaca dan Menghafal Al-Quran',
    },
    
    // Kemuhammadiyahan - Sejarah Muhammadiyah
    {
      judul: 'Sejarah Muhammadiyah',
      pertanyaan: 'Muhammadiyah didirikan pada tanggal?',
      opsiA: '18 November 1912',
      opsiB: '8 Dzulhijjah 1330 H',
      opsiC: '18 November 1912 / 8 Dzulhijjah 1330 H',
      opsiD: '17 Agustus 1945',
      jawabanBenar: 'C',
      materiNama: 'Sejarah Berdirinya Muhammadiyah',
    },
    {
      judul: 'Pendiri Muhammadiyah',
      pertanyaan: 'Siapa pendiri Muhammadiyah?',
      opsiA: 'K.H. Ahmad Dahlan',
      opsiB: 'K.H. Hasyim Asy\'ari',
      opsiC: 'K.H. Mas Mansur',
      opsiD: 'K.H. Abdul Kahar Mudzakir',
      jawabanBenar: 'A',
      materiNama: 'Sejarah Berdirinya Muhammadiyah',
    },
    {
      judul: 'Lokasi Pendirian',
      pertanyaan: 'Muhammadiyah pertama kali didirikan di kota?',
      opsiA: 'Jakarta',
      opsiB: 'Surabaya',
      opsiC: 'Yogyakarta',
      opsiD: 'Bandung',
      jawabanBenar: 'C',
      materiNama: 'Sejarah Berdirinya Muhammadiyah',
    },
    
    // Kemuhammadiyahan - MKCH
    {
      judul: 'Matan Keyakinan',
      pertanyaan: 'MKCH adalah singkatan dari?',
      opsiA: 'Matan Keyakinan dan Cita-cita Hidup',
      opsiB: 'Misi Kehidupan dan Cita-cita Harian',
      opsiC: 'Matan Keimanan dan Cita Harapan',
      opsiD: 'Misi Keyakinan Cita Harmoni',
      jawabanBenar: 'A',
      materiNama: 'Matan Keyakinan dan Cita-cita Hidup Muhammadiyah',
    },
    {
      judul: 'Sumber Keyakinan',
      pertanyaan: 'Sumber keyakinan Muhammadiyah adalah?',
      opsiA: 'Al-Quran dan Hadits',
      opsiB: 'Al-Quran saja',
      opsiC: 'Pendapat ulama',
      opsiD: 'Adat istiadat',
      jawabanBenar: 'A',
      materiNama: 'Matan Keyakinan dan Cita-cita Hidup Muhammadiyah',
    },
    
    // Kemuhammadiyahan - Akhlak
    {
      judul: 'Akhlak Mahmudah',
      pertanyaan: 'Yang termasuk akhlak mahmudah adalah?',
      opsiA: 'Jujur, amanah, sabar',
      opsiB: 'Sombong, dengki, iri',
      opsiC: 'Malas, bohong, khianat',
      opsiD: 'Semua benar',
      jawabanBenar: 'A',
      materiNama: 'Akhlak Islami',
    },
    {
      judul: 'Akhlak Madzmumah',
      pertanyaan: 'Yang termasuk akhlak madzmumah adalah?',
      opsiA: 'Sabar dan syukur',
      opsiB: 'Takabbur dan hasad',
      opsiC: 'Ikhlas dan tawakal',
      opsiD: 'Jujur dan amanah',
      jawabanBenar: 'B',
      materiNama: 'Akhlak Islami',
    },
    
    // Kemuhammadiyahan - Fiqih
    {
      judul: 'Rukun Islam',
      pertanyaan: 'Berapa jumlah rukun Islam?',
      opsiA: '3',
      opsiB: '4',
      opsiC: '5',
      opsiD: '6',
      jawabanBenar: 'C',
      materiNama: 'Fiqih Ibadah',
    },
    {
      judul: 'Syarat Sah Shalat',
      pertanyaan: 'Yang bukan termasuk syarat sah shalat adalah?',
      opsiA: 'Suci dari hadas',
      opsiB: 'Menutup aurat',
      opsiC: 'Menghadap kiblat',
      opsiD: 'Membaca doa qunut',
      jawabanBenar: 'D',
      materiNama: 'Fiqih Ibadah',
    },
    
    // Kemuhammadiyahan - Amal Usaha
    {
      judul: 'Amal Usaha Muhammadiyah',
      pertanyaan: 'Universitas Muhammadiyah Yogyakarta (UMY) adalah amal usaha di bidang?',
      opsiA: 'Kesehatan',
      opsiB: 'Pendidikan',
      opsiC: 'Ekonomi',
      opsiD: 'Sosial',
      jawabanBenar: 'B',
      materiNama: 'Gerakan Amal Usaha Muhammadiyah',
    },
    {
      judul: 'Bidang Amal Usaha',
      pertanyaan: 'Muhammadiyah memiliki amal usaha di bidang?',
      opsiA: 'Pendidikan saja',
      opsiB: 'Kesehatan saja',
      opsiC: 'Pendidikan, kesehatan, sosial, ekonomi',
      opsiD: 'Politik saja',
      jawabanBenar: 'C',
      materiNama: 'Gerakan Amal Usaha Muhammadiyah',
    },
    
    // Kemuhammadiyahan - Kepemimpinan
    {
      judul: 'Kepemimpinan dalam Islam',
      pertanyaan: 'Dalam Islam, pemimpin disebut?',
      opsiA: 'Khalifah',
      opsiB: 'Raja',
      opsiC: 'Presiden',
      opsiD: 'Gubernur',
      jawabanBenar: 'A',
      materiNama: 'Kepemimpinan dalam Islam',
    },
    {
      judul: 'Sifat Pemimpin',
      pertanyaan: 'Sifat yang wajib dimiliki pemimpin dalam Islam adalah?',
      opsiA: 'Kaya raya',
      opsiB: 'Amanah dan adil',
      opsiC: 'Tampan/cantik',
      opsiD: 'Terkenal',
      jawabanBenar: 'B',
      materiNama: 'Kepemimpinan dalam Islam',
    },
  ];
  
  let assignmentCount = 0;
  for (const assignmentData of assignmentsData) {
    // Find materi by judul
    const materi = allMateri.find(m => m.judul === assignmentData.materiNama);
    if (materi) {
      await prisma.assignment.create({
        data: {
          materiId: materi.id,
          judul: assignmentData.judul,
          pertanyaan: assignmentData.pertanyaan,
          opsiA: assignmentData.opsiA,
          opsiB: assignmentData.opsiB,
          opsiC: assignmentData.opsiC,
          opsiD: assignmentData.opsiD,
          jawabanBenar: assignmentData.jawabanBenar,
        },
      });
      assignmentCount++;
    }
  }
  
  console.log(`✅ Created ${assignmentCount} assignments`);

  console.log('✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 2 Gedung (Y, U)');
  console.log('  - 8 Lantai (4 per gedung)');
  console.log('  - 32 Usroh (4 per lantai)');
  console.log('  - 8 Musyrif (1 per lantai)');
  console.log(`  - ${residentCount} Residents (4 per usroh)`);
  console.log('  - 1 Admin, 1 Asisten');
  console.log('  - 3 Kategori Materi (Tahsin dan Tafkhim, Tahfidz, Kemuhammadiyahan)');
  console.log('  - 13 Materi (4 Tahsin, 3 Tahfidz, 6 Kemuhammadiyahan)');
  console.log('  - 37 Target Hafalan (Juz 30 lengkap)');
  console.log(`  - ${nilaiCount} Nilai Tahfidz (3 residents per usroh, 2-4 targets each)`);
  console.log(`  - ${assignmentCount} Assignments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
