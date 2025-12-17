-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MUSYRIF', 'ASISTEN', 'RESIDENT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resident` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `usrohId` INTEGER NULL,
    `lantaiId` INTEGER NULL,
    `nim` VARCHAR(191) NOT NULL,
    `jurusan` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `noTelp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Resident_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Musyrif` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `lantaiId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Musyrif_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsistenMusyrif` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `usrohId` INTEGER NULL,
    `nim` VARCHAR(191) NOT NULL,
    `jurusan` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `noTelp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AsistenMusyrif_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gedung` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lantai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `gedungId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usroh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `lantaiId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Materi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `kategoriId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materiId` INTEGER NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `pertanyaan` VARCHAR(191) NOT NULL,
    `opsiA` VARCHAR(191) NOT NULL,
    `opsiB` VARCHAR(191) NOT NULL,
    `opsiC` VARCHAR(191) NOT NULL,
    `opsiD` VARCHAR(191) NOT NULL,
    `jawabanBenar` VARCHAR(191) NOT NULL,
    `soalImageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jawaban` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `assignmentId` INTEGER NOT NULL,
    `jawabanUser` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nilai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `totalBenar` INTEGER NOT NULL,
    `totalSalah` INTEGER NOT NULL,
    `nilaiAkhir` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KategoriMateri` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `KategoriMateri_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TargetHafalan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `surah` VARCHAR(191) NOT NULL,
    `ayatMulai` INTEGER NOT NULL,
    `ayatAkhir` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubTargets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `targetId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NilaiTahfidz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `soalImageUrl` VARCHAR(191) NULL,
    `residentId` INTEGER NOT NULL,
    `targetHafalanId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `nilaiHuruf` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_usrohId_fkey` FOREIGN KEY (`usrohId`) REFERENCES `Usroh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_lantaiId_fkey` FOREIGN KEY (`lantaiId`) REFERENCES `Lantai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Musyrif` ADD CONSTRAINT `Musyrif_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Musyrif` ADD CONSTRAINT `Musyrif_lantaiId_fkey` FOREIGN KEY (`lantaiId`) REFERENCES `Lantai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsistenMusyrif` ADD CONSTRAINT `AsistenMusyrif_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsistenMusyrif` ADD CONSTRAINT `AsistenMusyrif_usrohId_fkey` FOREIGN KEY (`usrohId`) REFERENCES `Usroh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lantai` ADD CONSTRAINT `Lantai_gedungId_fkey` FOREIGN KEY (`gedungId`) REFERENCES `Gedung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usroh` ADD CONSTRAINT `Usroh_lantaiId_fkey` FOREIGN KEY (`lantaiId`) REFERENCES `Lantai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Materi` ADD CONSTRAINT `Materi_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `KategoriMateri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_materiId_fkey` FOREIGN KEY (`materiId`) REFERENCES `Materi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai` ADD CONSTRAINT `Nilai_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubTargets` ADD CONSTRAINT `SubTargets_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `TargetHafalan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiTahfidz` ADD CONSTRAINT `NilaiTahfidz_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiTahfidz` ADD CONSTRAINT `NilaiTahfidz_targetHafalanId_fkey` FOREIGN KEY (`targetHafalanId`) REFERENCES `TargetHafalan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
