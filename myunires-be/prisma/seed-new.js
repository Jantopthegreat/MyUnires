import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Hash password (DEV)
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1) Admin
  console.log("👤 Creating Admin...");
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@unires.ac.id",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  // 2) Gedung
  console.log("🏢 Creating Gedung...");
  const gedungY = await prisma.gedung.create({ data: { nama: "Gedung Y" } });
  const gedungU = await prisma.gedung.create({ data: { nama: "Gedung U" } });

  // 3) Lantai
  console.log("🏗️ Creating Lantai...");
  const lantaiY1 = await prisma.lantai.create({ data: { nama: "Lantai 1", gedungId: gedungY.id } });
  const lantaiY2 = await prisma.lantai.create({ data: { nama: "Lantai 2", gedungId: gedungY.id } });
  const lantaiY3 = await prisma.lantai.create({ data: { nama: "Lantai 3", gedungId: gedungY.id } });
  const lantaiY4 = await prisma.lantai.create({ data: { nama: "Lantai 4", gedungId: gedungY.id } });

  const lantaiU1 = await prisma.lantai.create({ data: { nama: "Lantai 1", gedungId: gedungU.id } });
  const lantaiU2 = await prisma.lantai.create({ data: { nama: "Lantai 2", gedungId: gedungU.id } });
  const lantaiU3 = await prisma.lantai.create({ data: { nama: "Lantai 3", gedungId: gedungU.id } });
  const lantaiU4 = await prisma.lantai.create({ data: { nama: "Lantai 4", gedungId: gedungU.id } });

  // 4) Usroh
  console.log("👥 Creating Usroh...");
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

  // 5) Musyrif
  console.log("👨‍🏫 Creating Musyrif...");
  const musyrifSeed = [
    { name: "Ustadzah Aminah", email: "aminah@unires.ac.id", lantaiId: lantaiY1.id },
    { name: "Ustadzah Fatimah", email: "fatimah@unires.ac.id", lantaiId: lantaiY2.id },
    { name: "Ustadzah Khadijah", email: "khadijah@unires.ac.id", lantaiId: lantaiY3.id },
    { name: "Ustadzah Maryam", email: "maryam@unires.ac.id", lantaiId: lantaiY4.id },
    { name: "Ustadz Ahmad", email: "ahmad@unires.ac.id", lantaiId: lantaiU1.id },
    { name: "Ustadz Budi", email: "budi@unires.ac.id", lantaiId: lantaiU2.id },
    { name: "Ustadz Hasan", email: "hasan@unires.ac.id", lantaiId: lantaiU3.id },
    { name: "Ustadz Ibrahim", email: "ibrahim@unires.ac.id", lantaiId: lantaiU4.id },
  ];

  for (const m of musyrifSeed) {
    await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        password: hashedPassword,
        role: "MUSYRIF",
        isActive: true,
        musyrif: { create: { lantaiId: m.lantaiId } },
      },
    });
  }

  // 6) Asisten Musyrif
  console.log("👨‍🎓 Creating Asisten Musyrif...");
  await prisma.user.create({
    data: {
      name: "Muhammad Fajar",
      email: "muhammad.fajar.ft21@mail.umy.ac.id",
      password: hashedPassword,
      role: "ASISTEN",
      isActive: true,
      asisten: {
        create: {
          nim: "2021010001",
          jurusan: "Teknik Informatika",
          angkatan: 2021,
          noTelp: "081234567890",
          usrohId: usrohList[0].id,
        },
      },
    },
  });

  // 7) Residents
  console.log("🎓 Creating Residents...");

  const residentTemplate = {
    jurusan: [
      { nama: "Teknik Informatika", kode: "ft" },
      { nama: "Teknik Elektro", kode: "ft" },
      { nama: "Teknik Mesin", kode: "ft" },
      { nama: "Teknik Sipil", kode: "ft" },
      { nama: "Sistem Informasi", kode: "fti" },
      { nama: "Informatika", kode: "fti" },
      { nama: "Pendidikan Agama Islam", kode: "fai" },
      { nama: "Ekonomi Pembangunan", kode: "fe" },
      { nama: "Akuntansi", kode: "fe" },
      { nama: "Manajemen", kode: "fe" },
      { nama: "Kedokteran", kode: "fk" },
      { nama: "Farmasi", kode: "ff" },
      { nama: "Psikologi", kode: "fp" },
    ],
    angkatan: [2022, 2023, 2024],
  };

  const femaleNames = [
    "Zahra","Siti","Fathiya","Naila","Aisha","Rahma","Salma","Mariam","Nabila","Hanifa","Aliya","Yasmin","Inara","Rania","Kayla","Laila",
    "Dina","Salsabila","Alifah","Putri","Najwa","Shafa","Hana","Farah","Annisa","Kirana","Aqila","Azizah","Nadia","Raisa","Safina","Qonita",
    "Zara","Hasna","Amira","Balqis","Kinanti","Naura","Sekar","Alya","Rifa","Maryam","Syifa","Ghania","Talita","Calista","Adzkia","Dzakira",
    "Khanza","Mahira","Aisyah","Sakina","Nadira","Kamilah","Alisha","Ratna","Fariha","Nazwa","Assyifa","Qistina","Lathifa","Almira","Syakira","Humairah",
  ];

  const maleNames = [
    "Farhan","Rizki","Zaki","Hafiz","Fauzan","Daffa","Ibrahim","Yusuf","Arif","Bayu","Aditya","Azka","Salman","Reza","Ilham","Haikal",
    "Malik","Akbar","Naufal","Rafi","Dzaki","Kemal","Fadhil","Alif","Raihan","Kenzie","Azzam","Nadhif","Razan","Zahran","Hilal","Shidqi",
    "Harun","Gibran","Farrel","Rafif","Arkan","Athallah","Raziq","Kaisar","Daniyal","Rayyan","Lutfi","Hanif","Khairan","Najib","Haekal","Muzakki",
    "Ghalib","Taufiq","Syamil","Furqan","Bariq","Najwan","Rafka","Ziyad","Rasyid","Ghifari","Sahil","Faris","Rifqi","Tsaqif","Basil","Uwais",
  ];

  const lastNames = [
    "Putri","Rahmawati","Ahmad","Ibrahim","Malik","Sari","Dewi","Noor","Ali","Rahman","Hidayat","Pratama","Nugroho","Hasan","Abdullah","Hakim",
  ];

  let residentCount = 0;

  for (let usrohIndex = 0; usrohIndex < usrohList.length; usrohIndex++) {
    const usroh = usrohList[usrohIndex];
    const isGedungY = usrohIndex < 16;
    const names = isGedungY ? femaleNames : maleNames;

    let lantaiId;
    if (usrohIndex < 4) lantaiId = lantaiY1.id;
    else if (usrohIndex < 8) lantaiId = lantaiY2.id;
    else if (usrohIndex < 12) lantaiId = lantaiY3.id;
    else if (usrohIndex < 16) lantaiId = lantaiY4.id;
    else if (usrohIndex < 20) lantaiId = lantaiU1.id;
    else if (usrohIndex < 24) lantaiId = lantaiU2.id;
    else if (usrohIndex < 28) lantaiId = lantaiU3.id;
    else lantaiId = lantaiU4.id;

    for (let i = 0; i < 4; i++) {
      const nameIndex = (usrohIndex * 4 + i) % names.length;
      const lastNameIndex = residentCount % lastNames.length;
      const firstName = names[nameIndex];
      const lastName = lastNames[lastNameIndex];
      const fullName = `${firstName} ${lastName}`;

      const jurusanData = residentTemplate.jurusan[residentCount % residentTemplate.jurusan.length];
      const angkatan = residentTemplate.angkatan[residentCount % residentTemplate.angkatan.length];

      const nim = `${angkatan}${String(residentCount + 1).padStart(7, "0")}`;

      const emailFirstName = firstName.toLowerCase().replace(/'/g, "");
      const emailLastName = lastName.toLowerCase().replace(/'/g, "");
      const tahunSingkat = String(angkatan).slice(-2);
      const email = `${emailFirstName}.${emailLastName}.${jurusanData.kode}${tahunSingkat}@mail.umy.ac.id`;

      await prisma.user.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: "RESIDENT",
          isActive: true,
          resident: {
            create: {
              nim,
              jurusan: jurusanData.nama,
              angkatan,
              noTelp: `0821${String(residentCount + 1).padStart(8, "0")}`,
              usrohId: usroh.id,
              lantaiId,
            },
          },
        },
      });

      residentCount++;
    }
  }

  console.log(`✅ Created ${residentCount} residents`);

  // 8) Kategori Materi
  console.log("📚 Creating Kategori Materi...");
  const kategoriTahsinTafkhim = await prisma.kategoriMateri.create({ data: { nama: "Tahsin dan Tafkhim" } });
  const kategoriTahfidz = await prisma.kategoriMateri.create({ data: { nama: "Tahfidz" } });
  const kategoriKemuhammadiyahan = await prisma.kategoriMateri.create({ data: { nama: "Kemuhammadiyahan" } });

  // 9) Materi
  console.log("📖 Creating Materi...");
  await prisma.materi.createMany({
    data: [
      {
        judul: "Makharijul Huruf",
        deskripsi: "Materi tentang tempat-tempat keluar huruf dalam bacaan Al-Quran",
        fileUrl: "/uploads/materi/makharijul-huruf.pdf",
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: "Sifatul Huruf",
        deskripsi: "Penjelasan tentang sifat-sifat huruf dalam tajwid",
        fileUrl: "/uploads/materi/sifatul-huruf.pdf",
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: "Hukum Mad",
        deskripsi: "Pembelajaran tentang berbagai macam hukum mad dalam Al-Quran",
        fileUrl: "/uploads/materi/hukum-mad.pdf",
        kategoriId: kategoriTahsinTafkhim.id,
      },
      {
        judul: "Hukum Nun Mati dan Tanwin",
        deskripsi: "Penjelasan hukum bacaan nun mati dan tanwin (Idzhar, Idgham, Iqlab, Ikhfa)",
        fileUrl: "/uploads/materi/nun-mati-tanwin.pdf",
        kategoriId: kategoriTahsinTafkhim.id,
      },

      {
        judul: "Metode Menghafal Juz Amma",
        deskripsi: "Teknik dan metode efektif menghafal surat-surat pendek",
        fileUrl: "/uploads/materi/metode-hafalan-juz-amma.pdf",
        kategoriId: kategoriTahfidz.id,
      },
      {
        judul: "Tips Menjaga Hafalan",
        deskripsi: "Cara-cara menjaga dan muroja'ah hafalan Al-Quran",
        fileUrl: "/uploads/materi/tips-jaga-hafalan.pdf",
        kategoriId: kategoriTahfidz.id,
      },
      {
        judul: "Adab Membaca dan Menghafal Al-Quran",
        deskripsi: "Adab dan etika dalam membaca serta menghafal Al-Quran",
        fileUrl: "/uploads/materi/adab-quran.pdf",
        kategoriId: kategoriTahfidz.id,
      },

      {
        judul: "Sejarah Berdirinya Muhammadiyah",
        deskripsi: "Latar belakang dan sejarah pendirian organisasi Muhammadiyah",
        fileUrl: "/uploads/materi/sejarah-muhammadiyah.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: "Matan Keyakinan dan Cita-cita Hidup Muhammadiyah",
        deskripsi: "Pemahaman tentang MKCH sebagai pedoman warga Muhammadiyah",
        fileUrl: "/uploads/materi/mkch.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: "Akhlak Islami",
        deskripsi: "Pembelajaran tentang akhlak mahmudah dan madzmumah dalam Islam",
        fileUrl: "/uploads/materi/akhlak-islami.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: "Fiqih Ibadah",
        deskripsi: "Panduan praktis tentang thaharah, shalat, puasa, dan zakat",
        fileUrl: "/uploads/materi/fiqih-ibadah.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: "Gerakan Amal Usaha Muhammadiyah",
        deskripsi: "Pengenalan berbagai amal usaha Muhammadiyah (pendidikan, kesehatan, sosial, ekonomi)",
        fileUrl: "/uploads/materi/amal-usaha.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
      {
        judul: "Kepemimpinan dalam Islam",
        deskripsi: "Konsep dan prinsip kepemimpinan menurut Islam dan Muhammadiyah",
        fileUrl: "/uploads/materi/kepemimpinan-islam.pdf",
        kategoriId: kategoriKemuhammadiyahan.id,
      },
    ],
  });

  // 10) Target Hafalan + SubTargets (schema kamu: TargetHafalan.subTargets -> SubTargets[])
  console.log("🎯 Creating Target Hafalan...");

  await prisma.targetHafalan.create({
    data: {
      nama: "An-Naba'",
      surah: "An-Naba'",
      ayatMulai: 1,
      ayatAkhir: 40,
      subTargets: {
        create: [
          { nama: "An-Naba' 1–10" },
          { nama: "An-Naba' 11–20" },
          { nama: "An-Naba' 21–30" },
          { nama: "An-Naba' 31–40" },
        ],
      },
    },
  });

  // (biar singkat, bagian target hafalan panjang kamu bisa kamu tempel lanjut di sini persis seperti sebelumnya)

  // --- PENTING ---
  // Karena kamu kirim seed yang sangat panjang, bagian target hafalan selanjutnya
  // kamu tinggal paste lanjut dari seed lama. Strukturnya sudah benar:
  // prisma.targetHafalan.create({ data: { ..., subTargets: { create: [...] } } })

  // 11) Sample nilai tahfidz
  console.log("📝 Creating Sample Nilai Tahfidz...");
  const allResidents = await prisma.resident.findMany({ include: { usroh: true } });
  const targets = await prisma.targetHafalan.findMany({ take: 10 });

  const nilaiOptions = ["A", "A-", "B+", "B", "B-", "C+", "C"];
  const statusOptions = ["SELESAI", "BELUM SELESAI", "SELESAI"];

  let nilaiCount = 0;

  const residentsByUsroh = {};
  for (const r of allResidents) {
    const usrohId = r.usrohId;
    if (!residentsByUsroh[usrohId]) residentsByUsroh[usrohId] = [];
    residentsByUsroh[usrohId].push(r);
  }

  for (const usrohId in residentsByUsroh) {
    const residents = residentsByUsroh[usrohId];
    for (let i = 0; i < Math.min(3, residents.length); i++) {
      const resident = residents[i];
      const numTargets = 2 + (nilaiCount % 3);

      for (let j = 0; j < numTargets && j < targets.length; j++) {
        const targetIndex = (nilaiCount + j) % targets.length;
        const target = targets[targetIndex];

        const nilaiHuruf = nilaiOptions[nilaiCount % nilaiOptions.length];
        const status = statusOptions[nilaiCount % statusOptions.length];

        await prisma.nilaiTahfidz.create({
          data: {
            residentId: resident.id,
            targetHafalanId: target.id,
            nilaiHuruf,
            status,
          },
        });

        nilaiCount++;
      }
    }
  }

  console.log(`✅ Created ${nilaiCount} nilai tahfidz entries`);

  // 12) Assignments
  console.log("📝 Creating Sample Assignments...");
  const allMateri = await prisma.materi.findMany();

  const assignmentsData = [
    {
      judul: "Kuis Makharijul Huruf Bagian 1",
      pertanyaan: "Dari manakah huruf ب (Ba), م (Mim), dan و (Wau) keluar?",
      opsiA: "Al-Jauf (rongga mulut)",
      opsiB: "Asy-Syafatain (dua bibir)",
      opsiC: "Al-Lisan (lidah)",
      opsiD: "Al-Halq (tenggorokan)",
      jawabanBenar: "B",
      materiNama: "Makharijul Huruf",
    },
    // ... lanjutkan data assignment kamu persis seperti seed lama
  ];

  let assignmentCount = 0;
  for (const a of assignmentsData) {
    const materi = allMateri.find((m) => m.judul === a.materiNama);
    if (!materi) continue;

    await prisma.assignment.create({
      data: {
        materiId: materi.id,
        judul: a.judul,
        pertanyaan: a.pertanyaan,
        opsiA: a.opsiA,
        opsiB: a.opsiB,
        opsiC: a.opsiC,
        opsiD: a.opsiD,
        jawabanBenar: a.jawabanBenar,
      },
    });
    assignmentCount++;
  }

  console.log(`✅ Created ${assignmentCount} assignments`);

  console.log("✅ Seed completed successfully!");
  console.log("📊 Summary:");
  console.log("  - 2 Gedung (Y, U)");
  console.log("  - 8 Lantai (4 per gedung)");
  console.log("  - 32 Usroh (4 per lantai)");
  console.log("  - 8 Musyrif (1 per lantai)");
  console.log(`  - ${residentCount} Residents (4 per usroh)`);
  console.log("  - 1 Admin, 1 Asisten");
  console.log("  - 3 Kategori Materi");
  console.log("  - 13 Materi");
  console.log(`  - ${nilaiCount} Nilai Tahfidz`);
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
