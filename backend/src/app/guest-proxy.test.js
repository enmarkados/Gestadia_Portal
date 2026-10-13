import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../../../deploy/app/common.conf.template', import.meta.url), 'utf8');
const routes = [...config.matchAll(/location\s+~\s+(['"]?)(\^[^\n]*?)\1\s+\{/g)]
  .map(match => match[2]).filter(pattern => pattern.startsWith('^/api/app/guest/')).map(pattern => new RegExp(pattern));
const id = '11111111-1111-4111-8111-111111111111';
const allows = path => routes.some(route => route.test(path));

test('the APP proxy forwards every consumed guest endpoint', () => {
  for (const path of [
    '/api/app/guest/installations', '/api/app/guest/conversations',
    `/api/app/guest/conversations/${id}`, `/api/app/guest/conversations/${id}/timeline`,
    `/api/app/guest/conversations/${id}/turns`, `/api/app/guest/conversations/${id}/message-receipts`,
    `/api/app/guest/conversations/${id}/bind`, `/api/app/guest/operations/${id}`, `/api/app/guest/operations/${id}/retry`,
  ]) assert.equal(allows(path), true, path);
});

test('guest forwarding keeps unknown and malformed paths closed', () => {
  for (const path of [
    '/api/app/guest/admin', '/api/app/guest/installations/extra', '/api/app/guest/operations',
    '/api/app/guest/conversations/not-a-uuid', `/api/app/guest/conversations/${id}/admin`,
    `/api/app/guest/conversations/${'-'.repeat(36)}`,
    `/api/app/guest/operations/${id}/delete`, '/api/webhooks/zoho',
  ]) assert.equal(allows(path), false, path);
  assert.match(config, /location\s+\/api\/\s*\{\s*return 404;/);
});
