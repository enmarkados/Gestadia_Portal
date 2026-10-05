-- CreateTable
CREATE TABLE `AppConversation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    `scopeKey` VARCHAR(64) NOT NULL,
    `purpose` VARCHAR(16) NOT NULL,
    `caseId` VARCHAR(191) NULL,
    `remoteId` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    `stateRevision` VARCHAR(20) NOT NULL DEFAULT '0',
    `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `contextRevision` VARCHAR(20) NOT NULL DEFAULT '0',
    `syncedRevision` VARCHAR(20) NOT NULL DEFAULT '0',
    `contextHash` VARCHAR(64) NULL,
    `context` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppConversation_userId_integrationId_scopeKey_key`(`userId`, `integrationId`, `scopeKey`),
    UNIQUE INDEX `AppConversation_integrationId_remoteId_key`(`integrationId`, `remoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppOperation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    `conversationId` VARCHAR(191) NULL,
    `scopeId` VARCHAR(36) NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `idempotencyKey` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    `logicalId` VARCHAR(128) COLLATE utf8mb4_bin NULL,
    `semanticHash` VARCHAR(64) NOT NULL,
    `request` JSON NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'prepared',
    `response` JSON NULL,
    `httpStatus` INTEGER NULL,
    `errorCode` VARCHAR(64) NULL,
    `retainedUntil` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AppOperation_integrationId_kind_status_idx`(`integrationId`, `kind`, `status`),
    UNIQUE INDEX `AppOperation_userId_integrationId_scopeId_kind_idempotencyKe_key`(`userId`, `integrationId`, `scopeId`, `kind`, `idempotencyKey`),
    UNIQUE INDEX `AppOperation_userId_integrationId_scopeId_kind_logicalId_key`(`userId`, `integrationId`, `scopeId`, `kind`, `logicalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppConversationAccess` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `scopeKey` VARCHAR(64) NOT NULL,
    `purpose` VARCHAR(16) NOT NULL,
    `caseId` VARCHAR(191) NULL,
    `permissions` JSON NOT NULL,
    `commercialAssignmentRef` VARCHAR(128) NULL,
    `managerAssignmentRef` VARCHAR(128) NULL,
    `sourceRef` VARCHAR(128) NOT NULL,
    `validatedAt` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppConversationAccess_userId_scopeKey_key`(`userId`, `scopeKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppConversation` ADD CONSTRAINT `AppConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppOperation` ADD CONSTRAINT `AppOperation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppOperation` ADD CONSTRAINT `AppOperation_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `AppConversation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppConversationAccess` ADD CONSTRAINT `AppConversationAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

