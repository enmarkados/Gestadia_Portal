import { fileURLToPath } from 'node:url';

const contact = 'info@gestadia.com';
const logoPath = fileURLToPath(new URL('../assets/gestadia-email-logo.png', import.meta.url));
const legal = 'Defensa Legal Consumidores, S.L. · CIF B01813336. Tratamos tus datos para gestionar tu cuenta y los servicios solicitados, conforme al RGPD y la LOPDGDD. Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad en info@gestadia.com. Consulta las bases del tratamiento, destinatarios y criterios de conservación en nuestra política de privacidad.';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function origin(baseUrl) {
  const url = new URL(baseUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Origen de correo no válido');
  return url.origin;
}

function render({ baseUrl, titulo, nombre, paragraphs, action, actionPath, hint = '' }) {
  const base = origin(baseUrl);
  const actionUrl = `${base}${actionPath}`;
  const privacyUrl = `${base}/privacidad`;
  const p = text => `<p style="margin:0 0 18px;line-height:1.65;">${escape(text).replaceAll('\n', '<br>')}</p>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(titulo)}</title></head>
<body style="margin:0;padding:0;background:#f7f7f7;color:#2c2c2c;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f7;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e8e8e8;">
<tr><td style="padding:28px 32px;background:#2c2c2c;border-bottom:4px solid #c0392b;"><img src="cid:gestadia-logo" width="225" alt="Gestadia" style="display:block;max-width:100%;height:auto;border:0;"><p style="margin:12px 0 0;color:#ffffff;font-size:12px;letter-spacing:1px;">TU ÁREA DE CLIENTE</p></td></tr>
<tr><td style="padding:32px;font-size:16px;"><h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:26px;line-height:1.3;">${escape(titulo)}</h1>
${p(`Hola ${nombre || ''},`)}${paragraphs.map(p).join('')}
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#c0392b" style="border-radius:4px;"><a href="${escape(actionUrl)}" style="display:inline-block;padding:15px 24px;color:#ffffff;text-decoration:none;font-weight:bold;">${escape(action)}</a></td></tr></table>
<p style="margin:24px 0 12px;font-size:13px;line-height:1.6;color:#555555;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${escape(actionUrl)}" style="color:#a93226;word-break:break-all;">${escape(actionUrl)}</a></p>
${hint ? p(hint) : ''}<p style="margin:24px 0 0;line-height:1.6;">Un saludo,<br><strong>El equipo de Gestadia</strong></p></td></tr>
<tr><td style="padding:24px 32px;background:#f7f7f7;border-top:1px solid #e8e8e8;font-size:13px;line-height:1.6;"><strong>Estamos para ayudarte</strong><br><a href="mailto:${contact}" style="color:#a93226;">${contact}</a> · <a href="${base}" style="color:#a93226;">gestadia.com</a>
<p style="margin:20px 0 12px;font-size:11px;color:#555555;">${legal}</p><a href="${privacyUrl}" style="color:#a93226;font-size:11px;">Política de privacidad</a> · <a href="${base}/aviso-legal" style="color:#a93226;font-size:11px;">Aviso legal</a>
<p style="margin:12px 0 0;font-size:11px;color:#555555;">Este mensaje se dirige a su destinatario y puede contener información confidencial. Si lo has recibido por error, avísanos en ${contact} y evita compartirlo.</p></td></tr>
</table></td></tr></table></body></html>`;
  const text = ['GESTADIA', titulo, `Hola ${nombre || ''},`, ...paragraphs, `${action}: ${actionUrl}`, hint, 'El equipo de Gestadia', `Contacto: ${contact}`, legal, `Política de privacidad: ${privacyUrl}`, `Aviso legal: ${base}/aviso-legal`, `Si has recibido este mensaje por error, avísanos en ${contact} y evita compartirlo.`].filter(Boolean).join('\n\n');
  return { html, text, attachments: [{ filename: 'gestadia.png', path: logoPath, cid: 'gestadia-logo', contentType: 'image/png', contentDisposition: 'inline' }] };
}

export function recoveryEmail({ baseUrl, nombre, token }) {
  return render({ baseUrl, nombre, titulo: 'Recupera tu acceso a Gestadia', paragraphs: ['Hemos recibido una solicitud para crear una nueva contraseña de tu cuenta Gestadia.', 'El enlace caduca en 2 horas. Para continuar, pulsa el botón.'], action: 'Crear nueva contraseña', actionPath: `/portal/crear-clave/${encodeURIComponent(token)}`, hint: 'Si no has solicitado este cambio, ignora este correo. Tu contraseña seguirá siendo la misma.' });
}

export function welcomeEmail({ baseUrl, nombre, token, importe, titulo, pedido }) {
  const amount = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(importe));
  return render({ baseUrl, nombre, titulo: 'Pago recibido · Tu área de cliente', paragraphs: [`Hemos recibido tu pago de ${amount} € por ${titulo} (pedido ${pedido}).`, 'Crea tu contraseña para acceder a tu área de cliente, subir la documentación y consultar el estado de tu trámite.'], action: 'Crear mi contraseña', actionPath: `/portal/crear-clave/${encodeURIComponent(token)}` });
}

export function noticeEmail({ baseUrl, nombre, titulo, cuerpo }) {
  return render({ baseUrl, nombre, titulo, paragraphs: [cuerpo, 'Consulta la información y los siguientes pasos en tu área de cliente.'], action: 'Ver mi área de cliente', actionPath: '/portal/mis-servicios' });
}
