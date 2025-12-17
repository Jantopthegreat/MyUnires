-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AccountActivationToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AccountActivationToken_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccountActivationToken` ADD CONSTRAINT `AccountActivationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
