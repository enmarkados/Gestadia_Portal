-- CreateTable
CREATE TABLE `AppGuestInstallation` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AppGuestInstallation_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppGuestConversation` (
    `id` VARCHAR(191) NOT NULL,
    `installationId` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(128) NOT NULL,
    `remoteId` VARCHAR(128) NULL,
    `ownerUserId` VARCHAR(191) NULL,
    `permissions` JSON NULL,
    `accessRevision` VARCHAR(20) NOT NULL DEFAULT '0',
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `title` VARCHAR(120) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastMessageAt` DATETIME(3) NULL,

    INDEX `AppGuestConversation_installationId_createdAt_idx`(`installationId`, `createdAt`),
    INDEX `AppGuestConversation_ownerUserId_createdAt_idx`(`ownerUserId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppGuestOperation` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(32) NOT NULL,
    `key` VARCHAR(128) NOT NULL,
    `hash` VARCHAR(64) NOT NULL,
    `request` JSON NOT NULL,
    `response` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'prepared',
    `errorCode` VARCHAR(64) NULL,
    `remoteOperationId` VARCHAR(128) NULL,
    `claimId` VARCHAR(36) NULL,
    `leaseUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppGuestOperation_conversationId_kind_key_key`(`conversationId`, `kind`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppGuestBinding` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `targetUserId` VARCHAR(191) NOT NULL,
    `request` JSON NOT NULL,
    `response` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'preparing',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppGuestBinding_conversationId_key`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
