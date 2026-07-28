# Respuesta de Gestadia Portal — retención de idempotency_key y OK a vuestras desviaciones

**Fecha:** 2026-07-28
**Referencia:** vuestro mensaje "confirmamos contrato 1.0 y os pasamos
desviaciones + 4 confirmaciones"

Hola equipo,

Contrato 1.0 cerrado por ambas partes, pues. Nuestra parte ya está
**implementada, fusionada y con la migración de base de datos aplicada** — os
respondemos a la pregunta y a las cinco desviaciones.

## 1. Retención de la `idempotency_key`: indefinida

Es la respuesta que necesitabais y es la buena: **la clave no caduca nunca**.

- La `idempotency_key` es una columna única del registro del intent en nuestra
  base de datos, y **no existe ningún proceso de purga ni archivado**: el
  registro (y su clave) se conserva indefinidamente, también cuando el intent
  pasa a `paid`, `expired` o `cancelled`. La caducidad del enlace afecta solo
  a su `status`, jamás borra el registro.
- Por tanto vuestra recuperación es segura: si vuestro `POST` se corta sin
  respuesta, el reintento con la misma clave devuelve **siempre** el mismo
  intent (`200`, `reused: true`, con su `status` actual) o `409
  idempotency_conflict` si el payload difiere. **Un corte de red no puede
  producir dos intents en ningún escenario**, da igual cuánto tarde vuestra
  reconciliación en reintentar.
- Compromiso formal: si algún día introdujéramos archivado de registros
  antiguos, sería con preaviso a vosotros como cambio de contrato y con una
  retención mínima garantizada de 12 meses. Hoy no existe ni está previsto.

## 2. OK a vuestras cinco desviaciones — ninguna nos obliga a cambios

1. **`prefill` incompleto:** sin problema. Nuestro checkout trata TODO el
   prefill como opcional campo a campo: lo que llegue se rellena, lo que no
   (tipo/nº de documento, dirección) lo completa el cliente en el formulario,
   que ya los pide como parte del flujo normal.
2. **`importe_no_coincide` no recuperable:** compartimos el criterio al 100%
   — nunca re-presentar al cliente un precio distinto del anunciado. De
   nuestro lado el error incluye `amount_minor_catalogo` para que vuestra
   escalada interna vea de un vistazo la cifra correcta del catálogo.
3. **Coherencia Zoho verificada por vosotros:** perfecto. Mantenemos el
   comportamiento acordado: validamos formato y, ante un par incoherente,
   `409 zoho_reference_invalid` — no intentamos corregir nada por vosotros.
4. **Caso 20 parcial:** de acuerdo. En el acta de la matriz constará "caso 20
   parcial: comunicación post-pago probada dentro de la ventana de 24 h;
   fuera de ventana pendiente de plantilla aprobada por Meta". Cuando la
   tengáis, lo cerramos con una prueba puntual sin repetir toda la matriz.
5. **`canje_2_categorias` en otros agentes:** entendido y sin conflicto. Como
   red de seguridad, nuestro endpoint lo rechaza igualmente con
   `409 catalog_code_no_disponible` si llegara por error desde la tool
   dedicada.

## 3. Operativa

- **URLs base:** os pasamos las de staging y producción por el canal seguro
  junto con las credenciales (las confirmamos al fijar la ventana de
  pruebas).
- **API key por entorno:** os la generamos y enviamos por canal seguro.
  Aceptamos que el secreto HMAC + `key_id` de los callbacks lo generéis
  vosotros y nos lo paséis por el mismo canal — cualquiera de las dos partes
  puede generarlo; lo que importa es el canal y que sea distinto por entorno.
- **Contacto y Oportunidad de Zoho de prueba:** los creamos nosotros en el
  CRM (es nuestro) y os pasamos ambos IDs con las credenciales.
- **Vuestra URL de callback:** perfecto, la esperamos en cuanto despleguéis.
- **Rate limit:** mantenemos 60/min — holgadísimo para el volumen diario del
  piloto, como decís.

Cuando tengáis fecha para la ventana de staging, cerramos el intercambio del
§15 y a probar la matriz.

— Equipo Portal Gestadia
