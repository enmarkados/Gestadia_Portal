ALTER TABLE `AccountDeletionRequest`
  ADD COLUMN `result` JSON NULL,
  ADD COLUMN `contactEmailEncrypted` TEXT NULL,
  ADD COLUMN `notificationStatus` VARCHAR(191) NOT NULL DEFAULT 'not_ready',
  ADD COLUMN `notificationClaimId` VARCHAR(191) NULL,
  ADD COLUMN `notificationLockedUntil` DATETIME(3) NULL,
  ADD COLUMN `notificationAttempts` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `notificationNextAttempt` DATETIME(3) NULL;

ALTER TABLE `AccountDeletionRequest` ADD COLUMN `retainedDataEncrypted` LONGTEXT NULL;
CREATE TABLE `AccountDeletionReview` (
  `id` VARCHAR(191) NOT NULL,
  `requestId` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL DEFAULT 'review',
  `actorRef` VARCHAR(191) NOT NULL,
  `authorityRef` VARCHAR(191) NOT NULL,
  `inventoryHash` VARCHAR(191) NOT NULL,
  `decision` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AccountDeletionReview_requestId_createdAt_idx` (`requestId`, `createdAt`),
  CONSTRAINT `AccountDeletionReview_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `AccountDeletionRequest` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
