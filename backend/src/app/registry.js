import { appConversationIntegrations } from '../config.js';
import { AppConversationService } from './conversations.js';
import { AppS2SClient } from './s2s.js';
import { AppProblem } from './problem.js';
import { UUID, IDEM } from './contracts.js';
import { drainLifecycle } from './lifecycle.js';

// Integration IDs are read from durable ownership, never from a mobile selector.
export class AppConversationRegistry {
  constructor(db, config, { clientFactory = c => new AppS2SClient(c) } = {}) {
    this.db = db;
    this.config = config;
    this.services = new Map(appConversationIntegrations(config).map(c => [
      c.integrationId, new AppConversationService(db, clientFactory(c), c),
    ]));
    this.base = this.services.get(config.integrationId);
  }

  async owner(token, id, operation = false) {
    return this.base.authorized(token, async (tx, user) => {
      const row = await tx[operation ? 'appOperation' : 'appConversation'].findFirst({
        where: { id, userId: user.id, integrationId: { in: [...this.services.keys()] },
          ...(operation ? { kind: { in: ['session', 'turn', 'handoff'] } } : {}) },
      });
      if (!row) throw new AppProblem(404, operation ? 'operation_not_found' : 'conversation_not_found');
      return this.services.get(row.integrationId);
    });
  }

  async start(token, input, key) {
    // Preserve the existing payload validation before using fields in a lookup.
    if (!input || Object.keys(input).some(k => !['purpose', 'case_ref', 'create_new', 'conversation_id'].includes(k)) ||
        !['sondeo', 'atencion'].includes(input.purpose) ||
        (Object.hasOwn(input, 'create_new') && typeof input.create_new !== 'boolean') ||
        (input.create_new === true && input.purpose !== 'sondeo') ||
        (input.conversation_id != null && !UUID.test(input.conversation_id)) ||
        (input.create_new === true && input.conversation_id != null) ||
        (input.case_ref && !UUID.test(input.case_ref)) || !IDEM.test(key || ''))
      throw new AppProblem(400, 'invalid_payload');
    for (;;) {
      const selected = await this.base.authorized(token, async (tx, user) => {
        const ids = [...this.services.keys()];
        const previous = await tx.appOperation.findMany({ where: {
          userId: user.id, integrationId: { in: ids }, scopeId: '', kind: 'session', idempotencyKey: key,
        }, take: 2 });
        if (previous.length > 1) throw new AppProblem(409, 'idempotency_conflict');
        if (previous.length) return { service: this.services.get(previous[0].integrationId) };
        if (input.conversation_id) {
          const row = await tx.appConversation.findFirst({ where: {
            id: input.conversation_id, userId: user.id, integrationId: { in: ids },
          } });
          if (!row) throw new AppProblem(404, 'conversation_not_found');
          return { service: this.services.get(row.integrationId) };
        }
        if (input.create_new !== true) {
          const row = await tx.appConversation.findFirst({ where: {
            userId: user.id, integrationId: { in: ids }, purpose: input.purpose,
            caseId: input.case_ref || null, status: { not: 'closed' },
          }, orderBy: { createdAt: 'desc' } });
          if (row) return { service: this.services.get(row.integrationId), candidateId: row.id };
        }
        return { service: input.purpose === 'sondeo' && this.config.nativeSondeo?.createNew
          ? this.services.get(this.config.nativeSondeo.integrationId) : this.base };
      });
      // Pin an implicit resume to its candidate: a remote closure must reselect
      // the new-session integration instead of creating inside the old one.
      try {
        return await selected.service.start(token, selected.candidateId
          ? { ...input, conversation_id: selected.candidateId } : input, key);
      } catch (error) {
        if (!selected.candidateId || error.code !== 'conversation_closed') throw error;
      }
    }
  }

  async list(token) {
    const lists = await Promise.all([...this.services.values()].map(s => s.list(token)));
    return lists.flat().sort((a, b) =>
      Date.parse(b.last_message_at || b.created_at) - Date.parse(a.last_message_at || a.created_at) || a.id.localeCompare(b.id));
  }

  async conversationCall(method, token, id, ...args) {
    return (await this.owner(token, id))[method](token, id, ...args);
  }
  rename(token, id, input) { return this.conversationCall('rename', token, id, input); }
  timeline(token, id, query) { return this.conversationCall('timeline', token, id, query); }
  messageReceipts(token, id, query) { return this.conversationCall('messageReceipts', token, id, query); }
  ackMessages(token, id, input, key) { return this.conversationCall('ackMessages', token, id, input, key); }
  turn(token, id, input) { return this.conversationCall('turn', token, id, input); }
  handoff(token, id, input, key) { return this.conversationCall('handoff', token, id, input, key); }
  async operation(token, id) { return (await this.owner(token, id, true)).operation(token, id); }
  async retry(token, id) { return (await this.owner(token, id, true)).retry(token, id); }

  async drainLifecycle() {
    const results = await Promise.allSettled([...this.services.values()].map(service =>
      drainLifecycle(this.db, service.client, service.config)));
    const failed = results.find(result => result.status === 'rejected');
    if (failed) throw failed.reason;
  }
}
