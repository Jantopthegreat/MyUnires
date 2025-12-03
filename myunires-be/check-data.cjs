const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking database data...\n');
    
    const kategori = await prisma.kategoriMateri.findMany();
    console.log('📁 Kategori Materi:', kategori.length);
    kategori.forEach(k => console.log(`  - ${k.nama} (id: ${k.id})`));
    
    console.log('');
    
    const materi = await prisma.materi.findMany({
      include: { kategori: true }
    });
    console.log('📚 Materi:', materi.length);
    materi.forEach(m => console.log(`  - ${m.judul} (id: ${m.id}) - Kategori: ${m.kategori.nama}`));
    
    console.log('');
    
    const assignment = await prisma.assignment.findMany({
      include: { materi: { include: { kategori: true } } }
    });
    console.log('📝 Assignment:', assignment.length);
    assignment.forEach(a => console.log(`  - ${a.judul} (id: ${a.id}) - Materi: ${a.materi?.judul || 'NULL'}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
