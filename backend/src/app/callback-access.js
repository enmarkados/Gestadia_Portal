import { UUID } from './contracts.js';
import { AppProblem } from './problem.js';

export function callbackAccessConfig(env) {
  const enabled = env.APP_LIDIA_CALLBACK_ENABLED === 'true';
  let scope;
  try { scope = JSON.parse(env.APP_LIDIA_CALLBACK_SCOPE_JSON || 'null'); }
  catch { throw new AppProblem(503, 'runtime_unavailable'); }
  if (scope !== null) {
    const keys = ['portal_user_id', 'conversation_id', 'integration_id', 'expires_at'];
    const expiry = new Date(scope?.expires_at);
    if (!scope || Array.isArray(scope) || typeof scope !== 'object' ||
        Object.keys(scope).length !== keys.length || Object.keys(scope).some(k => !keys.includes(k)) ||
        typeof scope.portal_user_id !== 'string' || typeof scope.conversation_id !== 'string' || typeof scope.integration_id !== 'string' ||
        !UUID.test(scope.portal_user_id || '') || !UUID.test(scope.conversation_id || '') ||
        !/^[-A-Za-z0-9:._]{1,128}$/.test(scope.integration_id || '') ||
        typeof scope.expires_at !== 'string' || !Number.isFinite(+expiry) || expiry.toISOString() !== scope.expires_at)
      throw new AppProblem(503, 'runtime_unavailable');
  }
  if (enabled && !scope) throw new AppProblem(503, 'runtime_unavailable');
  return { enabled, scope };
}

export function callbackScopeAllows(config, conversation, userId, now = new Date()) {
  const access = config.callbackAccess, scope = access?.scope;
  return config.enabled === true && access?.enabled === true && !!scope &&
    scope.portal_user_id === userId && conversation.userId === userId &&
    scope.conversation_id === conversation.id && scope.integration_id === config.integrationId &&
    conversation.integrationId === config.integrationId && conversation.purpose === 'sondeo' &&
    !conversation.caseId && conversation.status === 'active' && !!conversation.remoteId &&
    Number.isFinite(+new Date(scope.expires_at)) && new Date(scope.expires_at) > now;
}
