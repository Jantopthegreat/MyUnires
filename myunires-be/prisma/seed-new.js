const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
    jurusan: ['Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Teknik Mesin', 'Teknik Sipil'],
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
      const name = names[nameIndex];
      const nim = `2022${String(residentCount + 1).padStart(6, '0')}`;
      const email = `${name.toLowerCase()}${residentCount + 1}@student.umy.ac.id`;
      const jurusan = residentTemplate.jurusan[i % residentTemplate.jurusan.length];

      await prisma.user.create({
        data: {
          name: `${name} Student ${residentCount + 1}`,
          email: email,
          password: hashedPassword,
          role: 'RESIDENT',
          resident: {
            create: {
              nim: nim,
              jurusan: jurusan,
              angkatan: 2022,
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
  const kategoriAkidah = await prisma.kategoriMateri.create({ data: { nama: 'Akidah' } });
  const kategoriFiqih = await prisma.kategoriMateri.create({ data: { nama: 'Fiqih' } });
  const kategoriTahfidz = await prisma.kategoriMateri.create({ data: { nama: 'Tahfidz' } });
  const kategoriAkhlak = await prisma.kategoriMateri.create({ data: { nama: 'Akhlak' } });

  // 9. Create Materi
  console.log('📖 Creating Materi...');
  await prisma.materi.createMany({
    data: [
      {
        judul: 'Pengenalan Tauhid',
        deskripsi: 'Materi dasar tentang tauhid dan rukun iman',
        fileUrl: '/uploads/materi/tauhid.pdf',
        kategoriId: kategoriAkidah.id,
      },
      {
        judul: 'Tata Cara Wudhu',
        deskripsi: 'Panduan lengkap tata cara wudhu yang benar',
        fileUrl: '/uploads/materi/wudhu.pdf',
        kategoriId: kategoriFiqih.id,
      },
      {
        judul: 'Hafalan Juz Amma',
        deskripsi: 'Panduan menghafal surat-surat pendek',
        fileUrl: '/uploads/materi/juz-amma.pdf',
        kategoriId: kategoriTahfidz.id,
      },
      {
        judul: 'Adab Kepada Orang Tua',
        deskripsi: 'Materi tentang berbakti kepada orang tua',
        fileUrl: '/uploads/materi/adab-ortu.pdf',
        kategoriId: kategoriAkhlak.id,
      },
    ],
  });

  // 10. Create Target Hafalan
  console.log('🎯 Creating Target Hafalan...');
  const target1 = await prisma.targetHafalan.create({
    data: {
      nama: 'Target Juz 30',
      surah: 'An-Naba\' - An-Nas',
      ayatMulai: 1,
      ayatAkhir: 6,
      subTargets: {
        create: [
          { nama: 'Sub Target 1: An-Naba\' 1-20' },
          { nama: 'Sub Target 2: An-Naba\' 21-40' },
          { nama: 'Sub Target 3: An-Nazi\'at' },
        ],
      },
    },
  });

  const target2 = await prisma.targetHafalan.create({
    data: {
      nama: 'Target Al-Baqarah 1-20',
      surah: 'Al-Baqarah',
      ayatMulai: 1,
      ayatAkhir: 20,
      subTargets: {
        create: [
          { nama: 'Sub Target 1: Al-Baqarah 1-5' },
          { nama: 'Sub Target 2: Al-Baqarah 6-10' },
          { nama: 'Sub Target 3: Al-Baqarah 11-20' },
        ],
      },
    },
  });

  // 11. Create sample Nilai Tahfidz
  console.log('📝 Creating Sample Nilai Tahfidz...');
  const firstResident = await prisma.resident.findFirst();
  if (firstResident) {
    await prisma.nilaiTahfidz.create({
      data: {
        residentId: firstResident.id,
        targetHafalanId: target1.id,
        nilai: 85,
        status: 'SELESAI',
        catatan: 'Hafalan lancar, tajwid baik',
      },
    });
  }

  // 12. Create sample Assignment
  console.log('📝 Creating Sample Assignment...');
  await prisma.assignment.create({
    data: {
      title: 'Tugas Hafalan Surat Al-Fatihah',
      description: 'Hafalkan surat Al-Fatihah dengan lancar beserta tajwidnya',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 2 Gedung (Y, U)');
  console.log('  - 8 Lantai (4 per gedung)');
  console.log('  - 32 Usroh (4 per lantai)');
  console.log('  - 8 Musyrif (1 per lantai)');
  console.log(`  - ${residentCount} Residents (4 per usroh)`);
  console.log('  - 1 Admin, 1 Asisten');
  console.log('  - 4 Kategori Materi, 4 Materi');
  console.log('  - 2 Target Hafalan, 1 Nilai Tahfidz');
  console.log('  - 1 Assignment');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
