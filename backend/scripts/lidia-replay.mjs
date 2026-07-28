// Reencola un evento de la outbox LidIA para reenviarlo (contrato §9, replay manual).
// Uso (desde backend/): node scripts/lidia-replay.mjs <event_id>
import { db } from '../src/db.js';

const eventId = process.argv[2];
if (!eventId) { console.error('Uso: node scripts/lidia-replay.mjs <event_id>'); process.exit(1); }
const ev = await db.lidiaEvento.findUnique({ where: { eventId } });
if (!ev) { console.error(`Evento ${eventId} no encontrado`); process.exit(1); }
await db.lidiaEvento.update({ where: { eventId }, data: { estado: 'pendiente', proximoIntento: new Date() } });
console.log(`Evento ${eventId} reencolado (estado anterior: ${ev.estado}, intentos: ${ev.intentos})`);
process.exit(0);
