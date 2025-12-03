import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // Clear existing data (optional - hati-hati dengan ini di production!)
  console.log('🧹 Cleaning up existing data...');
  await prisma.nilaiTahfidz.deleteMany();
  await prisma.subTargets.deleteMany();
  await prisma.targetHafalan.deleteMany();
  await prisma.nilai.deleteMany();
  await prisma.jawaban.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.materi.deleteMany();
  await prisma.kategoriMateri.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.asistenMusyrif.deleteMany();
  await prisma.musyrif.deleteMany();
  await prisma.usroh.deleteMany();
  await prisma.lantai.deleteMany();
  await prisma.gedung.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleanup complete');

  // Hash password default
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  console.log('👤 Creating Admin...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Utama',
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

  // 3. Create Lantai untuk Gedung Y (Putri)
  console.log('🏗️ Creating Lantai...');
  const gedungY_Lantai1 = await prisma.lantai.create({
    data: { nama: 'Lantai 1', gedungId: gedungY.id },
  });
  const gedungY_Lantai2 = await prisma.lantai.create({
    data: { nama: 'Lantai 2', gedungId: gedungY.id },
  });
  const gedungY_Lantai3 = await prisma.lantai.create({
    data: { nama: 'Lantai 3', gedungId: gedungY.id },
  });
  const gedungY_Lantai4 = await prisma.lantai.create({
    data: { nama: 'Lantai 4', gedungId: gedungY.id },
  });

  // Lantai untuk Gedung U (Putra)
  const gedungU_Lantai1 = await prisma.lantai.create({
    data: { nama: 'Lantai 1', gedungId: gedungU.id },
  });
  const gedungU_Lantai2 = await prisma.lantai.create({
    data: { nama: 'Lantai 2', gedungId: gedungU.id },
  });
  const gedungU_Lantai3 = await prisma.lantai.create({
    data: { nama: 'Lantai 3', gedungId: gedungU.id },
  });
  const gedungU_Lantai4 = await prisma.lantai.create({
    data: { nama: 'Lantai 4', gedungId: gedungU.id },
  });

  // 4. Create Usroh untuk Gedung Y - Lantai 1 (4 usroh)
  console.log('👥 Creating Usroh...');
  const usroh_Y_L1_1 = await prisma.usroh.create({
    data: { nama: "Aisyah binti Abu Bakar", lantaiId: gedungY_Lantai1.id },
  });
  const usroh_Y_L1_2 = await prisma.usroh.create({
    data: { nama: "Hafshah binti Umar", lantaiId: gedungY_Lantai1.id },
  });
  const usroh_Y_L1_3 = await prisma.usroh.create({
    data: { nama: "Zainab binti Jahsy", lantaiId: gedungY_Lantai1.id },
  });
  const usroh_Y_L1_4 = await prisma.usroh.create({
    data: { nama: "Saudah binti Zam'ah", lantaiId: gedungY_Lantai1.id },
  });

  // Gedung Y - Lantai 2 (4 usroh)
  const usroh_Y_L2_1 = await prisma.usroh.create({
    data: { nama: "Khadijah binti Khuwailid", lantaiId: gedungY_Lantai2.id },
  });
  const usroh_Y_L2_2 = await prisma.usroh.create({
    data: { nama: "Ummu Habibah", lantaiId: gedungY_Lantai2.id },
  });
  const usroh_Y_L2_3 = await prisma.usroh.create({
    data: { nama: "Ummu Aiman", lantaiId: gedungY_Lantai2.id },
  });
  const usroh_Y_L2_4 = await prisma.usroh.create({
    data: { nama: "Raihanah binti Zaid", lantaiId: gedungY_Lantai2.id },
  });

  // Gedung Y - Lantai 3 (4 usroh)
  const usroh_Y_L3_1 = await prisma.usroh.create({
    data: { nama: "Ummu Salamah Hindun", lantaiId: gedungY_Lantai3.id },
  });
  const usroh_Y_L3_2 = await prisma.usroh.create({
    data: { nama: "Maimunah binti Al-Harith", lantaiId: gedungY_Lantai3.id },
  });
  const usroh_Y_L3_3 = await prisma.usroh.create({
    data: { nama: "Juwairiyah binti Al-Harith", lantaiId: gedungY_Lantai3.id },
  });
  const usroh_Y_L3_4 = await prisma.usroh.create({
    data: { nama: "Shafiyyah binti Huyay", lantaiId: gedungY_Lantai3.id },
  });

  // Gedung Y - Lantai 4 (4 usroh)
  const usroh_Y_L4_1 = await prisma.usroh.create({
    data: { nama: "Fatimah az-Zahra", lantaiId: gedungY_Lantai4.id },
  });
  const usroh_Y_L4_2 = await prisma.usroh.create({
    data: { nama: "Asma' binti Abu Bakar", lantaiId: gedungY_Lantai4.id },
  });
  const usroh_Y_L4_3 = await prisma.usroh.create({
    data: { nama: "Sumayyah binti Khayyat", lantaiId: gedungY_Lantai4.id },
  });
  const usroh_Y_L4_4 = await prisma.usroh.create({
    data: { nama: "Nusaibah binti Ka'ab", lantaiId: gedungY_Lantai4.id },
  });

  // Gedung U - Lantai 1 (4 usroh)
  const usroh_U_L1_1 = await prisma.usroh.create({
    data: { nama: "Abu Bakar ash-Shiddiq", lantaiId: gedungU_Lantai1.id },
  });
  const usroh_U_L1_2 = await prisma.usroh.create({
    data: { nama: "Umar bin Khattab", lantaiId: gedungU_Lantai1.id },
  });
  const usroh_U_L1_3 = await prisma.usroh.create({
    data: { nama: "Utsman bin Affan", lantaiId: gedungU_Lantai1.id },
  });
  const usroh_U_L1_4 = await prisma.usroh.create({
    data: { nama: "Ali bin Abi Thalib", lantaiId: gedungU_Lantai1.id },
  });

  // Gedung U - Lantai 2 (4 usroh)
  const usroh_U_L2_1 = await prisma.usroh.create({
    data: { nama: "Bilal bin Rabah", lantaiId: gedungU_Lantai2.id },
  });
  const usroh_U_L2_2 = await prisma.usroh.create({
    data: { nama: "Sa'ad bin Abi Waqqash", lantaiId: gedungU_Lantai2.id },
  });
  const usroh_U_L2_3 = await prisma.usroh.create({
    data: { nama: "Abdurrahman bin Auf", lantaiId: gedungU_Lantai2.id },
  });
  const usroh_U_L2_4 = await prisma.usroh.create({
    data: { nama: "Zubair bin Awwam", lantaiId: gedungU_Lantai2.id },
  });

  // Gedung U - Lantai 3 (4 usroh)
  const usroh_U_L3_1 = await prisma.usroh.create({
    data: { nama: "Talhah bin Ubaidillah", lantaiId: gedungU_Lantai3.id },
  });
  const usroh_U_L3_2 = await prisma.usroh.create({
    data: { nama: "Khalid bin Walid", lantaiId: gedungU_Lantai3.id },
  });
  const usroh_U_L3_3 = await prisma.usroh.create({
    data: { nama: "Muadz bin Jabal", lantaiId: gedungU_Lantai3.id },
  });
  const usroh_U_L3_4 = await prisma.usroh.create({
    data: { nama: "Abu Ubaidah bin Jarrah", lantaiId: gedungU_Lantai3.id },
  });

  // Gedung U - Lantai 4 (4 usroh)
  const usroh_U_L4_1 = await prisma.usroh.create({
    data: { nama: "Anas bin Malik", lantaiId: gedungU_Lantai4.id },
  });
  const usroh_U_L4_2 = await prisma.usroh.create({
    data: { nama: "Salman Al-Farisi", lantaiId: gedungU_Lantai4.id },
  });
  const usroh_U_L4_3 = await prisma.usroh.create({
    data: { nama: "Ammar bin Yasir", lantaiId: gedungU_Lantai4.id },
  });
  const usroh_U_L4_4 = await prisma.usroh.create({
    data: { nama: "Hudzaifah bin Yaman", lantaiId: gedungU_Lantai4.id },
  });

  // 5. Create Musyrif (1 per lantai = 8 musyrif total)
  console.log('👨‍🏫 Creating Musyrif...');
  
  // Musyrif Gedung Y
  const musyrifY_L1 = await prisma.user.create({
    data: {
      name: 'Ustadzah Aminah',
      email: 'aminah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungY_Lantai1.id } },
    },
  });

  const musyrifY_L2 = await prisma.user.create({
    data: {
      name: 'Ustadzah Fatimah',
      email: 'fatimah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungY_Lantai2.id } },
    },
  });

  const musyrifY_L3 = await prisma.user.create({
    data: {
      name: 'Ustadzah Khadijah',
      email: 'khadijah@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungY_Lantai3.id } },
    },
  });

  const musyrifY_L4 = await prisma.user.create({
    data: {
      name: 'Ustadzah Maryam',
      email: 'maryam@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungY_Lantai4.id } },
    },
  });

  // Musyrif Gedung U
  const musyrifU_L1 = await prisma.user.create({
    data: {
      name: 'Ustadz Ahmad',
      email: 'ahmad@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungU_Lantai1.id } },
    },
  });

  const musyrifU_L2 = await prisma.user.create({
    data: {
      name: 'Ustadz Budi',
      email: 'budi@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungU_Lantai2.id } },
    },
  });

  const musyrifU_L3 = await prisma.user.create({
    data: {
      name: 'Ustadz Hasan',
      email: 'hasan@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungU_Lantai3.id } },
    },
  });

  const musyrifU_L4 = await prisma.user.create({
    data: {
      name: 'Ustadz Ibrahim',
      email: 'ibrahim@unires.ac.id',
      password: hashedPassword,
      role: 'MUSYRIF',
      musyrif: { create: { lantaiId: gedungU_Lantai4.id } },
    },
  });

  // 6. Create Asisten Musyrif (keep minimal for now)
  console.log('👨‍🎓 Creating Asisten Musyrif...');
  const asistenUser1 = await prisma.user.create({
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
          usrohId: usroh_Y_L1_1.id,
        },
      },
    },
  });

  // 7. Create Residents (minimum 4 per usroh = 128 residents total)
  console.log('🎓 Creating Residents...');
  
  // Gedung Y - Lantai 1 - Usroh 1 (Aisyah binti Abu Bakar) - 4 residents
  const resident1 = await prisma.user.create({
    data: {
      name: 'Zahra Putri Rahmawati',
      email: 'zahra.putri.ft22@mail.umy.ac.id',
      password: hashedPassword,
      role: 'RESIDENT',
      resident: {
        create: {
          nim: '2022010001',
          jurusan: 'Teknik Informatika',
          angkatan: 2022,
          noTelp: '082111111001',
          usrohId: usroh_Y_L1_1.id,
          lantaiId: gedungY_Lantai1.id,
        },
      },
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      name: 'Siti Nurhaliza Ahmad',
      email: 'siti.nurhaliza.fsi22@mail.umy.ac.id',
      password: hashedPassword,
      role: 'RESIDENT',
      resident: {
        create: {
          nim: '2022010002',
          jurusan: 'Sistem Informasi',
          angkatan: 2022,
          noTelp: '082111111002',
          usrohId: usroh_Y_L1_1.id,
          lantaiId: gedungY_Lantai1.id,
        },
      },
    },
  });

  const resident3 = await prisma.user.create({
    data: {
      name: 'Fathiya Azzahra Ibrahim',
      email: 'fathiya.azzahra.fte22@mail.umy.ac.id',
      password: hashedPassword,
      role: 'RESIDENT',
      resident: {
        create: {
          nim: '2022010003',
          jurusan: 'Teknik Elektro',
          angkatan: 2022,
          noTelp: '082111111003',
          usrohId: usroh_Y_L1_1.id,
          lantaiId: gedungY_Lantai1.id,
        },
      },
    },
  });

  const resident4 = await prisma.user.create({
    data: {
      name: 'Naila Khairunnisa Malik',
      email: 'naila.khairunnisa.ftm22@mail.umy.ac.id',
      password: hashedPassword,
      role: 'RESIDENT',
      resident: {
        create: {
          nim: '2022010004',
          jurusan: 'Teknik Mesin',
          angkatan: 2022,
          noTelp: '082111111004',
          usrohId: usroh_Y_L1_1.id,
          lantaiId: gedungY_Lantai1.id,
        },
      },
    },
  });

  const resident5 = await prisma.user.create({
    data: {
      name: 'Eko Prasetyo',
      email: 'eko.prasetyo.fts22@mail.umy.ac.id',
      password: hashedPassword,
      role: 'RESIDENT',
      resident: {
        create: {
          nim: '2022010005',
          jurusan: 'Teknik Sipil',
          angkatan: 2022,
          noTelp: '082111111115',
          usrohId: usroh3.id,
          lantaiId: lantai2.id,
        },
      },
    },
  });

  // 8. Create Kategori Materi
  console.log('📚 Creating Kategori Materi...');
  const kategoriAkidah = await prisma.kategoriMateri.create({
    data: { nama: 'Akidah' },
  });

  const kategoriFiqih = await prisma.kategoriMateri.create({
    data: { nama: 'Fiqih' },
  });

  const kategoriTahfidz = await prisma.kategoriMateri.create({
    data: { nama: 'Tahfidz' },
  });

  const kategoriAkhlak = await prisma.kategoriMateri.create({
    data: { nama: 'Akhlak' },
  });

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
      nama: 'Target Juz 29',
      surah: 'Al-Mulk - Al-Mursalat',
      ayatMulai: 1,
      ayatAkhir: 30,
      subTargets: {
        create: [
          { nama: 'Sub Target 1: Al-Mulk 1-15' },
          { nama: 'Sub Target 2: Al-Mulk 16-30' },
        ],
      },
    },
  });

  // 11. Create Nilai Tahfidz
  console.log('📊 Creating Nilai Tahfidz...');
  const residentData1 = await prisma.resident.findUnique({
    where: { userId: resident1.id },
  });

  const residentData2 = await prisma.resident.findUnique({
    where: { userId: resident2.id },
  });

  const residentData3 = await prisma.resident.findUnique({
    where: { userId: resident3.id },
  });

  await prisma.nilaiTahfidz.createMany({
    data: [
      {
        residentId: residentData1.id,
        targetHafalanId: target1.id,
        status: 'Lulus',
        nilaiHuruf: 'A',
      },
      {
        residentId: residentData2.id,
        targetHafalanId: target1.id,
        status: 'Dalam Proses',
        nilaiHuruf: 'B',
      },
      {
        residentId: residentData3.id,
        targetHafalanId: target1.id,
        status: 'Lulus',
        nilaiHuruf: 'A',
      },
    ],
  });

  // 12. Create Assignments
  console.log('📝 Creating Assignments...');
  const assignment1 = await prisma.assignment.create({
    data: {
      judul: 'Quiz Akidah - Rukun Iman',
      pertanyaan: 'Berapa jumlah rukun iman dalam Islam?',
      opsiA: '4',
      opsiB: '5',
      opsiC: '6',
      opsiD: '7',
      jawabanBenar: 'C',
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      judul: 'Quiz Fiqih - Sholat',
      pertanyaan: 'Berapa rakaat sholat subuh?',
      opsiA: '2 rakaat',
      opsiB: '3 rakaat',
      opsiC: '4 rakaat',
      opsiD: '5 rakaat',
      jawabanBenar: 'A',
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      judul: 'Quiz Tahfidz - Surat Pendek',
      pertanyaan: 'Surat apa yang disebut sebagai sepertiga Al-Quran?',
      opsiA: 'Al-Fatihah',
      opsiB: 'Al-Ikhlas',
      opsiC: 'Al-Falaq',
      opsiD: 'An-Nas',
      jawabanBenar: 'B',
    },
  });

  // 13. Create Jawaban & Nilai
  console.log('✍️ Creating Jawaban & Nilai...');
  await prisma.jawaban.createMany({
    data: [
      {
        residentId: residentData1.id,
        assignmentId: assignment1.id,
        jawabanUser: 'C',
        isCorrect: true,
      },
      {
        residentId: residentData1.id,
        assignmentId: assignment2.id,
        jawabanUser: 'A',
        isCorrect: true,
      },
      {
        residentId: residentData1.id,
        assignmentId: assignment3.id,
        jawabanUser: 'B',
        isCorrect: true,
      },
      {
        residentId: residentData2.id,
        assignmentId: assignment1.id,
        jawabanUser: 'C',
        isCorrect: true,
      },
      {
        residentId: residentData2.id,
        assignmentId: assignment2.id,
        jawabanUser: 'B',
        isCorrect: false,
      },
    ],
  });

  await prisma.nilai.createMany({
    data: [
      {
        residentId: residentData1.id,
        totalBenar: 3,
        totalSalah: 0,
        nilaiAkhir: 100,
      },
      {
        residentId: residentData2.id,
        totalBenar: 1,
        totalSalah: 1,
        nilaiAkhir: 50,
      },
      {
        residentId: residentData3.id,
        totalBenar: 0,
        totalSalah: 0,
        nilaiAkhir: 0,
      },
    ],
  });

  console.log('✨ Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Admin: admin@unires.ac.id (password: password123)`);
  console.log(`- Musyrif: 2 users`);
  console.log(`- Asisten: 3 users`);
  console.log(`- Residents: 5 users`);
  console.log(`- Gedung: 2`);
  console.log(`- Lantai: 3`);
  console.log(`- Usroh: 3`);
  console.log(`- Kategori Materi: 4`);
  console.log(`- Materi: 4`);
  console.log(`- Target Hafalan: 2`);
  console.log(`- Assignments: 3`);
  console.log('\n📧 Format Email: nama.fakultas.angkatan@mail.umy.ac.id');
  console.log('Contoh: ahmad.fauzi.ft22@mail.umy.ac.id');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
