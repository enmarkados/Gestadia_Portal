// Retiene la entrega de callbacks a LidIA a nivel de DATOS (no de config):
// vigila la cola y aparta los eventos nuevos antes de que ningún worker los
// despache. Determinista aunque haya varios workers vivos.
//
//   node scripts/retener-eventos.mjs vigilar   → bloquea eventos nuevos (Ctrl+C para parar)
//   node scripts/retener-eventos.mjs estado    → lista lo retenido
//   node scripts/retener-eventos.mjs soltar    → devuelve lo retenido a la cola
//
// Método: estado 'retenido' + proximoIntento lejano. El worker solo mira
// { estado: 'pendiente', proximoIntento <= now }, así que no los toca.
import { db } from '../src/db.js';

const LEJOS = new Date('2099-01-01T00:00:00Z');
const accion = process.argv[2] || 'estado';

async function apartar() {
  const nuevos = await db.lidiaEvento.findMany({ where: { estado: 'pendiente' } });
  for (const e of nuevos) {
    await db.lidiaEvento.update({
      where: { id: e.id },
      data: { estado: 'retenido', proximoIntento: LEJOS },
    });
    console.log(`  ⏸ retenido ${e.eventType} · ${e.eventId}`);
  }
  return nuevos.length;
}

if (accion === 'vigilar') {
  console.log('Vigilando la cola cada 2 s. Los eventos nuevos se retienen al instante.');
  console.log('(Ctrl+C para parar; los ya retenidos siguen retenidos)\n');
  for (;;) {
    await apartar().catch((e) => console.error('  error:', e.message));
    await new Promise((r) => setTimeout(r, 2000));
  }
} else if (accion === 'soltar') {
  const retenidos = await db.lidiaEvento.findMany({ where: { estado: 'retenido' } });
  for (const e of retenidos) {
    await db.lidiaEvento.update({
      where: { id: e.id },
      data: { estado: 'pendiente', proximoIntento: new Date() },
    });
    console.log(`  ▶ soltado ${e.eventType} · ${e.eventId}`);
  }
  console.log(`\n${retenidos.length} evento(s) devueltos a la cola: saldrán en el próximo ciclo (≤30 s).`);
  process.exit(0);
} else {
  const retenidos = await db.lidiaEvento.findMany({ where: { estado: 'retenido' }, orderBy: { createdAt: 'asc' } });
  console.log(`Retenidos: ${retenidos.length}`);
  for (const e of retenidos) console.log(`  ${e.eventType} · ${e.eventId} · ${e.createdAt.toISOString()}`);
  process.exit(0);
}
