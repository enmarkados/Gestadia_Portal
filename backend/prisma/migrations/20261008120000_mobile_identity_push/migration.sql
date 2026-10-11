-- AlterTable
ALTER TABLE `User` ADD COLUMN `accessRevokedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `AuthSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,

    INDEX `AuthSession_userId_revokedAt_idx`(`userId`, `revokedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialIdentity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `issuer` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `appleRefreshEncrypted` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SocialIdentity_userId_idx`(`userId`),
    UNIQUE INDEX `SocialIdentity_issuer_subject_key`(`issuer`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialAuthAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `linkUserId` VARCHAR(191) NULL,
    `authSessionId` VARCHAR(191) NULL,
    `nonceHash` VARCHAR(191) NOT NULL,
    `stateHash` VARCHAR(191) NOT NULL,
    `proofHash` VARCHAR(191) NOT NULL,
    `audience` VARCHAR(191) NOT NULL,
    `claims` JSON NULL,
    `appleRefreshEncrypted` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `handoffCodeHash` VARCHAR(191) NULL,
    `handoffExpiresAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SocialAuthAttempt_stateHash_key`(`stateHash`),
    UNIQUE INDEX `SocialAuthAttempt_handoffCodeHash_key`(`handoffCodeHash`),
    INDEX `SocialAuthAttempt_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushDevice` (
    `id` VARCHAR(191) NOT NULL,
    `installationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `transport` VARCHAR(191) NOT NULL,
    `environment` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `tokenEncrypted` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PushDevice_installationId_key`(`installationId`),
    UNIQUE INDEX `PushDevice_tokenHash_key`(`tokenHash`),
    INDEX `PushDevice_userId_active_idx`(`userId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `notificationId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimId` VARCHAR(191) NULL,
    `lockedUntil` DATETIME(3) NULL,
    `lastError` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,

    INDEX `PushDelivery_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`),
    UNIQUE INDEX `PushDelivery_notificationId_deviceId_key`(`notificationId`, `deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountDeletionRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending_review',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AccountDeletionRequest_userId_key`(`userId`),
    INDEX `AccountDeletionRequest_status_requestedAt_idx`(`status`, `requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuthSession` ADD CONSTRAINT `AuthSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialIdentity` ADD CONSTRAINT `SocialIdentity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushDevice` ADD CONSTRAINT `PushDevice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushDevice` ADD CONSTRAINT `PushDevice_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AuthSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushDelivery` ADD CONSTRAINT `PushDelivery_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `Notificacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushDelivery` ADD CONSTRAINT `PushDelivery_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `PushDevice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountDeletionRequest` ADD CONSTRAINT `AccountDeletionRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

