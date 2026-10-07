-- Preserve historical sessions and durable operations while allowing a new session after closure.
ALTER TABLE `AppConversation`
  ADD COLUMN `title` VARCHAR(120) NULL,
  ADD COLUMN `remoteCreatedAt` DATETIME(3) NULL,
  ADD COLUMN `lastMessageAt` DATETIME(3) NULL;
CREATE INDEX `AppConversation_userId_integrationId_scopeKey_idx`
  ON `AppConversation`(`userId`, `integrationId`, `scopeKey`);
DROP INDEX `AppConversation_userId_integrationId_scopeKey_key` ON `AppConversation`;
