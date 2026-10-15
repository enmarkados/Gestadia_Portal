import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appV2ConversationConfig } from '../../config.js';
test('CRM guest requiere opt-in exacto y permanece apagado por defecto',()=>{
 assert.equal(appV2ConversationConfig({APP_V2_GUEST_CRM_ENABLED:'true'}).guestCrmEnabled,true);
 for(const value of [undefined,'false','1','TRUE'])assert.equal(appV2ConversationConfig({APP_V2_GUEST_CRM_ENABLED:value}).guestCrmEnabled,false);
});
