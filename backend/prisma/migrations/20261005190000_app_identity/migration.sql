ALTER TABLE `User` ADD COLUMN `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'active',
 ADD COLUMN `accountVerifiedAt` DATETIME(3) NULL,
 ADD COLUMN `accountVerificationMethod` VARCHAR(191) NULL;
CREATE TABLE `AppDeviceSession` (
 `id` VARCHAR(191) NOT NULL, `userId` VARCHAR(191) NOT NULL,
 `tokenHash` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 `deviceLabel` VARCHAR(80) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 `expiresAt` DATETIME(3) NOT NULL, `revokedAt` DATETIME(3) NULL,
 PRIMARY KEY (`id`), UNIQUE INDEX `AppDeviceSession_tokenHash_key` (`tokenHash`),
 INDEX `AppDeviceSession_userId_revokedAt_idx` (`userId`,`revokedAt`),
 CONSTRAINT `AppDeviceSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
