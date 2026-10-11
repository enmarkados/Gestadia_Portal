ALTER TABLE `AppConversation`
  ADD COLUMN `profileBaseline` JSON NULL,
  ADD COLUMN `profilePatch` JSON NULL,
  ADD COLUMN `profileRevision` VARCHAR(20) NOT NULL DEFAULT '0';
