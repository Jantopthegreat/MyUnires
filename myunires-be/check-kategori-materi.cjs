const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    const kategori = await prisma.kategoriMateri.findMany({
      orderBy: { id: 'asc' }
    });
    
    const materi = await prisma.materi.findMany({
      include: {
        kategori: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n📊 DATABASE CHECK:');
    console.log('='.repeat(50));
    console.log(`\n📂 Kategori Materi: ${kategori.length} records`);
    kategori.forEach(k => {
      console.log(`   ${k.id}. ${k.nama}`);
    });
    
    console.log(`\n📚 Materi: ${materi.length} records`);
    materi.forEach(m => {
      console.log(`   ${m.id}. ${m.judul} (Kategori: ${m.kategori?.nama || 'N/A'})`);
    });
    
    console.log('\n' + '='.repeat(50));
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
