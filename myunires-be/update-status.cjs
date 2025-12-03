const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateStatus() {
  try {
    console.log('🔄 Memulai update status...');

    // Update LULUS menjadi SELESAI
    const updateLulus = await prisma.nilaiTahfidz.updateMany({
      where: {
        status: 'LULUS'
      },
      data: {
        status: 'SELESAI'
      }
    });

    console.log(`✅ Berhasil update ${updateLulus.count} data dari LULUS ke SELESAI`);

    // Update PROGRESS menjadi BELUM SELESAI
    const updateProgress = await prisma.nilaiTahfidz.updateMany({
      where: {
        status: 'PROGRESS'
      },
      data: {
        status: 'BELUM SELESAI'
      }
    });

    console.log(`✅ Berhasil update ${updateProgress.count} data dari PROGRESS ke BELUM SELESAI`);

    // Verifikasi hasil
    const selesai = await prisma.nilaiTahfidz.count({
      where: { status: 'SELESAI' }
    });

    const belumSelesai = await prisma.nilaiTahfidz.count({
      where: { status: 'BELUM SELESAI' }
    });

    console.log('\n📊 Status data saat ini:');
    console.log(`   - SELESAI: ${selesai}`);
    console.log(`   - BELUM SELESAI: ${belumSelesai}`);
    console.log('\n✅ Update status selesai!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStatus();
