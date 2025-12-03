const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Fixing old assignments...\n');
    
    // Check assignments with NULL materiId using raw query
    const nullAssignments = await prisma.$queryRaw`
      SELECT id, judul, materiId FROM assignment WHERE materiId IS NULL
    `;
    
    console.log(`📊 Found ${nullAssignments.length} assignments with NULL materiId`);
    
    if (nullAssignments.length > 0) {
      console.log('\n⚠️  Options:');
      console.log('1. Delete old assignments (karena tidak ada materi)');
      console.log('2. Set default materiId (misal: 21 - Pengenalan Tauhid)');
      console.log('\n📌 Executing: DELETE old assignments...\n');
      
      const deleted = await prisma.$executeRaw`
        DELETE FROM assignment WHERE materiId IS NULL
      `;
      
      console.log(`✅ Deleted ${deleted} old assignments`);
    } else {
      console.log('✅ No NULL materiId found');
    }
    
    // Now check all assignments
    const allAssignments = await prisma.assignment.findMany({
      include: { materi: { include: { kategori: true } } }
    });
    
    console.log(`\n📝 Total assignments now: ${allAssignments.length}`);
    allAssignments.forEach(a => {
      console.log(`  - ${a.judul} - Materi: ${a.materi.judul} (${a.materi.kategori.nama})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
