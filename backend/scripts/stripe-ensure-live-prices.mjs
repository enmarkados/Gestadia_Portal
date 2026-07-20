// ============================================================
//  Asegura los precios del portal en Stripe (idempotente).
//
//  Lee el catálogo de la FUENTE ÚNICA (shared/servicios.js) y, para
//  cada `stripeLookupKey`, comprueba si existe un precio ACTIVO en la
//  cuenta de la clave que le pases. Crea SOLO los que faltan y sean
//  propios del portal (lookup_key con prefijo `gestadia_portal_`).
//  El precio de Canje es de Lidia → NUNCA se crea aquí, solo se informa.
//
//  La clave NO se comparte con nadie: va en tu propia terminal.
//
//  Uso (PowerShell):
//    $env:STRIPE_SECRET_KEY="sk_live_xxx"; node scripts/stripe-ensure-live-prices.mjs           # dry-run (solo informa)
//    $env:STRIPE_SECRET_KEY="sk_live_xxx"; node scripts/stripe-ensure-live-prices.mjs --apply    # crea lo que falte
//
//  Uso (Git Bash):
//    STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-ensure-live-prices.mjs [--apply]
// ============================================================
import Stripe from 'stripe';
import { SERVICIOS } from '../../shared/servicios.js';

const KEY = (process.env.STRIPE_SECRET_KEY || '').trim();
if (!KEY) {
  console.error('❌ Falta STRIPE_SECRET_KEY. Ponla en tu terminal (no la pegues en el chat).');
  process.exit(1);
}
const APPLY = process.argv.includes('--apply');
// Acepta claves estándar (sk_) y restringidas (rk_), en live o test.
const isLive = KEY.startsWith('sk_live_') || KEY.startsWith('rk_live_');
const isTest = KEY.startsWith('sk_test_') || KEY.startsWith('rk_test_');
const MODE = isLive ? 'LIVE' : isTest ? 'TEST' : 'DESCONOCIDO';
const CURRENCY = 'eur';
const PORTAL_PREFIX = 'gestadia_portal_';

const stripe = new Stripe(KEY);
const euros = (cents) => (cents / 100).toFixed(2) + ' €';

console.log(`\n▸ Cuenta en modo ${MODE} · ${APPLY ? 'APLICAR (crea lo que falte)' : 'DRY-RUN (solo informa)'}\n`);
if (MODE === 'DESCONOCIDO') {
  console.error('❌ La clave no parece de Stripe (esperado sk_live_/sk_test_/rk_live_/rk_test_). Aborto.');
  process.exit(1);
}

const items = Object.values(SERVICIOS).map((s) => ({
  slug: s.slug,
  nombre: s.nombre,
  lookupKey: s.stripeLookupKey,
  expected: Math.round(s.precio * 100),
  esPortal: s.stripeLookupKey.startsWith(PORTAL_PREFIX),
}));

let creados = 0, ok = 0, faltanExternos = 0, discrepancias = 0;

for (const it of items) {
  const found = await stripe.prices.list({ lookup_keys: [it.lookupKey], active: true, limit: 1 });
  const price = found.data[0];

  if (price) {
    const amountOk = price.unit_amount === it.expected && price.currency === CURRENCY;
    if (amountOk) {
      console.log(`✅ ${it.lookupKey}  ·  ${euros(price.unit_amount)}  ·  tax:${price.tax_behavior}  ·  ${price.id}`);
      ok++;
    } else {
      console.log(`⚠️  ${it.lookupKey}  EXISTE pero NO coincide → esperado ${euros(it.expected)}/${CURRENCY}, hay ${euros(price.unit_amount)}/${price.currency}  ·  ${price.id}`);
      discrepancias++;
    }
    continue;
  }

  // No existe
  if (!it.esPortal) {
    console.log(`❗ ${it.lookupKey}  NO existe y es EXTERNO (Canje/Lidia) → NO lo creo. Hay que crearlo/sincronizarlo en su catálogo, o el checkout de "${it.slug}" fallará.`);
    faltanExternos++;
    continue;
  }

  if (!APPLY) {
    console.log(`➕ ${it.lookupKey}  FALTA → se crearía a ${euros(it.expected)} (dry-run, no creado)`);
    creados++;
    continue;
  }

  const created = await stripe.prices.create({
    currency: CURRENCY,
    unit_amount: it.expected,
    lookup_key: it.lookupKey,
    tax_behavior: 'inclusive',
    nickname: it.nombre,
    product_data: { name: it.nombre, metadata: { portal_slug: it.slug } },
  });
  console.log(`🆕 ${it.lookupKey}  CREADO a ${euros(created.unit_amount)}  ·  ${created.id}`);
  creados++;
}

console.log('\n── Resumen ─────────────────────────────');
console.log(`   Correctos ya existentes : ${ok}`);
console.log(`   ${APPLY ? 'Creados' : 'A crear (dry-run)'}        : ${creados}`);
console.log(`   Discrepancias de importe: ${discrepancias}`);
console.log(`   Externos (Canje) a mano : ${faltanExternos}`);
if (!APPLY && creados > 0) console.log('\n   → Repite con  --apply  para crearlos de verdad.');
if (discrepancias > 0) console.log('\n   ⚠️  Revisa las discrepancias en el dashboard (los precios de Stripe no se editan: se archiva y se crea uno nuevo con el mismo lookup_key vía transfer_lookup_key).');
console.log('');
