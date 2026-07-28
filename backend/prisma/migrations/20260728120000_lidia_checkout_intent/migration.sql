-- Integración LidIA (contrato 1.0): procedencia en Expediente, intents de
-- checkout y outbox de callbacks. Migración aditiva escrita a mano (sin BD
-- local); se aplica con `prisma migrate deploy`.

-- AlterTable
ALTER TABLE `Expediente`
    ADD COLUMN `procedencia` VARCHAR(191) NOT NULL DEFAULT 'web',
    ADD COLUMN `origenMeta` JSON NULL;

-- CreateTable
CREATE TABLE `CheckoutIntent` (
    `id` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `payloadHash` VARCHAR(191) NOT NULL,
    `procedencia` VARCHAR(191) NOT NULL,
    `servicioSlug` VARCHAR(191) NOT NULL,
    `catalogCode` VARCHAR(191) NOT NULL,
    `amountMinor` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `lidiaPaymentId` VARCHAR(191) NOT NULL,
    `lidiaPaymentAttemptId` VARCHAR(191) NOT NULL,
    `replacesId` VARCHAR(191) NULL,
    `prefill` JSON NOT NULL,
    `origenMeta` JSON NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'active',
    `expiresAt` DATETIME(3) NOT NULL,
    `expedienteId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CheckoutIntent_publicId_key`(`publicId`),
    UNIQUE INDEX `CheckoutIntent_token_key`(`token`),
    UNIQUE INDEX `CheckoutIntent_idempotencyKey_key`(`idempotencyKey`),
    INDEX `CheckoutIntent_lidiaPaymentId_idx`(`lidiaPaymentId`),
    INDEX `CheckoutIntent_estado_expiresAt_idx`(`estado`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LidiaEvento` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `checkoutIntentId` VARCHAR(191) NOT NULL,
    `payload` TEXT NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `intentos` INTEGER NOT NULL DEFAULT 0,
    `proximoIntento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimaRespuesta` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LidiaEvento_eventId_key`(`eventId`),
    INDEX `LidiaEvento_estado_proximoIntento_idx`(`estado`, `proximoIntento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
