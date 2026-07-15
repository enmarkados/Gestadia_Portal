-- Additive: id de Customer de Stripe por usuario.
ALTER TABLE `User` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;
