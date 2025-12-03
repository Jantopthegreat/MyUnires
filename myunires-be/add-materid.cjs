const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Menambahkan kolom materiId ke tabel assignment...');
    
    // Cek apakah kolom sudah ada
    const checkColumn = await prisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'assignment' 
      AND COLUMN_NAME = 'materiId'
    `);
    
    if (checkColumn.length > 0) {
      console.log('✅ Kolom materiId sudah ada');
    } else {
      // Tambah kolom materiId
      await prisma.$executeRawUnsafe(`
        ALTER TABLE assignment 
        ADD COLUMN materiId INT NULL
      `);
      console.log('✅ Kolom materiId berhasil ditambahkan');
      
      // Tambah foreign key
      await prisma.$executeRawUnsafe(`
        ALTER TABLE assignment 
        ADD CONSTRAINT fk_assignment_materi 
        FOREIGN KEY (materiId) REFERENCES materi(id) 
        ON DELETE CASCADE
      `);
      console.log('✅ Foreign key constraint berhasil ditambahkan');
    }
    
    console.log('✅ Migration selesai!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
