// Helpers de Stripe para el checkout. Reciben el cliente `stripe` como
// parámetro para poder testearlos con un doble. Caché de lookup_key→price
// en memoria (los precios del catálogo cambian raras veces).
const priceCache = new Map();

export async function resolvePrice(stripe, lookupKey) {
  if (priceCache.has(lookupKey)) return priceCache.get(lookupKey);
  const res = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = res.data?.[0];
  if (!price) throw new Error(`No existe un precio de Stripe con lookup_key "${lookupKey}"`);
  priceCache.set(lookupKey, price.id);
  return price.id;
}

export async function getOrCreateCustomer(stripe, user) {
  // Los IDs de Stripe NO son intercambiables entre modo test y modo live: un
  // customer creado durante una ventana de pruebas (STRIPE_MODE=dev) no existe
  // en producción y haría fallar el cobro. Por eso se verifica que el customer
  // guardado exista en el modo actual; si no, se crea uno nuevo (el llamante
  // persiste el id devuelto).
  if (user.stripeCustomerId) {
    const existente = await stripe.customers.retrieve(user.stripeCustomerId).catch(() => null);
    if (existente && !existente.deleted) return existente;
    console.warn(`[stripe] customer ${user.stripeCustomerId} no existe en este modo; se crea uno nuevo`);
  }
  const email = String(user.email).trim().toLowerCase();
  const found = await stripe.customers.search({ query: `email:'${email}'`, limit: 1 }).catch(() => null);
  if (found?.data?.[0]) return found.data[0];
  return stripe.customers.create({
    email,
    name: `${user.nombre} ${user.apellidos || ''}`.trim(),
    phone: user.telefono || undefined,
    metadata: {
      external_provider: 'zoho',
      portal_user_id: user.id,
      ...(user.zohoContactId ? { external_id: user.zohoContactId } : {}),
    },
  });
}

export async function linkCustomerToZoho(stripe, customerId, zohoContactId) {
  if (!customerId || !zohoContactId) return;
  await stripe.customers.update(customerId, { metadata: { external_provider: 'zoho', external_id: zohoContactId } });
}
