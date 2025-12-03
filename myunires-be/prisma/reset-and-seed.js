import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const prisma = new PrismaClient();

async function resetAndSeed() {
  try {
    console.log('🗑️  Deleting all data...');
    
    // Delete in correct order to respect foreign keys
    await prisma.nilaiTahfidz.deleteMany({});
    await prisma.nilai.deleteMany({});
    await prisma.jawaban.deleteMany({});
    await prisma.subTargets.deleteMany({});
    await prisma.targetHafalan.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.materi.deleteMany({});
    await prisma.kategoriMateri.deleteMany({});
    await prisma.asistenMusyrif.deleteMany({});
    await prisma.resident.deleteMany({});
    await prisma.musyrif.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.usroh.deleteMany({});
    await prisma.lantai.deleteMany({});
    await prisma.gedung.deleteMany({});
    
    console.log('✅ All data deleted!');
    console.log('🌱 Starting seed...');
    
    // Run seed
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeed();
