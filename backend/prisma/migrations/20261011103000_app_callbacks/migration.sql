ALTER TABLE `AppConversation` ADD COLUMN `managerName` VARCHAR(120) NULL;
CREATE TABLE `AppCallbackRequest` (
 `id` VARCHAR(191) NOT NULL,
 `actorScope` VARCHAR(64) NOT NULL,
 `idempotencyKey` VARCHAR(128) NOT NULL,
 `payloadHash` VARCHAR(64) NOT NULL,
 `payload` JSON NOT NULL,
 `status` VARCHAR(32) NOT NULL DEFAULT 'prepared',
 `contactId` VARCHAR(64) NULL,
  `leadId` VARCHAR(128) NULL,
 `taskId` VARCHAR(128) NULL,
 `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 `updatedAt` DATETIME(3) NOT NULL,
 PRIMARY KEY (`id`), UNIQUE INDEX `AppCallbackRequest_actorScope_idempotencyKey_key` (`actorScope`,`idempotencyKey`),
 INDEX `AppCallbackRequest_status_updatedAt_idx` (`status`,`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
