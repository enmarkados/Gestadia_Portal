-- Nullable binding; existing grants retain their original authority.
ALTER TABLE `AppConversation` ADD COLUMN `callbackGrant` JSON NULL;
